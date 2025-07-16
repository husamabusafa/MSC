import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

// Helper function to navigate without page refresh
const navigateToPath = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Zod validation schema - will be created inside component to access translations
const createLoginSchema = (t: any) => z.object({
  email: z
    .string()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
});

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isValidEmail, setIsValidEmail] = React.useState(false);

  const loginSchema = createLoginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields, isValid },
    watch,
    trigger,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    shouldFocusError: false,
    reValidateMode: 'onChange',
  });

  const watchedEmail = watch('email');

  // Check email validity on change
  React.useEffect(() => {
    const checkEmailValidity = async () => {
      if (watchedEmail && touchedFields.email) {
        const result = await trigger('email');
        setIsValidEmail(result);
      }
    };
    checkEmailValidity();
  }, [watchedEmail, touchedFields.email, trigger]);

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔐 Login form submitted with data:', { email: data.email, password: '***' });
    
    try {
      console.log('🚀 Attempting login...');
      await login(data.email, data.password);
      console.log('✅ Login successful!');
      // If login is successful, the AuthContext will handle navigation
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      // Error is now handled by AuthContext via notifications
      // Form data remains intact for user to correct and retry
    }
  };

  const handleNavigateToRegister = () => {
    navigateToPath('/register');
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log('🔄 Form submit event triggered');
    event.preventDefault();
    event.stopPropagation();
    handleSubmit(onSubmit)(event);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
        {/* Email Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="email"
              label={t('auth.email')}
              {...register('email')}
              placeholder="student@example.com"
              disabled={isSubmitting}
              className={`
                ${errors.email ? 'border-red-500 focus:border-red-500' : 
                  isValidEmail && touchedFields.email ? 'border-green-500 focus:border-green-500' : ''}
              `}
              endIcon={
                touchedFields.email ? (
                  isValidEmail ? CheckCircle : AlertCircle
                ) : undefined
              }
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 me-1 flex-shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label={t('auth.password')}
              {...register('password')}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`
                ${errors.password ? 'border-red-500 focus:border-red-500' : ''}
              `}
              endIcon={showPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowPassword(!showPassword)}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 me-1 flex-shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          colorScheme="student"
          isLoading={isSubmitting}
          className="w-full"
          disabled={isSubmitting || !isValid}
          icon={ArrowRight}
          iconPosition="right"
        >
          {t('auth.login')}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative bg-white dark:bg-gray-800 px-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('common.or')}
            </span>
          </div>
        </div>

        {/* Navigation to Register */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleNavigateToRegister}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <span>{t('auth.registerTitle')}</span>
            <ArrowRight className="w-4 h-4 ms-1 rtl:rotate-180" />
          </button>
        </div>
      </form>
    </div>
  );
};