import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

import { ConfirmationModal } from '../common/ConfirmationModal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { 
  GET_QUIZZES, 
  DELETE_QUIZ,
  GET_COURSES,
  Quiz,
  Course
} from '../../lib/graphql/academic';

export const QuizzesPage: React.FC = () => {
  const { t } = useI18n();
  const { showNotification } = useNotification();
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_QUIZZES, {
    fetchPolicy: 'cache-and-network'
  });

  const { data: coursesData } = useQuery(GET_COURSES);

  const [deleteQuiz] = useMutation(DELETE_QUIZ, {
    onCompleted: () => {
      refetch();
      showNotification('success', 'Quiz deleted successfully!');
    },
    onError: (error) => {
      showNotification('error', `Error deleting quiz: ${error.message}`);
    }
  });

  const quizzes = data?.quizzes || [];
  const courses = coursesData?.courses || [];

  const filteredQuizzes = quizzes.filter((quiz: Quiz) => {
    const matchesCourse = !selectedCourse || quiz.courseId === selectedCourse;
    return matchesCourse;
  });

  const handleCreateQuiz = () => {
    window.history.pushState({}, '', '/admin/quizzes/create');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleEditQuiz = (quiz: Quiz) => {
    window.history.pushState({}, '', `/admin/quizzes/${quiz.id}/edit`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };



  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      await deleteQuiz({
        variables: {
          id: quiz.id
        }
      });
    }
  };

  const columns = [
    {
      key: 'title',
      label: t('common.title'),
      sortable: true,
      render: (quiz: Quiz) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{quiz.title}</span>
        </div>
      )
    },
    {
      key: 'course',
      label: t('academic.course'),
      render: (quiz: Quiz) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-900 dark:text-white">{quiz.course?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.course?.level?.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'questions',
      label: t('common.questions'),
      render: (quiz: Quiz) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{quiz.questions?.length || 0} questions</span>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'المدة',
      render: (quiz: Quiz) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {quiz.hasDuration ? (
            <>
              <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xs">⏱</span>
              </div>
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                {quiz.durationMinutes} دقيقة
              </span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-white text-xs">∞</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                بدون توقيت
              </span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: t('common.description'),
      render: (quiz: Quiz) => (
        <span className="text-gray-600 dark:text-gray-400 line-clamp-2">{quiz.description}</span>
      )
    },
    {
      key: 'isVisible',
      label: t('common.visibility'),
      render: (quiz: Quiz) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {quiz.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('common.visible')}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.hidden')}</span>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.quizzes')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage quizzes and assessments for courses
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateQuiz}
        >
          Add Quiz
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map((course: Course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quizzes Table */}
      <Card padding="sm">
        <DataTable
          data={filteredQuizzes}
          columns={columns}
          actions={(quiz) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditQuiz(quiz)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteQuiz(quiz)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No quizzes found"
        />
      </Card>


    </div>
  );
};