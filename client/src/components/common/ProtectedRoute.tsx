import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/rolePermissions';
import { useI18n } from '../../contexts/I18nContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission }) => {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('auth.unauthorized')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.pleaseLogin')}
          </p>
        </div>
      </div>
    );
  }

  if (!hasPermission(user.role, permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('auth.accessDenied')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.noPermission')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 