import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Settings, Send, Loader2, Bot, RotateCcw, AlertTriangle } from 'lucide-react';
import { saveApiKey, getApiKey, saveChatHistory, getChatHistory, clearChatHistory } from './lib/storage';
import { getPageContent } from '@/lib/page-content';
import { sendToOpenAI } from '@/lib/openai';
import { ChatMessage } from '@/components/chat-message';
import { SettingsDialog } from '@/components/settings-dialog';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_MESSAGES = 20;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   role: 'user',
    //   content: 'How does this website work?',
    // },
    // {
    //   role: 'assistant',
    //   content:
    //     "This is a Chrome extension that allows you to chat with an AI about any webpage you're viewing. Simply enter your question in the input box below, and I'll analyze the page content to provide relevant answers.\n\nTo get started, you'll need to add your OpenAI API key in the settings (click the gear icon in the top right).",
    // },
  ]);
  const [input, setInput] = useState('');
  const [pageData, setPageData] = useState<{
    title: string;
    content: string;
    url: string;
    metadata: {
      description?: string;
      keywords?: string;
    };
  }>({
    title: '',
    content: '',
    url: '',
    metadata: {},
  });
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const isStreaming = useRef(false);

  useEffect(() => {
    const initializeApp = async () => {
      const storedKey = await getApiKey();
      if (storedKey) {
        setApiKey(storedKey);
      }

      const content = await getPageContent();
      setPageData(content);
      setCurrentUrl(content.url);

      const history = await getChatHistory(content.url);
      if (history.length > 0) {
        setMessages(history);
      }
    };

    initializeApp();
  }, []);

  const saveApiKeyHandler = async () => {
    if (apiKey) {
      await saveApiKey(apiKey);
      toast({
        title: 'API Key saved successfully',
        duration: 2000,
      });
    }
  };

  const removeApiKeyHandler = async () => {
    await saveApiKey('');
    setApiKey('');
    toast({
      title: 'API Key removed',
      duration: 2000,
    });
  };

  const resetConversation = async () => {
    setMessages([]);
    if (currentUrl) {
      await clearChatHistory(currentUrl);
    }
    toast({
      title: 'Conversation reset',
      duration: 2000,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey || !pageData.url) return;
    if (messages.length >= MAX_MESSAGES) return;

    const newMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    isStreaming.current = true;
    setStreamingMessage(''); // Reset streaming message

    try {
      // Add a placeholder assistant message for streaming
      const placeholderMessage: Message = { role: 'assistant', content: '' };
      setMessages([...updatedMessages, placeholderMessage]);

      const response = await sendToOpenAI(updatedMessages, apiKey, pageData, (chunk) => {
        setStreamingMessage((prev) => prev + chunk);
        scrollToBottom();
      });

      // Update the final message with proper typing
      const assistantMessage: Message = { role: 'assistant', content: response };
      const finalMessages: Message[] = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveChatHistory(pageData.url, finalMessages);
    } catch (error) {
      // Remove the placeholder message on error
      setMessages(updatedMessages);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 2000,
      });
    } finally {
      setLoading(false);
      isStreaming.current = false;
      setStreamingMessage('');
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className='bg-background flex h-[600px] w-[400px] flex-col overflow-hidden rounded-lg shadow-xl'>
      <Card className='bg-card/50 supports-[backdrop-filter]:bg-card/50 rounded-none border-x-0 border-t-0 border-b backdrop-blur-sm'>
        <div className='flex items-center justify-between p-4'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='flex items-center gap-2'
          >
            <div className='relative mx-auto h-10 w-10'>
              <div className='from-primary/20 to-primary/10 h-full w-full rounded-full bg-gradient-to-br p-2'>
                <Bot className='text-primary h-full w-full' />
              </div>
              <div className='border-background absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-green-500' />
            </div>
            <h1 className='text-lg font-semibold tracking-tight'>Easy WebsiteGPT</h1>
          </motion.div>
          <div className='flex items-center gap-2'>
            {messages.length > 0 && (
              <Button
                variant='ghost'
                size='icon'
                onClick={resetConversation}
                className='hover:bg-muted h-8 w-8 rounded-full'
                title='Reset conversation'
              >
                <RotateCcw className='h-4 w-4' />
              </Button>
            )}
            <SettingsDialog
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              onSaveApiKey={saveApiKeyHandler}
              onRemoveApiKey={removeApiKeyHandler}
              trigger={
                <Button variant='ghost' size='icon' className='hover:bg-muted h-8 w-8 rounded-full'>
                  <Settings className='h-4 w-4' />
                </Button>
              }
            />
          </div>
        </div>
      </Card>

      <AnimatePresence mode='wait'>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='flex flex-1 items-center justify-center p-4'
          >
            <div className='space-y-4 text-center'>
              <div className='relative mx-auto h-16 w-16'>
                <div className='from-primary/20 to-primary/10 h-full w-full rounded-full bg-gradient-to-br p-4'>
                  <Bot className='text-primary h-full w-full' />
                </div>
                <div className='border-background absolute right-0 bottom-1 h-4 w-4 rounded-full border-2 bg-green-500' />
              </div>
              <div className='space-y-2'>
                <p className='text-muted-foreground text-lg font-medium'>Welcome to Easy WebsiteGPT!</p>
                <p className='text-muted-foreground/60 text-sm'>Ask me anything about this webpage.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <ScrollArea className='flex-1 p-4 pb-0'>
            <div className='space-y-4 pb-4'>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  {...message}
                  content={
                    // Show streaming content for the last message if it's streaming
                    index === messages.length - 1 && isStreaming.current ? streamingMessage : message.content
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </AnimatePresence>

      <Card className='bg-card/50 supports-[backdrop-filter]:bg-card/50 rounded-none border-x-0 border-t border-b-0 p-4 backdrop-blur-sm'>
        <div className='flex flex-col gap-2'>
          {messages.length > 0 && (
            <div className='flex items-center justify-between px-1'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-xs'>
                  Messages: {messages.length}/{MAX_MESSAGES}
                </span>
                {messages.length >= MAX_MESSAGES && (
                  <span className='flex items-center gap-1 text-xs text-yellow-500'>
                    <AlertTriangle className='h-3 w-3' />
                    Limit reached
                  </span>
                )}
              </div>
              {messages.length >= MAX_MESSAGES && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={resetConversation}
                  className='text-muted-foreground hover:text-foreground h-6 rounded-full px-2 text-xs'
                >
                  <RotateCcw className='mr-1 h-3 w-3' />
                  New Chat
                </Button>
              )}
            </div>
          )}
          <div className='flex gap-2'>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                messages.length >= MAX_MESSAGES
                  ? 'Message limit reached...'
                  : apiKey
                    ? 'Ask about this page...'
                    : 'Please add your API key in settings...'
              }
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading || !apiKey || messages.length >= MAX_MESSAGES}
              className='border-muted bg-background/50 focus-visible:ring-primary/50 flex-1 rounded-full px-4 shadow-xs transition-colors'
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !apiKey || !input.trim() || messages.length >= MAX_MESSAGES}
              size='icon'
              className='h-10 w-10 rounded-full transition-all hover:scale-105 hover:shadow-md disabled:hover:scale-100'
            >
              {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App;
