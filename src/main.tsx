import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

if (process.env.NODE_ENV === 'development') {
  import('eruda').then(eruda => eruda.default.init());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl="https://miniapp.tonwon.xyz/tonconnect-manifest.json"
      uiPreferences={{
        theme: THEME.DARK,
        colorsSet: {
          [THEME.DARK]: {
            connectButton: { background: '#ffe000', foreground: '#090b0f' },
            accent: '#ffe000',
            background: {
              primary: '#101318',
              secondary: '#171b22',
              segment: '#252b34',
              tint: '#1b2028',
            },
            text: { primary: '#ffffff', secondary: '#a3a3a3' },
          },
        },
      }}
    >
        <App />
    </TonConnectUIProvider>
  </StrictMode>,
);
