import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { 
  Users, 
  BookOpen, 
  Library, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  Package,
  FileText,
  AlertCircle
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const data = getRelatedData();

  const stats = [
    {
      title: t('dashboard.totalUsers'),
      value: data.users.length,
      icon: Users,
      color: 'text-admin-secondary-600 dark:text-admin-secondary-400',
      bgColor: 'bg-admin-secondary-100 dark:bg-admin-secondary-900/20',
      trend: '+12%'
    },
    {
      title: t('dashboard.totalCourses'),
      value: data.courses.length,
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      trend: '+8%'
    },
    {
      title: t('dashboard.totalBooks'),
      value: data.books.length,
      icon: Library,
      color: 'text-admin-600 dark:text-admin-400',
      bgColor: 'bg-admin-100 dark:bg-admin-900/20',
      trend: '+15%'
    },
    {
      title: t('dashboard.totalOrders'),
      value: data.orders.length,
      icon: ShoppingBag,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      trend: '+23%'
    }
  ];

  const pendingItems = [
    {
      title: 'Book Orders',
      count: data.bookOrders.filter(o => o.status === 'pending').length,
      icon: Library,
      href: '/admin/book-orders'
    },
    {
      title: 'Product Orders',
      count: data.orders.filter(o => o.status === 'pending').length,
      icon: ShoppingBag,
      href: '/admin/orders'
    },
    {
      title: 'Pre-registered Students',
      count: data.preRegisteredStudents.filter(s => !s.isUsed).length,
      icon: Users,
      href: '/admin/pre-registered'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove users',
      icon: Users,
      href: '/admin/users',
      color: 'text-admin-secondary-600 dark:text-admin-secondary-400'
    },
    {
      title: 'Add Course',
      description: 'Create new course content',
      icon: BookOpen,
      href: '/admin/courses',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Add Book',
      description: 'Add new books to library',
      icon: Library,
      href: '/admin/books',
      color: 'text-admin-600 dark:text-admin-400'
    },
    {
      title: 'Manage Store',
      description: 'Update products and orders',
      icon: ShoppingBag,
      href: '/admin/products',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-admin-500 to-admin-secondary-500 text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t('dashboard.welcome')}, {user?.name}!
            </h2>
            <p className="text-admin-100">
              {t('common.manageEfficiently')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
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

      {/* Pending Items */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.pendingOrders')}
          </h3>
          <AlertCircle className="w-5 h-5 text-orange-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {item.count} pending items
                </p>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h3>
        <div className="space-y-4">
          {[
            { action: 'New user registration: Ahmed Hassan', time: '2 hours ago', type: 'user' },
            { action: 'Book order approved: Introduction to Algorithms', time: '4 hours ago', type: 'library' },
            { action: 'New product added: Scientific Calculator', time: '1 day ago', type: 'store' },
            { action: 'Quiz created: CS Fundamentals', time: '2 days ago', type: 'academic' }
          ].map((activity, index) => (
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
    </div>
  );
};