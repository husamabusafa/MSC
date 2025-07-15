import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Mail, Lock, User, CreditCard, Eye, EyeOff } from 'lucide-react';

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('validation.passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t('validation.passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.universityId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
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
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 rtl:left-3 rtl:right-auto top-8 text-gray-400 hover:text-gray-600"
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
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 rtl:left-3 rtl:right-auto top-8 text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        {t('auth.register')}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => window.location.href = '/login'}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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