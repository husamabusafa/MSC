import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { AuthContextType, User } from '../types';
import { 
  LOGIN_MUTATION, 
  GET_ME_QUERY,
  LoginInput,
  AuthResponse,
  UserResponse
} from '../lib/graphql/auth';
import { getToken, setToken, removeToken, isValidToken } from '../lib/jwt';
import { useNotification } from './NotificationContext';
import { useI18n } from './I18nContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper function to extract meaningful error messages
const extractErrorMessage = (error: any): string => {
  if (error?.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    if (graphQLError.extensions?.code === 'UNAUTHENTICATED') {
      return 'INVALID_CREDENTIALS'; // Return key for translation
    }
    if (graphQLError.extensions?.code === 'BAD_REQUEST') {
      return graphQLError.message || 'INVALID_REQUEST';
    }
    return graphQLError.message || 'AUTHENTICATION_FAILED';
  }
  
  if (error?.networkError) {
    if (error.networkError.statusCode === 401) {
      return 'INVALID_CREDENTIALS'; // Return key for translation
    }
    if (error.networkError.statusCode === 403) {
      return 'ACCESS_DENIED';
    }
    if (error.networkError.statusCode >= 500) {
      return 'SERVER_ERROR';
    }
    return 'NETWORK_ERROR';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'UNEXPECTED_ERROR';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useNotification();
  const { t } = useI18n();

  // GraphQL mutations and queries
  const [loginMutation] = useMutation<{ login: AuthResponse }, { loginInput: LoginInput }>(LOGIN_MUTATION);
  const { refetch: refetchMe } = useQuery<{ me: UserResponse }>(GET_ME_QUERY, {
    skip: true, // Skip initial fetch, we'll call it manually
  });

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      const token = getToken();
      if (token && isValidToken(token)) {
        try {
          const { data } = await refetchMe();
          if (data?.me) {
            setUser({
              id: data.me.id,
              email: data.me.email,
              name: data.me.name,
              role: data.me.role as 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN',
              universityId: data.me.universityId,
              isActive: data.me.isActive,
              createdAt: data.me.createdAt,
            });
          }
        } catch (error) {
          // Token is invalid, clear it
          removeToken();
          localStorage.removeItem('currentUser');
        }
      } else if (token) {
        // Token exists but is invalid/expired, clear it
        removeToken();
        localStorage.removeItem('currentUser');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [refetchMe]);

  const login = async (email: string, password: string) => {
    console.log('🔑 AuthContext: Starting login process for:', email);
    setIsLoading(true);
    try {
      console.log('📡 AuthContext: Sending GraphQL mutation...');
      const { data } = await loginMutation({
        variables: {
          loginInput: { email, password }
        }
      });

      console.log('📊 AuthContext: GraphQL response received:', data);

      if (data?.login) {
        const { accessToken, user: userData } = data.login;
        console.log('🎯 AuthContext: Login successful, setting token and user');
        
        // Store token and user data
        setToken(accessToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN',
          universityId: userData.universityId,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
        });
      } else {
        console.error('❌ AuthContext: No login data in response');
        throw new Error('Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('💥 AuthContext: Login error caught:', error);
      const errorMessage = extractErrorMessage(error);
      console.log('🔍 AuthContext: Extracted error message:', errorMessage);
      
      // Translate error message
      let translatedMessage = t('auth.invalidCredentials'); // Default fallback
      
      // Map error keys to translation keys
      if (errorMessage === 'INVALID_CREDENTIALS') {
        translatedMessage = t('auth.invalidCredentials');
      } else if (errorMessage === 'NETWORK_ERROR') {
        translatedMessage = t('auth.networkError');
      } else if (errorMessage === 'SERVER_ERROR') {
        translatedMessage = t('auth.serverError');
      } else if (errorMessage === 'ACCESS_DENIED') {
        translatedMessage = t('auth.accessDenied');
      } else if (errorMessage === 'UNEXPECTED_ERROR') {
        translatedMessage = t('auth.unexpectedError');
      } else {
        // Use the original message if it's not a known error key
        translatedMessage = errorMessage;
      }
      
      // Show error notification using the notification context
      showError(t('auth.login'), translatedMessage);
      
      // Still throw the error so calling components can handle it if needed
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};