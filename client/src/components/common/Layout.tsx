import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { StudentLayout } from './StudentLayout';
import { AdminLayout } from './AdminLayout';
import { AuthLayout } from './AuthLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { dir } = useI18n();
  const { theme } = useTheme();

  React.useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.className = theme;
  }, [dir, theme]);

  if (!user) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
  
  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <StudentLayout>{children}</StudentLayout>;
};