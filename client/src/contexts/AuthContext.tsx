import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { AuthContextType, User } from '../types';
import { 
  LOGIN_MUTATION, 
  REGISTER_MUTATION, 
  GET_ME_QUERY,
  LoginInput,
  RegisterInput,
  AuthResponse,
  UserResponse
} from '../lib/graphql/auth';
import { getToken, setToken, removeToken, isValidToken } from '../lib/jwt';

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
      return 'Invalid email or password. Please try again.';
    }
    if (graphQLError.extensions?.code === 'BAD_REQUEST') {
      return graphQLError.message || 'Invalid request. Please check your information and try again.';
    }
    return graphQLError.message || 'Authentication failed. Please try again.';
  }
  
  if (error?.networkError) {
    if (error.networkError.statusCode === 401) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.networkError.statusCode === 403) {
      return 'Access denied. Please contact support.';
    }
    if (error.networkError.statusCode >= 500) {
      return 'Server error. Please try again later.';
    }
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL mutations and queries
  const [loginMutation] = useMutation<{ login: AuthResponse }, { loginInput: LoginInput }>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<{ register: AuthResponse }, { registerInput: RegisterInput }>(REGISTER_MUTATION);
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
              role: data.me.role as 'STUDENT' | 'ADMIN',
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
    setIsLoading(true);
    try {
      const { data } = await loginMutation({
        variables: {
          loginInput: { email, password }
        }
      });

      if (data?.login) {
        const { accessToken, user: userData } = data.login;
        
        // Store token and user data
        setToken(accessToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as 'STUDENT' | 'ADMIN',
          universityId: userData.universityId,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
        });
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, universityId: string) => {
    setIsLoading(true);
    try {
      const { data } = await registerMutation({
        variables: {
          registerInput: { email, password, name, universityId }
        }
      });

      if (data?.register) {
        const { accessToken, user: userData } = data.register;
        
        // Store token and user data
        setToken(accessToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as 'STUDENT' | 'ADMIN',
          universityId: userData.universityId,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
        });
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
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
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};