import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { storyblokInit, apiPlugin } from '@storyblok/react';

storyblokInit({
  accessToken: (import.meta as any).env.VITE_STORYBLOK_TOKEN || '',
  use: [apiPlugin],
  components: {},
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
