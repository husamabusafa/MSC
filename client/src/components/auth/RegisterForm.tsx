import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Mail, Lock, User, CreditCard, Eye, EyeOff } from 'lucide-react';

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

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    universityId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      setIsLoading(false);
      return;
    }

    if (!formData.universityId.trim()) {
      setError('Please enter your university ID');
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter a password');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.universityId);
      // Registration successful - no need to navigate, the AuthContext will handle user state
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, t('common.error'));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNavigateToLogin = () => {
    navigateToPath('/login');
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
        type="text"
        name="name"
        label={t('auth.fullName')}
        icon={User}
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Ahmed Hassan"
        disabled={isLoading}
      />

      <Input
        type="text"
        name="universityId"
        label={t('auth.universityId')}
        icon={CreditCard}
        value={formData.universityId}
        onChange={handleChange}
        required
        placeholder="ST002"
        disabled={isLoading}
      />

      <Input
        type="email"
        name="email"
        label={t('auth.email')}
        icon={Mail}
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="student@example.com"
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label={t('auth.password')}
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
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

      <div className="relative">
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          label={t('auth.confirmPassword')}
          icon={Lock}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="••••••••"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 rtl:left-3 rtl:right-auto top-8 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          disabled={isLoading}
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
        {t('auth.register')}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleNavigateToLogin}
          className="text-sm text-student-600 hover:text-student-800 dark:text-student-400 dark:hover:text-student-300 disabled:opacity-50"
          disabled={isLoading}
        >
          {t('auth.loginTitle')}
        </button>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong>{t('common.usePreRegistered')}</strong></p>
        <p>ST002 (Omar Al-Rashid)</p>
        <p>ST003 (Fatima Ibrahim)</p>
      </div>
    </form>
  );
};