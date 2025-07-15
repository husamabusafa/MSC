import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/common/Layout';
import { Router } from './Router';
import { apolloClient } from './lib/apollo-client';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <I18nProvider>
          <NotificationProvider>
            <AuthProvider>
              <Layout>
                <Router />
              </Layout>
            </AuthProvider>
          </NotificationProvider>
        </I18nProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;