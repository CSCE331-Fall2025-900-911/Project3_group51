import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App.jsx';

import { AccessibilityProvider } from './context/AccessibilityContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { LanguageProvider } from './hooks/useLanguage.js';  

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AccessibilityProvider>
        <UserProvider>
          <LanguageProvider>       {/* <-- Sharing language across many pages */}
            <App />
          </LanguageProvider>      
        </UserProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  </StrictMode>,
);
