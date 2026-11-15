import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

if (process.env.NODE_ENV === 'development') {
  import('eruda').then(eruda => eruda.default.init());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="https://miniapp.tonwon.xyz/tonconnect-manifest.json">
        <App />
    </TonConnectUIProvider>
  </StrictMode>,
);