import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { Options } from '@/options/options';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Options />
    <Toaster />
  </StrictMode>,
);
