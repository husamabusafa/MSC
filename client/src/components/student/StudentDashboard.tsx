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
  Target,
  CheckCircle,
  TrendingDown,
  BarChart3,
  Calendar,
  Trophy,
  Star,
  Zap,
  Activity,
  BookOpenCheck,
  Brain,
  BarChart
} from 'lucide-react';
import { GET_COURSES } from '../../lib/graphql/academic';
import { GET_BOOKS } from '../../lib/graphql/library';
import { GET_PRODUCTS } from '../../lib/graphql/store';
import { GET_MY_QUIZ_ATTEMPTS } from '../../lib/graphql/academic';

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    course: {
      id: string;
      name: string;
    };
  };
}

export const StudentDashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);
  const { data: booksData, loading: booksLoading } = useQuery(GET_BOOKS);
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);
  const { data: quizAttemptsData, loading: quizAttemptsLoading } = useQuery(GET_MY_QUIZ_ATTEMPTS);

  const courses = coursesData?.courses || [];
  const books = booksData?.books || [];
  const products = productsData?.products || [];
  const quizAttempts: QuizAttempt[] = quizAttemptsData?.myQuizAttempts || [];

  // Calculate progress metrics
  const totalQuizzes = courses.reduce((total: number, course: any) => {
    return total + (course.quizzes?.filter((quiz: any) => quiz.isVisible).length || 0);
  }, 0);

  const completedQuizzes = quizAttempts.length;
  const averageScore = quizAttempts.length > 0 
    ? quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / quizAttempts.length
    : 0;

  const totalFlashcards = courses.reduce((total: number, course: any) => {
    return total + (course.flashcardDecks?.filter((deck: any) => deck.isVisible).reduce((deckTotal: number, deck: any) => {
      return deckTotal + (deck.cards?.length || 0);
    }, 0) || 0);
  }, 0);

  // Get recent attempts (last 5)
  const recentAttempts = quizAttempts
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  // Calculate performance trend
  const lastFiveAttempts = quizAttempts
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);
  
  const lastFiveAverage = lastFiveAttempts.length > 0 
    ? lastFiveAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / lastFiveAttempts.length
    : 0;

  // Get performance by course
  const performanceByCourse = courses.map((course: any) => {
    const courseAttempts = quizAttempts.filter(attempt => attempt.quiz.course.id === course.id);
    const courseAverage = courseAttempts.length > 0 
      ? courseAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / courseAttempts.length
      : 0;
    
    return {
      courseName: course.name,
      attempts: courseAttempts.length,
      average: courseAverage,
      totalQuizzes: course.quizzes?.filter((quiz: any) => quiz.isVisible).length || 0,
    };
  }).filter((course: any) => course.totalQuizzes > 0);

  const stats = [
    {
      title: t('nav.courses'),
      value: courses.length,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'المقررات المتاحة'
    },
    {
      title: 'الاختبارات المكتملة',
      value: completedQuizzes,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: `من إجمالي ${totalQuizzes} اختبار`
    },
    {
      title: 'متوسط الدرجات',
      value: `${averageScore.toFixed(1)}%`,
      icon: Trophy,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      description: 'في جميع الاختبارات'
    },
    {
      title: 'البطاقات التعليمية',
      value: totalFlashcards,
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'بطاقات متاحة للدراسة'
    }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (coursesLoading || booksLoading || productsLoading || quizAttemptsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.welcome')}, {user?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  تابع تقدمك الأكاديمي وإنجازاتك
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-student-100 to-student-200 dark:from-student-900/20 dark:to-student-800/20 rounded-lg">
                <Award className="w-8 h-8 text-student-600 dark:text-student-400" />
              </div>
            </div>
            
            {/* Overall Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  التقدم الإجمالي
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {completedQuizzes} من {totalQuizzes} اختبار
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0)}`}
                  style={{ width: `${totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {totalQuizzes > 0 ? ((completedQuizzes / totalQuizzes) * 100).toFixed(1) : 0}% مكتمل
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ملخص الأداء
              </h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  متوسط عام
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-student-600 dark:text-student-400">
                  {lastFiveAverage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  آخر 5 اختبارات
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                {lastFiveAverage > averageScore ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">تحسن في الأداء</span>
                  </div>
                ) : lastFiveAverage < averageScore ? (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span className="text-sm">يحتاج تحسين</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="text-sm">أداء ثابت</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Course Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quiz Attempts */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                الاختبارات الأخيرة
              </h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => {
                  const percentage = (attempt.score / attempt.totalQuestions) * 100;
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`p-2 rounded-lg ${getProgressColor(percentage) === 'bg-green-500' ? 'bg-green-100 dark:bg-green-900/20' : getProgressColor(percentage) === 'bg-yellow-500' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                          <Target className={`w-4 h-4 ${getGradeColor(percentage)}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.quiz.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {attempt.quiz.course.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${getGradeColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {attempt.score}/{attempt.totalQuestions}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <BookOpenCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">لم تقم بأي اختبارات بعد</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Course Progress */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                تقدم المقررات
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
                         <div className="space-y-4">
               {performanceByCourse.length > 0 ? (
                 performanceByCourse.map((course: any, index: number) => (
                   <div key={index} className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-gray-900 dark:text-white">
                         {course.courseName}
                       </span>
                       <span className="text-xs text-gray-500 dark:text-gray-400">
                         {course.attempts}/{course.totalQuizzes}
                       </span>
                     </div>
                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.totalQuizzes > 0 ? (course.attempts / course.totalQuizzes) * 100 : 0)}`}
                         style={{ width: `${course.totalQuizzes > 0 ? (course.attempts / course.totalQuizzes) * 100 : 0}%` }}
                       />
                     </div>
                     <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                       <span>التقدم: {course.totalQuizzes > 0 ? ((course.attempts / course.totalQuizzes) * 100).toFixed(1) : 0}%</span>
                       {course.attempts > 0 && (
                         <span className={getGradeColor(course.average)}>
                           المتوسط: {course.average.toFixed(1)}%
                         </span>
                       )}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-8">
                   <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                   <p className="text-gray-500 dark:text-gray-400">ابدأ الاختبارات لرؤية التقدم</p>
                 </div>
               )}
             </div>
          </div>
        </Card>
      </div>

             {/* Quick Actions */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="cursor-pointer" onClick={() => window.location.href = '/student/courses'}>
           <Card hover>
             <div className="p-6 text-center">
               <div className="p-4 bg-student-100 dark:bg-student-900/20 rounded-lg w-fit mx-auto mb-4">
                 <BookOpen className="w-8 h-8 text-student-600 dark:text-student-400" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                 استكشف المقررات
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 ابدأ دراسة المقررات المتاحة
               </p>
             </div>
           </Card>
         </div>

         <div className="cursor-pointer" onClick={() => window.location.href = '/student/library'}>
           <Card hover>
             <div className="p-6 text-center">
               <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto mb-4">
                 <Library className="w-8 h-8 text-blue-600 dark:text-blue-400" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                 المكتبة
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 اطلع على الكتب والمراجع
               </p>
             </div>
           </Card>
         </div>

         <div className="cursor-pointer" onClick={() => window.location.href = '/student/store'}>
           <Card hover>
             <div className="p-6 text-center">
               <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mx-auto mb-4">
                 <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                 المتجر
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 اطلب المنتجات والخدمات
               </p>
             </div>
           </Card>
         </div>
       </div>
    </div>
  );
};