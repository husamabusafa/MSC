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
  Calculator,
  Search,
  Home,
  Zap,
  Activity,
  ChevronRight,
  Target,
  TrendingUp
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const filteredNavigation = navigation.filter(item => 
    searchQuery === '' || 
    t(`nav.${item.id}`).toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-student-500 to-student-600">
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
                  {t('auth.studentPanel')}
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
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-student-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item, index) => {
            const isActive = currentPath === item.href || (item.href !== '/student' && currentPath.startsWith(item.href));
            return (
              <div 
                key={item.id} 
                className="animate-in slide-in-from-left-5 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => navigateToPath(item.href)}
                  className={`
                    w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-student-500 to-student-600 text-white shadow-lg transform scale-[1.01]' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  {!isCollapsed && (
                    <span>{t(`nav.${item.id}`)}</span>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Enhanced Student Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className={`flex items-center space-x-3 rtl:space-x-reverse mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-student-500 to-student-600 flex items-center justify-center relative ring-2 ring-white dark:ring-gray-800">
              <User className="w-6 h-6 text-white" />
              {student?.isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 rtl:-left-1 rtl:-right-auto animate-pulse">
                  <UserCheck className="w-2 h-2 text-white m-0.5" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-in slide-in-from-left-5 duration-300">
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
            )}
          </div>

          {/* Enhanced Student Stats */}
          {studentDetails && !isCollapsed && (
            <div className="grid grid-cols-2 gap-3 mb-4 animate-in slide-in-from-bottom-5 duration-300">
              <div className="bg-white dark:bg-gray-600 rounded-xl p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  </div>
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
              
              <div className="bg-white dark:bg-gray-600 rounded-xl p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                    <Trophy className="w-4 h-4 text-green-500" />
                  </div>
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
          <div className="space-y-1">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 hover:scale-[1.01] ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Globe className="w-4 h-4" />
              {!isCollapsed && <span>{language === 'en' ? 'العربية' : 'English'}</span>}
            </button>

            <button
              onClick={toggleTheme}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 hover:scale-[1.01] ${isCollapsed ? 'justify-center' : ''}`}
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
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-[1.01] ${isCollapsed ? 'justify-center' : ''}`}
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
                  <div className="p-2 bg-student-500/10 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-student-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('dashboard.studentDashboard')}
                    </h1>
                    {studentDetails?.level && (
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Target className="w-3 h-3 text-student-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {studentDetails.level.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.welcome')}, {student?.name || user?.name}
                </span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {studentDetails?.gpa && (
                    <div className="flex items-center space-x-1 rtl:space-x-reverse bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {studentDetails.gpa.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-student-500 to-student-600 flex items-center justify-center">
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