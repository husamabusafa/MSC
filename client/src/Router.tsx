import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentLibraryPage } from './pages/student/StudentLibraryPage';
import { StudentStorePage } from './pages/student/StudentStorePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPreRegisteredPage } from './pages/admin/AdminPreRegisteredPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminLevelsPage } from './pages/admin/AdminLevelsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminBookOrdersPage } from './pages/admin/AdminBookOrdersPage';
import { AdminProductCategoriesPage } from './pages/admin/AdminProductCategoriesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminFlashcardsPage } from './pages/admin/AdminFlashcardsPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { AdminGpaSubjectsPage } from './pages/admin/AdminGpaSubjectsPage';

export const Router: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentPath = window.location.pathname;

  // Authentication routes
  if (!user) {
    if (currentPath === '/register') {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  // Student routes
  if (user.role === 'student') {
    switch (currentPath) {
      case '/student/courses':
        return <StudentCoursesPage />;
      case '/student/library':
        return <StudentLibraryPage />;
      case '/student/store':
        return <StudentStorePage />;
      default:
        return <StudentDashboardPage />;
    }
  }

  // Admin routes
  if (user.role === 'admin') {
    switch (currentPath) {
      case '/admin/users':
        return <AdminUsersPage />;
      case '/admin/pre-registered':
        return <AdminPreRegisteredPage />;
      case '/admin/levels':
        return <AdminLevelsPage />;
      case '/admin/courses':
        return <AdminCoursesPage />;
      case '/admin/books':
        return <AdminBooksPage />;
      case '/admin/book-orders':
        return <AdminBookOrdersPage />;
      case '/admin/product-categories':
        return <AdminProductCategoriesPage />;
      case '/admin/products':
        return <AdminProductsPage />;
      case '/admin/orders':
        return <AdminOrdersPage />;
      case '/admin/flashcards':
        return <AdminFlashcardsPage />;
      case '/admin/quizzes':
        return <AdminQuizzesPage />;
      case '/admin/gpa-subjects':
        return <AdminGpaSubjectsPage />;
      default:
        return <AdminDashboardPage />;
    }
  }

  return <div>Page not found</div>;
};