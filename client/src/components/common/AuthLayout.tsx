import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Globe } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'minimal';
  showAnimation?: boolean;
  showLogo?: boolean;
  showLanguageToggle?: boolean;
  showThemeToggle?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children,
  variant = 'minimal',
  showAnimation = false,
  showLogo = true,
  showLanguageToggle = true,
  showThemeToggle = true
}) => {
  const { t, language, setLanguage, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const isRTL = dir === 'rtl';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {/* Controls */}
      <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex items-center gap-2 z-10`}>
        {showLanguageToggle && (
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            title={t('settings.language')}
          >
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            title={t('settings.theme')}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-300" />
            )}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md">
        {showLogo && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-lg">
                <img 
                  src="/logo_white.png" 
                  alt="Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('auth.loginSubtitle')}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.footerText') || 'Secure & Trusted Platform'}
          </p>
        </div>
      </div>
    </div>
  );
};