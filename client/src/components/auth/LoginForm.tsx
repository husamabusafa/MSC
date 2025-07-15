import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Helper function to navigate without page refresh
const navigateToPath = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Helper function to extract meaningful error messages
const getErrorMessage = (error: any, fallback: string): string => {
  if (error?.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors[0].message;
  }
  if (error?.networkError) {
    return 'Network error. Please check your connection and try again.';
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Login successful - no need to navigate, the AuthContext will handle user state
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, t('auth.invalidCredentials'));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigateToPath('/register');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <Input
        type="email"
        label={t('auth.email')}
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="student@example.com"
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          label={t('auth.password')}
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 rtl:left-3 rtl:right-auto top-8 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          disabled={isLoading}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        colorScheme="student"
        isLoading={isLoading}
        className="w-full"
        disabled={isLoading}
      >
        {t('auth.login')}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleNavigateToRegister}
          className="text-sm text-student-600 hover:text-student-800 dark:text-student-400 dark:hover:text-student-300 disabled:opacity-50"
          disabled={isLoading}
        >
          {t('auth.registerTitle')}
        </button>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong>{t('common.demoAccounts')}:</strong></p>
        <p>Student: student@example.com / password</p>
        <p>Admin: admin@example.com / password</p>
      </div>
    </form>
  );
};