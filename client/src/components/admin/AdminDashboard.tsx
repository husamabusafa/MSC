import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { hasPermission } from '../../utils/rolePermissions';
import { 
  Users, 
  BookOpen, 
  Library, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  Package,
  FileText,
  AlertCircle,
  GraduationCap,
  Bell,
  Settings,
  Shield
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const data = getRelatedData();

  // Role-specific stats
  const getAllStats = () => [
    {
      title: t('dashboard.totalUsers'),
      value: data.users.length,
      icon: Users,
      color: 'text-admin-secondary-600 dark:text-admin-secondary-400',
      bgColor: 'bg-admin-secondary-100 dark:bg-admin-secondary-900/20',
      trend: '+12%',
      permission: 'users'
    },
    {
      title: t('dashboard.totalCourses'),
      value: data.courses.length,
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      trend: '+8%',
      permission: 'academic.courses'
    },
    {
      title: t('dashboard.totalBooks'),
      value: data.books.length,
      icon: Library,
      color: 'text-admin-600 dark:text-admin-400',
      bgColor: 'bg-admin-100 dark:bg-admin-900/20',
      trend: '+15%',
      permission: 'library.books'
    },
    {
      title: t('dashboard.totalOrders'),
      value: data.orders.length,
      icon: ShoppingBag,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      trend: '+23%',
      permission: 'store.orders'
    },
    {
      title: t('dashboard.academicLevels'),
      value: data.levels.length,
      icon: GraduationCap,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      trend: '+5%',
      permission: 'academic.levels'
    },
    {
      title: t('dashboard.flashcardDecks'),
      value: data.flashcardDecks.length,
      icon: Package,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      trend: '+18%',
      permission: 'academic.flashcards'
    },
    {
      title: t('dashboard.productCategories'),
      value: data.productCategories.length,
      icon: Package,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-900/20',
      trend: '+7%',
      permission: 'store.productCategories'
    },
    {
      title: t('nav.products'),
      value: data.products.length,
      icon: ShoppingBag,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
      trend: '+14%',
      permission: 'store.products'
    }
  ];

  // Role-specific pending items
  const getAllPendingItems = () => [
    {
      title: t('dashboard.bookOrders'),
      count: data.bookOrders.filter(o => o.status === 'pending').length,
      icon: Library,
      href: '/admin/book-orders',
      permission: 'library.bookOrders'
    },
    {
      title: t('dashboard.productOrders'),
      count: data.orders.filter(o => o.status === 'pending').length,
      icon: ShoppingBag,
      href: '/admin/orders',
      permission: 'store.orders'
    },
    {
      title: t('dashboard.registrationRequests'),
      count: 3, // Mock count
      icon: FileText,
      href: '/admin/registration-requests',
      permission: 'registrationRequests'
    }
  ];

  // Role-specific quick actions
  const getAllQuickActions = () => [
    {
      title: t('dashboard.manageUsers'),
      description: t('dashboard.manageUsersDescription'),
      icon: Users,
      href: '/admin/users',
      color: 'text-admin-secondary-600 dark:text-admin-secondary-400',
      permission: 'users'
    },
    {
      title: t('dashboard.manageLevels'),
      description: t('dashboard.manageLevelsDescription'),
      icon: GraduationCap,
      href: '/admin/levels',
      color: 'text-purple-600 dark:text-purple-400',
      permission: 'academic.levels'
    },
    {
      title: t('dashboard.addCourse'),
      description: t('dashboard.addCourseDescription'),
      icon: BookOpen,
      href: '/admin/courses',
      color: 'text-green-600 dark:text-green-400',
      permission: 'academic.courses'
    },
    {
      title: t('dashboard.manageFlashcards'),
      description: t('dashboard.manageFlashcardsDescription'),
      icon: Package,
      href: '/admin/flashcards',
      color: 'text-indigo-600 dark:text-indigo-400',
      permission: 'academic.flashcards'
    },
    {
      title: t('dashboard.manageQuizzes'),
      description: t('dashboard.manageQuizzesDescription'),
      icon: FileText,
      href: '/admin/quizzes',
      color: 'text-blue-600 dark:text-blue-400',
      permission: 'academic.quizzes'
    },
    {
      title: t('dashboard.addBook'),
      description: t('dashboard.addBookDescription'),
      icon: Library,
      href: '/admin/books',
      color: 'text-admin-600 dark:text-admin-400',
      permission: 'library.books'
    },
    {
      title: t('dashboard.manageBookOrders'),
      description: t('dashboard.manageBookOrdersDescription'),
      icon: Library,
      href: '/admin/book-orders',
      color: 'text-cyan-600 dark:text-cyan-400',
      permission: 'library.bookOrders'
    },
    {
      title: t('dashboard.manageProductCategories'),
      description: t('dashboard.manageProductCategoriesDescription'),
      icon: Package,
      href: '/admin/product-categories',
      color: 'text-teal-600 dark:text-teal-400',
      permission: 'store.productCategories'
    },
    {
      title: t('dashboard.manageProducts'),
      description: t('dashboard.manageProductsDescription'),
      icon: ShoppingBag,
      href: '/admin/products',
      color: 'text-orange-600 dark:text-orange-400',
      permission: 'store.products'
    },
    {
      title: t('dashboard.manageStoreOrders'),
      description: t('dashboard.manageStoreOrdersDescription'),
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'text-pink-600 dark:text-pink-400',
      permission: 'store.orders'
    },
    {
      title: t('dashboard.manageRegistrationRequests'),
      description: t('dashboard.manageRegistrationRequestsDescription'),
      icon: FileText,
      href: '/admin/registration-requests',
      color: 'text-yellow-600 dark:text-yellow-400',
      permission: 'registrationRequests'
    },
    {
      title: t('dashboard.manageNotifications'),
      description: t('dashboard.manageNotificationsDescription'),
      icon: Bell,
      href: '/admin/notifications',
      color: 'text-red-600 dark:text-red-400',
      permission: 'notifications'
    }
  ];

  // Role-specific recent activity
  const getAllRecentActivity = () => [
    { action: `${t('dashboard.newUserRegistration')}: Ahmed Hassan`, time: `2 ${t('dashboard.hoursAgo')}`, type: 'user', permission: 'users' },
    { action: `${t('dashboard.bookOrderApproved')}: Introduction to Algorithms`, time: `4 ${t('dashboard.hoursAgo')}`, type: 'library', permission: 'library.bookOrders' },
    { action: `${t('dashboard.newProductAdded')}: Scientific Calculator`, time: `1 ${t('dashboard.dayAgo')}`, type: 'store', permission: 'store.products' },
    { action: `${t('dashboard.quizCreated')}: CS Fundamentals`, time: `2 ${t('dashboard.daysAgo')}`, type: 'academic', permission: 'academic.quizzes' },
    { action: `${t('dashboard.levelCreated')}: Master's Degree`, time: `3 ${t('dashboard.daysAgo')}`, type: 'academic', permission: 'academic.levels' },
    { action: `${t('dashboard.flashcardDeckUpdated')}: Mathematics`, time: `1 ${t('dashboard.weekAgo')}`, type: 'academic', permission: 'academic.flashcards' },
    { action: t('dashboard.registrationRequestApproved'), time: `1 ${t('dashboard.weekAgo')}`, type: 'registration', permission: 'registrationRequests' },
    { action: t('dashboard.notificationSent'), time: `2 ${t('dashboard.weeksAgo')}`, type: 'notification', permission: 'notifications' }
  ];

  // Filter items based on user permissions
  const stats = getAllStats().filter(stat => hasPermission(user?.role || '', stat.permission));
  const pendingItems = getAllPendingItems().filter(item => hasPermission(user?.role || '', item.permission));
  const quickActions = getAllQuickActions().filter(action => hasPermission(user?.role || '', action.permission));
  const recentActivity = getAllRecentActivity().filter(activity => hasPermission(user?.role || '', activity.permission));

  // Get role-specific welcome message
  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return t('dashboard.superAdminWelcome');
      case 'ACADEMIC_ADMIN':
        return t('dashboard.academicAdminWelcome');
      case 'LIBRARY_ADMIN':
        return t('dashboard.libraryAdminWelcome');
      case 'STORE_ADMIN':
        return t('dashboard.storeAdminWelcome');
      default:
        return t('common.manageEfficiently');
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return Shield;
      case 'ACADEMIC_ADMIN':
        return GraduationCap;
      case 'LIBRARY_ADMIN':
        return Library;
      case 'STORE_ADMIN':
        return ShoppingBag;
      default:
        return Users;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-admin-500 to-admin-secondary-500 text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t('dashboard.welcome')}, {user?.name}!
            </h2>
            <p className="text-admin-100 mb-1">
              {getRoleWelcomeMessage()}
            </p>
            <p className="text-sm text-admin-200">
              {t(`roles.${user?.role || 'STUDENT'}`)}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <RoleIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4 rtl:ml-4 rtl:mr-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {stat.trend}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Items */}
      {pendingItems.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.pendingItems')}
            </h3>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <item.icon className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3 rtl:ml-3 rtl:mr-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.count} {t('common.pendingItems')}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.quickActions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex flex-col items-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <action.icon className={`w-12 h-12 ${action.color} mb-3`} />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.recentActivity')}
          </h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-admin-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State for restricted roles */}
      {stats.length === 0 && pendingItems.length === 0 && quickActions.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <RoleIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('dashboard.welcomeToDashboard')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.roleSpecificContent')}
          </p>
        </Card>
      )}
    </div>
  );
};