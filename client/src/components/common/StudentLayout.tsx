import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuery, gql } from '@apollo/client';
import { 
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
  ShoppingCart,
  Trophy,
  Star,
  UserCheck,
  Calculator
} from 'lucide-react';

// GraphQL Query to fetch student data
const GET_STUDENT_DATA = gql`
  query GetStudentData {
    me {
      id
      name
      email
      role
      isActive
      studentDetails {
        id
        studentId
        level {
          id
          name
        }
        gpa
        enrolledCourses {
          id
          name
          code
        }
        completedCourses {
          id
          name
          code
        }
      }
    }
  }
`;

interface StudentLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { id: 'dashboard', icon: GraduationCap, href: '/student' },
  { id: 'courses', icon: BookOpen, href: '/student/courses' },
  { id: 'library', icon: Library, href: '/student/library' },
  { id: 'store', icon: ShoppingBag, href: '/student/store' },
  { id: 'gpaCalculator', icon: Calculator, href: '/student/gpa-calculator' },
  { id: 'profile', icon: User, href: '/student/profile' },
  { id: 'orders', icon: ShoppingCart, href: '/student/orders' }
];

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch student data
  const { data: studentData, loading } = useQuery(GET_STUDENT_DATA, {
    errorPolicy: 'ignore' // Ignore errors for now to prevent breaking the layout
  });

  const currentPath = window.location.pathname;
  const student = studentData?.me;
  const studentDetails = student?.studentDetails;
  const isRTL = dir === 'rtl';

  // Navigate without page refresh
  const navigateToPath = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setSidebarOpen(false);
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
        fixed inset-y-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isRTL ? 'right-0' : 'left-0'}
        ${isRTL 
          ? sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          : sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }
        ${isRTL ? 'lg:translate-x-0' : 'lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="p-2 bg-student-500 rounded-lg">
              <img 
                src="/logo_white.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('auth.studentPanel')}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = currentPath === item.href || (item.href !== '/student' && currentPath.startsWith(item.href));
            return (
              <button
                key={item.id}
                onClick={() => navigateToPath(item.href)}
                className={`
                  w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-student-500/10 text-student-500 dark:bg-student-500/20 dark:text-student-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{t(`nav.${item.id}`)}</span>
              </button>
            );
          })}
        </nav>

        {/* Student Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-student-500 to-student-600 flex items-center justify-center relative">
              <User className="w-6 h-6 text-white" />
              {student?.isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 rtl:-left-1 rtl:-right-auto">
                  <UserCheck className="w-2 h-2 text-white m-0.5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {student?.name || user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {studentDetails?.studentId || user?.email}
              </p>
              {studentDetails?.level && (
                <div className="flex items-center space-x-1 rtl:space-x-reverse mt-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {studentDetails.level.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Student Stats */}
          {studentDetails && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {t('academic.enrolledCourses')}
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {studentDetails.enrolledCourses?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Trophy className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {t('academic.gpa')}
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {studentDetails.gpa ? studentDetails.gpa.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                >
                  <Menu className="w-6 h-6 text-gray-500" />
                </button>

                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('dashboard.studentDashboard')}
                  </h1>
                  {studentDetails?.level && (
                    <span className="px-2 py-1 text-xs font-medium bg-student-100 text-student-700 dark:bg-student-900/20 dark:text-student-300 rounded-full">
                      {studentDetails.level.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.welcome')}, {student?.name || user?.name}
                </span>
                {studentDetails?.gpa && (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {studentDetails.gpa.toFixed(2)}
                    </span>
                  </div>
                )}
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