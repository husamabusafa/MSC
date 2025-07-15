import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Globe } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-50 to-student-100 dark:from-gray-900 dark:to-student-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title={t('settings.language')}
        >
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title={t('settings.theme')}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-student-500 rounded-full">
              <img 
                src="/logo_white.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
};