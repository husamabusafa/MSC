import React from 'react';
import { useQuery } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
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
import { GET_COURSES } from '../../lib/graphql/academic';
import { GET_BOOKS } from '../../lib/graphql/library';
import { GET_PRODUCTS } from '../../lib/graphql/store';

export const StudentDashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);
  const { data: booksData, loading: booksLoading } = useQuery(GET_BOOKS);
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);

  const courses = coursesData?.courses || [];
  const books = booksData?.books || [];
  const products = productsData?.products || [];

  // Calculate total quizzes from all courses
  const totalQuizzes = courses.reduce((total: number, course: any) => {
    return total + (course.quizzes?.length || 0);
  }, 0);

  // Calculate total flashcards from all courses
  const totalFlashcards = courses.reduce((total: number, course: any) => {
    return total + (course.flashcardDecks?.reduce((deckTotal: number, deck: any) => {
      return deckTotal + (deck.cards?.length || 0);
    }, 0) || 0);
  }, 0);

  const stats = [
    {
      title: t('nav.courses'),
      value: courses.length,
      icon: BookOpen,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    },
    {
      title: t('nav.library'),
      value: books.length,
      icon: Library,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    },
    {
      title: t('nav.store'),
      value: products.length,
      icon: ShoppingBag,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    },
    {
      title: t('academic.quizzes'),
      value: totalQuizzes,
      icon: Target,
      color: 'text-student-600 dark:text-student-400',
      bgColor: 'bg-student-100 dark:bg-student-900/20'
    }
  ];

  if (coursesLoading || booksLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.welcome')}, {user?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('dashboard.studentWelcomeMessage')}
              </p>
            </div>
            <div className="p-3 bg-student-100 dark:bg-student-900/20 rounded-lg">
              <Award className="w-8 h-8 text-student-600 dark:text-student-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('dashboard.recentCourses')}
              </h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {courses.slice(0, 3).map((course: any) => (
                <div key={course.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="p-2 bg-student-100 dark:bg-student-900/20 rounded-lg">
                    <BookOpen className="w-4 h-4 text-student-600 dark:text-student-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {course.level?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('dashboard.quickStats')}
              </h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('academic.flashcards')}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalFlashcards}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('academic.quizzes')}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalQuizzes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('nav.courses')}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {courses.length}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};