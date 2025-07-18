import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { hasPermission } from '../../utils/rolePermissions';
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
  Bell,
  Package,
  ChevronRight,
  ChevronDown,
  Search,
  Home,
  Zap,
  Activity
} from 'lucide-react';
import { 
  GET_REGISTRATION_REQUESTS_COUNT_QUERY, 
  RegistrationRequestsCountResponse 
} from '../../lib/graphql/auth';
import { 
  GET_NOTIFICATIONS_COUNT, 
  NotificationsCountResponse 
} from '../../lib/graphql/notifications';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  icon: React.ComponentType<any>;
  href: string;
  permission?: string;
  subItems?: NavigationItem[];
  badge?: number;
}

const getNavigation = (userRole: string, registrationRequestsCount?: number, notificationsCount?: number): NavigationItem[] => [
  { id: 'dashboard', icon: Shield, href: '/admin', permission: 'dashboard' },
  { id: 'users', icon: Users, href: '/admin/users', permission: 'users' },
  { id: 'registrationRequests', icon: Users, href: '/admin/registration-requests', permission: 'registrationRequests' },
  { id: 'notifications', icon: Bell, href: '/admin/notifications', permission: 'notifications' },
  { 
    id: 'academic', 
    icon: GraduationCap, 
    href: '/admin/academic',
    subItems: [
      { id: 'levels', icon: GraduationCap, href: '/admin/levels', permission: 'academic.levels' },
      { id: 'courses', icon: BookOpen, href: '/admin/courses', permission: 'academic.courses' },
      { id: 'flashcards', icon: BookOpen, href: '/admin/flashcards', permission: 'academic.flashcards' },
      { id: 'quizzes', icon: BookOpen, href: '/admin/quizzes', permission: 'academic.quizzes' },
      { id: 'gpaSubjects', icon: GraduationCap, href: '/admin/gpa-subjects', permission: 'academic.gpaSubjects' }
    ]
  },
  { 
    id: 'library', 
    icon: Library, 
    href: '/admin/library',
    subItems: [
      { id: 'books', icon: BookOpen, href: '/admin/books', permission: 'library.books' },
      { id: 'bookOrders', icon: Package, href: '/admin/book-orders', permission: 'library.bookOrders' }
    ]
  },
  { 
    id: 'store', 
    icon: ShoppingBag, 
    href: '/admin/store',
    subItems: [
      { id: 'productCategories', icon: Package, href: '/admin/product-categories', permission: 'store.productCategories' },
      { id: 'products', icon: Package, href: '/admin/products', permission: 'store.products' },
      { id: 'orders', icon: ShoppingBag, href: '/admin/orders', permission: 'store.orders' }
    ]
  }
].filter((item: NavigationItem) => {
  // Check if the main item has permission
  if (item.permission && !hasPermission(userRole, item.permission)) {
    return false;
  }
  
  // For items with subItems, check if any subItem has permission
  if (item.subItems) {
    item.subItems = item.subItems.filter((subItem: NavigationItem) => 
      !subItem.permission || hasPermission(userRole, subItem.permission)
    );
    
    // If no subItems have permission, hide the main item
    if (item.subItems.length === 0) {
      return false;
    }
  }
  
  return true;
});

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to determine which groups should be expanded based on current path
  const getExpandedItemsForCurrentPath = (navigation: NavigationItem[], currentPath: string): string[] => {
    const expandedItems: string[] = [];
    
    navigation.forEach(item => {
      if (item.subItems) {
        // Check if any subitem's href matches the current path
        const hasActiveSubItem = item.subItems.some(subItem => currentPath === subItem.href);
        if (hasActiveSubItem) {
          expandedItems.push(item.id);
        }
      }
    });
    
    return expandedItems;
  };

  // Fetch registration requests count
  const { data: registrationRequestsData } = useQuery<{ registrationRequestsCount: RegistrationRequestsCountResponse }>(
    GET_REGISTRATION_REQUESTS_COUNT_QUERY,
    {
      skip: !user || !['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role),
      pollInterval: 30000, // Poll every 30 seconds for real-time updates
      errorPolicy: 'ignore'
    }
  );

  // Fetch notifications count
  const { data: notificationsData } = useQuery<{ notificationsCount: NotificationsCountResponse }>(
    GET_NOTIFICATIONS_COUNT,
    {
      skip: !user || !['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role),
      pollInterval: 30000, // Poll every 30 seconds for real-time updates
      errorPolicy: 'ignore'
    }
  );

  const currentPath = window.location.pathname;
  const isRTL = dir === 'rtl';

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const navigation = getNavigation(
    user?.role || 'STORE_ADMIN',
    registrationRequestsData?.registrationRequestsCount?.pending,
    notificationsData?.notificationsCount?.active
  );

  // Auto-expand groups based on current path
  React.useEffect(() => {
    const autoExpandedItems = getExpandedItemsForCurrentPath(navigation, currentPath);
    setExpandedItems(prev => {
      // Merge auto-expanded items with manually expanded items
      const combined = [...new Set([...prev, ...autoExpandedItems])];
      return combined;
    });
  }, [currentPath, navigation]);

  const filteredNavigation = navigation.filter(item => 
    searchQuery === '' || 
    t(`nav.${item.id}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subItems && item.subItems.some(subItem => 
      t(`nav.${subItem.id}`).toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside className={`
        fixed inset-y-0 z-50 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isRTL ? 'right-0' : 'left-0'}
        ${isRTL 
          ? sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          : sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-admin-500 to-admin-600">
          <div className={`flex items-center space-x-3 rtl:space-x-reverse transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <img 
                src="/logo_white.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="animate-in slide-in-from-left-5 duration-300">
                <span className="text-lg font-bold text-white">
                  {t('auth.adminPanel')}
                </span>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Activity className="w-3 h-3 text-white/70" />
                  <span className="text-xs text-white/70">
                    {t('dashboard.online')}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 hidden lg:block"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Search */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-5 duration-300">
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item, index) => {
            const isActive = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href));
            const isExpanded = expandedItems.includes(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div 
                key={item.id} 
                className="animate-in slide-in-from-left-5 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => hasSubItems ? toggleExpanded(item.id) : window.location.href = item.href}
                  className={`
                    w-full flex items-center justify-between space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-admin-500 to-admin-600 text-white shadow-lg transform scale-[1.02]' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`p-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                      <span>{t(`nav.${item.id}`)}</span>
                    )}
                  </div>
                  {!isCollapsed && hasSubItems && (
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                  )}
                </button>

                {hasSubItems && isExpanded && !isCollapsed && (
                  <div className="ml-6 rtl:mr-6 rtl:ml-0 mt-2 space-y-1 animate-in slide-in-from-top-3 duration-200">
                    {item.subItems?.map((subItem, subIndex) => {
                      const isSubActive = currentPath === subItem.href;
                      return (
                        <a
                          key={subItem.id}
                          href={subItem.href}
                          className={`
                            flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group animate-in slide-in-from-left-3 duration-200
                            ${isSubActive 
                              ? 'bg-admin-500/20 text-admin-600 dark:text-admin-400 border-r-2 border-admin-500' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                          `}
                          style={{ animationDelay: `${subIndex * 25}ms` }}
                        >
                          <div className={`p-1.5 rounded-md transition-all duration-200 ${isSubActive ? 'bg-admin-500/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                            <subItem.icon className="w-3 h-3" />
                          </div>
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

        {/* Enhanced User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mt-auto">
          <div className={`flex items-center space-x-3 rtl:space-x-reverse mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center relative ring-2 ring-white dark:ring-gray-800">
              <User className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="animate-in slide-in-from-left-5 duration-300">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('users.admin')}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Globe className="w-4 h-4" />
              {!isCollapsed && <span>{language === 'en' ? 'العربية' : 'English'}</span>}
            </button>

            <button
              onClick={toggleTheme}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'justify-center' : ''}`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              {!isCollapsed && <span>{t(`settings.${theme === 'light' ? 'dark' : 'light'}`)}</span>}
            </button>

            <button
              onClick={logout}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-[1.02] ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>{t('auth.logout')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 transition-all duration-300">
        {/* Enhanced Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-800/80">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 lg:hidden"
                >
                  <Menu className="w-6 h-6 text-gray-500" />
                </button>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="p-2 bg-admin-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-admin-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('dashboard.adminDashboard')}
                    </h1>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Zap className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('dashboard.systemStatus')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.welcome')}, {user?.name}
                </span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
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