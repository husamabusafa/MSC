import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { Layout } from './components/common/Layout';
import { Router } from './Router';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <Layout>
            <Router />
          </Layout>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;