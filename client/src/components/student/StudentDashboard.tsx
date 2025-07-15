import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { 
  BookOpen, 
  Library, 
  ShoppingBag, 
  TrendingUp, 
  Award, 
  Clock,
  Users,
  Target
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';

export const StudentDashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const data = getRelatedData();

  const stats = [
    {
      title: t('nav.courses'),
      value: data.courses.length,
      icon: BookOpen,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    },
    {
      title: t('nav.library'),
      value: data.books.length,
      icon: Library,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    },
    {
      title: t('nav.store'),
      value: data.products.length,
      icon: ShoppingBag,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    },
    {
      title: t('academic.quizzes'),
      value: data.quizzes.length,
      icon: Target,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    }
  ];

  const recentActivity = [
    { action: 'Completed Mathematics Quiz', time: '2 hours ago', type: 'quiz' },
    { action: 'Borrowed Introduction to Algorithms', time: '1 day ago', type: 'library' },
    { action: 'Ordered Scientific Calculator', time: '3 days ago', type: 'store' },
    { action: 'Studied Programming Flashcards', time: '1 week ago', type: 'flashcards' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-student-500 to-student-600 text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t('dashboard.welcome')}, {user?.name}!
            </h2>
            <p className="text-student-100">
              {t('common.readyToContinue')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor} mr-4 rtl:ml-4 rtl:mr-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/student/courses"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-student-600 dark:text-student-400 mr-3 rtl:ml-3 rtl:mr-0" />
            <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('dashboard.browseCourses')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Explore available courses</p>
            </div>
          </a>
          
          <a
            href="/student/library"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Library className="w-8 h-8 text-student-600 dark:text-student-400 mr-3 rtl:ml-3 rtl:mr-0" />
            <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('dashboard.visitLibrary')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse and borrow books</p>
            </div>
          </a>
          
          <a
            href="/student/store"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ShoppingBag className="w-8 h-8 text-student-600 dark:text-student-400 mr-3 rtl:ml-3 rtl:mr-0" />
            <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('dashboard.shopStore')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse products</p>
            </div>
          </a>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-student-500 rounded-full"></div>
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