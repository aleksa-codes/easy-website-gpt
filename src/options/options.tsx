import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Key, Trash2, Bot, ExternalLink } from 'lucide-react';
import { saveApiKey, getApiKey } from '@/lib/storage';
import { isValidOpenAIKey } from '@/lib/validate';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Options() {
  const [apiKey, setApiKey] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await getApiKey();
      if (savedKey) {
        setApiKey(savedKey);
      }
    };
    loadApiKey();
  }, []);

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    if (showError) {
      setShowError(false);
      setErrorMessage('');
    }
  };

  const handleSaveKey = async () => {
    const trimmedKey = apiKey.trim();

    if (trimmedKey.length === 0) {
      setShowError(true);
      setErrorMessage('API key cannot be empty');
      return;
    }

    if (!isValidOpenAIKey(trimmedKey)) {
      setShowError(true);
      setErrorMessage('Invalid API key format. Please enter a valid OpenAI API key');
      return;
    }

    await saveApiKey(trimmedKey);
    toast({
      title: 'API Key saved successfully',
      description: 'You can now start chatting with any webpage',
      duration: 2000,
    });
    setShowError(false);
    setErrorMessage('');
  };

  const handleRemoveKey = async () => {
    await saveApiKey('');
    setApiKey('');
    toast({
      title: 'API Key removed',
      description: 'Your API key has been removed from storage',
      duration: 2000,
    });
    setShowError(false);
  };

  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='mx-auto max-w-2xl space-y-8'>
        <motion.div className='flex items-center gap-3' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Bot className='h-10 w-10 text-primary' />
          <h1 className='text-3xl font-bold tracking-tight'>Easy WebsiteGPT</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className='space-y-8 rounded-xl p-6 shadow-md'>
            {/* About Section */}
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold tracking-tight'>About Easy WebsiteGPT</h2>
              <div className='space-y-4'>
                <p className='leading-relaxed'>
                  Easy WebsiteGPT is a Chrome extension that allows you to chat with any webpage using OpenAI's GPT
                  model. The extension analyzes the content of the current page and provides intelligent responses to
                  your questions.
                </p>
                <div className='flex items-center gap-2'>
                  <a
                    href='https://platform.openai.com/api-keys'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium transition-all hover:scale-105 hover:shadow-md'
                  >
                    <ExternalLink className='mr-2 h-4 w-4' />
                    Get API Key
                  </a>
                  <a
                    href='https://github.com/aleksa-codes/easy-website-gpt'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium transition-all hover:scale-105 hover:shadow-md'
                  >
                    <ExternalLink className='mr-2 h-4 w-4' />
                    View Source
                  </a>
                </div>
              </div>
            </div>

            {/* API Key Section */}
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='apiKey' className='text-base'>
                  OpenAI API Key
                </Label>
                <div className='flex gap-2'>
                  <Input
                    id='apiKey'
                    type='password'
                    value={apiKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder='sk-...'
                    className='flex-1 font-mono text-sm shadow-sm transition-colors focus-visible:ring-primary/50'
                  />
                  <Button
                    onClick={handleSaveKey}
                    className='shrink-0 rounded-full transition-all hover:scale-105 hover:shadow-md'
                    disabled={showError}
                  >
                    <Key className='mr-2 h-4 w-4' />
                    Save Key
                  </Button>
                  <Button
                    onClick={handleRemoveKey}
                    variant='destructive'
                    className='shrink-0 rounded-full transition-all hover:scale-105 hover:shadow-md'
                    disabled={!apiKey}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Remove Key
                  </Button>
                </div>
                <AnimatePresence>
                  {showError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant='destructive' className='mt-2'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Card className='rounded-lg bg-muted/50 p-4'>
                  <p className='text-sm leading-relaxed'>
                    Your API key is stored locally in your browser and is only used to communicate with OpenAI's
                    servers. We never store or transmit your API key to any other servers.
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className='text-center text-sm text-muted-foreground/60'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <a
            href='https://github.com/aleksa-codes'
            target='_blank'
            rel='noopener noreferrer'
            className='transition-colors duration-200 hover:text-primary'
          >
            created by <span className='font-semibold'>aleksa.codes</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
