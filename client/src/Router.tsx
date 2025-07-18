import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentLibraryPage } from './pages/student/StudentLibraryPage';
import { StudentStorePage } from './pages/student/StudentStorePage';
import { ProfilePage } from './pages/student/ProfilePage';
import { QuizPage } from './pages/student/QuizPage';
import { FlashcardsPage } from './pages/student/FlashcardsPage';
import { OrderHistoryPage } from './pages/student/OrderHistoryPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminLevelsPage } from './pages/admin/AdminLevelsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminBookOrdersPage } from './pages/admin/AdminBookOrdersPage';
import { AdminProductCategoriesPage } from './pages/admin/AdminProductCategoriesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminFlashcardsPage } from './pages/admin/AdminFlashcardsPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { AdminQuizCreatePage } from './pages/admin/AdminQuizCreatePage';
import { AdminQuizEditPage } from './pages/admin/AdminQuizEditPage';
import { AdminQuizQuestionsPage } from './pages/admin/AdminQuizQuestionsPage';
import { AdminGpaSubjectsPage } from './pages/admin/AdminGpaSubjectsPage';
import { AdminRegistrationRequestsPage } from './pages/admin/AdminRegistrationRequestsPage';
import { GpaCalculatorPage } from './pages/student/GpaCalculatorPage';

export const Router: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for navigation events
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for both popstate (back/forward) and custom navigation events
    window.addEventListener('popstate', handlePopState);
    
    // Initial path set
    setCurrentPath(window.location.pathname);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Authentication routes
  if (!user) {
    if (currentPath === '/register') {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  // Student routes
  if (user.role === 'STUDENT') {
    switch (currentPath) {
      case '/student':
      case '/student/dashboard':
        return <StudentDashboardPage />;
      case '/student/courses':
        return <StudentCoursesPage />;
      case '/student/library':
        return <StudentLibraryPage />;
      case '/student/store':
        return <StudentStorePage />;
      case '/student/profile':
        return <ProfilePage />;
      case '/student/orders':
        return <OrderHistoryPage />;
      case '/student/gpa-calculator':
        return <GpaCalculatorPage />;
      default:
        // Handle dynamic routes
        if (currentPath.startsWith('/student/quiz/')) {
          const courseId = currentPath.split('/')[3];
          return <QuizPage courseId={courseId} />;
        }
        if (currentPath.startsWith('/student/flashcards/')) {
          const courseId = currentPath.split('/')[3];
          return <FlashcardsPage courseId={courseId} />;
        }
        return <StudentDashboardPage />;
    }
  }

  // Admin routes
  const isAdmin = ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'LIBRARY_ADMIN', 'STORE_ADMIN'].includes(user.role);
  if (isAdmin) {
    switch (currentPath) {
      case '/admin/users':
        return <ProtectedRoute permission="users"><AdminUsersPage /></ProtectedRoute>;
      case '/admin/notifications':
        return <ProtectedRoute permission="notifications"><AdminNotificationsPage /></ProtectedRoute>;
      case '/admin/levels':
        return <ProtectedRoute permission="academic.levels"><AdminLevelsPage /></ProtectedRoute>;
      case '/admin/courses':
        return <ProtectedRoute permission="academic.courses"><AdminCoursesPage /></ProtectedRoute>;
      case '/admin/books':
        return <ProtectedRoute permission="library.books"><AdminBooksPage /></ProtectedRoute>;
      case '/admin/book-orders':
        return <ProtectedRoute permission="library.bookOrders"><AdminBookOrdersPage /></ProtectedRoute>;
      case '/admin/product-categories':
        return <ProtectedRoute permission="store.productCategories"><AdminProductCategoriesPage /></ProtectedRoute>;
      case '/admin/products':
        return <ProtectedRoute permission="store.products"><AdminProductsPage /></ProtectedRoute>;
      case '/admin/orders':
        return <ProtectedRoute permission="store.orders"><AdminOrdersPage /></ProtectedRoute>;
      case '/admin/flashcards':
        return <ProtectedRoute permission="academic.flashcards"><AdminFlashcardsPage /></ProtectedRoute>;
      case '/admin/quizzes':
        return <ProtectedRoute permission="academic.quizzes"><AdminQuizzesPage /></ProtectedRoute>;
      case '/admin/quizzes/create':
        return <ProtectedRoute permission="academic.quizzes"><AdminQuizCreatePage /></ProtectedRoute>;
      case '/admin/gpa-subjects':
        return <ProtectedRoute permission="academic.gpaSubjects"><AdminGpaSubjectsPage /></ProtectedRoute>;
      case '/admin/registration-requests':
        return <ProtectedRoute permission="registrationRequests"><AdminRegistrationRequestsPage /></ProtectedRoute>;
      default:
        // Handle dynamic routes
        if (currentPath.startsWith('/admin/quizzes/') && currentPath.endsWith('/edit')) {
          const quizId = currentPath.split('/')[3];
          return <ProtectedRoute permission="academic.quizzes"><AdminQuizEditPage quizId={quizId} /></ProtectedRoute>;
        }
        if (currentPath.startsWith('/admin/quizzes/') && currentPath.includes('/questions')) {
          const quizId = currentPath.split('/')[3];
          if (currentPath.endsWith('/questions')) {
            return <ProtectedRoute permission="academic.quizzes"><AdminQuizQuestionsPage quizId={quizId} /></ProtectedRoute>;
          }
        }
        return <ProtectedRoute permission="dashboard"><AdminDashboardPage /></ProtectedRoute>;
    }
  }

  return <div>Page not found</div>;
};