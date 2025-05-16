import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import keycloak from './keycloak';


import { ReactKeycloakProvider } from '@react-keycloak/web';

// import ReactDOM from 'react-dom/client';
// import App from './App.tsx';
// import './index.css';
// import { ReactKeycloakProvider } from '@react-keycloak/web';
// import keycloak from './keycloak';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      onLoad: 'login-required',
      checkLoginIframe: false,
    }}
  >
    <App />
  </ReactKeycloakProvider>
);

