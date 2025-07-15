import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Shield, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Library, 
  ShoppingBag, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Globe,
  FileText,
  Package
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { id: 'dashboard', icon: Shield, href: '/admin' },
  { id: 'users', icon: Users, href: '/admin/users' },
  { id: 'preRegistered', icon: FileText, href: '/admin/pre-registered' },
  { 
    id: 'academic', 
    icon: GraduationCap, 
    href: '/admin/academic',
    subItems: [
      { id: 'levels', icon: GraduationCap, href: '/admin/levels' },
      { id: 'courses', icon: BookOpen, href: '/admin/courses' },
      { id: 'flashcards', icon: BookOpen, href: '/admin/flashcards' },
      { id: 'quizzes', icon: BookOpen, href: '/admin/quizzes' },
      { id: 'gpaSubjects', icon: GraduationCap, href: '/admin/gpa-subjects' }
    ]
  },
  { 
    id: 'library', 
    icon: Library, 
    href: '/admin/library',
    subItems: [
      { id: 'books', icon: BookOpen, href: '/admin/books' },
      { id: 'bookOrders', icon: Package, href: '/admin/book-orders' }
    ]
  },
  { 
    id: 'store', 
    icon: ShoppingBag, 
    href: '/admin/store',
    subItems: [
      { id: 'productCategories', icon: Package, href: '/admin/product-categories' },
      { id: 'products', icon: Package, href: '/admin/products' },
      { id: 'orders', icon: ShoppingBag, href: '/admin/orders' }
    ]
  }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const currentPath = window.location.pathname;

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        rtl:right-0 rtl:left-auto rtl:${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="p-2 bg-admin-500 rounded-lg">
              <img 
                src="/logo_white.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('auth.adminPanel')}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href));
            const isExpanded = expandedItems.includes(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id}>
                <button
                  onClick={() => hasSubItems ? toggleExpanded(item.id) : window.location.href = item.href}
                  className={`
                    w-full flex items-center justify-between space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-admin-500/10 text-admin-500 dark:bg-admin-500/20 dark:text-admin-500' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <item.icon className="w-5 h-5" />
                    <span>{t(`nav.${item.id}`)}</span>
                  </div>
                  {hasSubItems && (
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                {hasSubItems && isExpanded && (
                  <div className="ml-6 rtl:mr-6 rtl:ml-0 mt-2 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = currentPath === subItem.href;
                      return (
                        <a
                          key={subItem.id}
                          href={subItem.href}
                          className={`
                            flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isSubActive 
                              ? 'bg-admin-500/10 text-admin-500 dark:bg-admin-500/20 dark:text-admin-500' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{t(`nav.${subItem.id}`)}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-10 h-10 rounded-full bg-admin-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('users.admin')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span>{t(`settings.${theme === 'light' ? 'dark' : 'light'}`)}</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-500" />
              </button>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.adminDashboard')}
                </h1>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.welcome')}, {user?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};