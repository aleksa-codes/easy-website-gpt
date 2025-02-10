import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Trash2, AlertCircle, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isValidOpenAIKey } from '@/lib/validate';
import { useState, useEffect } from 'react';
import { saveApiKey } from '@/lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSaveApiKey: () => void;
  onRemoveApiKey: () => void;
  trigger: React.ReactNode;
}

export function SettingsDialog({ apiKey, onApiKeyChange, onSaveApiKey, onRemoveApiKey, trigger }: SettingsDialogProps) {
  const [inputValue, setInputValue] = useState(apiKey);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleKeyChange = (value: string) => {
    setInputValue(value);
    if (showError) {
      setShowError(false);
      setErrorMessage('');
    }
  };

  const handleSave = async () => {
    const trimmedKey = inputValue.trim();

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
    onApiKeyChange(trimmedKey);
    onSaveApiKey();
    setShowError(false);
    setErrorMessage('');

    toast('API Key saved successfully', {
      description: 'You can now start chatting with any webpage',
    });
  };

  const handleRemove = async () => {
    await saveApiKey('');
    setInputValue('');
    onRemoveApiKey();
    setShowError(false);
    setErrorMessage('');

    toast('API Key removed', {
      description: 'Your API key has been removed from storage',
    });
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='space-y-2.5 pb-4'>
          <DialogTitle className='flex items-center gap-2.5 text-xl font-semibold'>
            <div className='bg-primary/10 rounded-full p-1.5'>
              <Key className='text-primary h-5 w-5' />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-sm leading-relaxed'>
            Enter your API key to start chatting with any webpage using OpenAI's GPT model
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          {/* API Key Section */}
          <div className='space-y-3'>
            <div className='space-y-2.5'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Label htmlFor='apiKey' className='text-sm font-medium'>
                    API Key
                  </Label>
                  <a
                    href='https://platform.openai.com/api-keys'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all'
                  >
                    <ExternalLink className='h-3 w-3' />
                    Get API Key
                  </a>
                </div>
                <Button
                  onClick={handleRemove}
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 gap-1.5 rounded-full px-2.5 text-xs font-medium'
                  disabled={!apiKey}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Remove
                </Button>
              </div>

              <div className='flex gap-2'>
                <Input
                  id='apiKey'
                  type='password'
                  value={inputValue}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder='sk-...'
                  className='border-muted-foreground/20 bg-muted/50 placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-primary/50 flex-1 rounded-full font-mono text-sm shadow-xs transition-colors'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
                <Button
                  onClick={handleSave}
                  size='default'
                  className='rounded-full px-4 transition-all hover:scale-105 hover:shadow-md'
                  disabled={!inputValue.trim() || inputValue === apiKey}
                >
                  Save
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant='destructive' className='rounded-lg py-2'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription className='text-xs'>{errorMessage}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Section */}
          <div className='border-primary/10 bg-primary/5 rounded-lg border p-4'>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              Your API key is stored locally in your browser and is only used to communicate with OpenAI's servers. We
              never store or transmit your API key elsewhere.
            </p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between border-t pt-4'>
            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground hover:bg-primary/10 hover:text-primary h-8 gap-1.5 rounded-full px-3 text-xs font-medium transition-colors'
              onClick={openOptionsPage}
            >
              <ExternalLink className='h-3.5 w-3.5' />
              Advanced Settings
            </Button>

            <a
              href='https://github.com/aleksa-codes'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground/60 hover:text-primary text-xs transition-colors duration-200'
            >
              created by <span className='font-semibold'>aleksa.codes</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
