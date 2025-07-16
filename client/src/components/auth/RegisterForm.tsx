import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  CREATE_REGISTRATION_REQUEST_MUTATION, 
  CreateRegistrationRequestInput, 
  RegistrationRequestSubmissionResponse 
} from '../../lib/graphql/auth';

// Helper function to navigate without page refresh
const navigateToPath = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Zod validation schema - will be created inside component to access translations
const createRegisterSchema = (t: any) => z.object({
  name: z
    .string()
    .min(1, t('validation.fullNameRequired'))
    .min(2, t('validation.nameMinLength'))
    .max(50, t('validation.nameMaxLength')),
  universityId: z
    .string()
    .optional(),
  email: z
    .string()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.invalidEmail')),
  password: z
    .string()
    .min(1, t('validation.passwordRequired'))
    .min(8, t('validation.passwordMinLength'))
    .regex(/[a-z]/, t('validation.passwordLowercase'))
    .regex(/[A-Z]/, t('validation.passwordUppercase')),
  confirmPassword: z
    .string()
    .min(1, t('validation.confirmPasswordRequired')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordsDoNotMatch'),
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

export const RegisterForm: React.FC = () => {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const registerSchema = createRegisterSchema(t);

  const [createRegistrationRequest, { loading: isSubmitting }] = useMutation<
    { createRegistrationRequest: RegistrationRequestSubmissionResponse },
    { input: CreateRegistrationRequestInput }
  >(CREATE_REGISTRATION_REQUEST_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    
    try {
      const { data: response } = await createRegistrationRequest({
        variables: {
          input: {
            email: data.email,
            password: data.password,
            name: data.name,
            universityId: data.universityId || undefined,
          },
        },
      });

      if (response?.createRegistrationRequest.success) {
        setIsSuccess(true);
        reset();
      }
    } catch (error: any) {
      setServerError(error.message || 'An error occurred while submitting your registration request');
    }
  };

  const handleNavigateToLogin = () => {
    navigateToPath('/login');
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('auth.registrationRequestSubmitted')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.registrationRequestMessage')}
            </p>
          </div>
          <Button
            onClick={handleNavigateToLogin}
            variant="primary"
            size="lg"
            colorScheme="student"
            className="w-full"
          >
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Server Error */}
        {serverError && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 me-2 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              label={t('auth.fullName')}
              {...register('name')}
              placeholder="Ahmed Hassan"
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 me-1 flex-shrink-0" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* University ID Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              label={t('auth.universityId')}
              {...register('universityId')}
              placeholder="ST002 (Optional)"
              disabled={isSubmitting}
              className={errors.universityId ? 'border-red-500 focus:border-red-500' : ''}
            />
          </div>
          {errors.universityId && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 me-1 flex-shrink-0" />
              {errors.universityId.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="email"
              label={t('auth.email')}
              {...register('email')}
              placeholder="student@example.com"
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
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
              className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 me-1 flex-shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label={t('auth.confirmPassword')}
              {...register('confirmPassword')}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute end-3 top-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 me-1 flex-shrink-0" />
              {errors.confirmPassword.message}
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
          disabled={isSubmitting}
        >
          {t('auth.submitRegistrationRequest')}
        </Button>

        {/* Navigation to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleNavigateToLogin}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {t('auth.alreadyHaveAccount')} {t('auth.loginTitle')}
          </button>
        </div>

        {/* Info Message */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-medium">{t('auth.registrationNote')}</p>
          <p>{t('auth.registrationReviewMessage')}</p>
          <p>{t('auth.registrationAccessMessage')}</p>
        </div>
      </form>
    </div>
  );
};