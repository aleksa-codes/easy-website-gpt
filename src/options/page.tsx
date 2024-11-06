import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { OptionsPage } from '@/options/OptionsPage';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OptionsPage />
    <Toaster />
  </StrictMode>,
);
