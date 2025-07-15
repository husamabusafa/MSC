import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';
import { 
  GET_COURSES, 
  GET_LEVELS,
  CREATE_COURSE, 
  UPDATE_COURSE, 
  DELETE_COURSE,
  Course,
  Level,
  CreateCourseInput,
  UpdateCourseInput
} from '../../lib/graphql/academic';

export const CoursesPage: React.FC = () => {
  const { t } = useI18n();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    levelId: '',
    isVisible: true
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_COURSES, {
    fetchPolicy: 'cache-and-network'
  });

  const { data: levelsData } = useQuery(GET_LEVELS, {
    fetchPolicy: 'cache-and-network'
  });

  const [createCourse] = useMutation(CREATE_COURSE, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error creating course:', error);
    }
  });

  const [updateCourse] = useMutation(UPDATE_COURSE, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating course:', error);
    }
  });

  const [deleteCourse] = useMutation(DELETE_COURSE, {
    onCompleted: () => {
      setIsConfirmModalOpen(false);
      setCourseToDelete(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting course:', error);
    }
  });

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setFormData({
      name: '',
      description: '',
      levelId: '',
      isVisible: true
    });
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      levelId: course.levelId,
      isVisible: course.isVisible
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCourse) {
      // Update existing course
      const updateInput: UpdateCourseInput = {
        name: formData.name,
        description: formData.description,
        levelId: formData.levelId,
        isVisible: formData.isVisible
      };
      
      await updateCourse({
        variables: {
          id: selectedCourse.id,
          updateCourseInput: updateInput
        }
      });
    } else {
      // Create new course
      const createInput: CreateCourseInput = {
        name: formData.name,
        description: formData.description,
        levelId: formData.levelId,
        isVisible: formData.isVisible
      };
      
      await createCourse({
        variables: {
          createCourseInput: createInput
        }
      });
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (courseToDelete) {
      await deleteCourse({
        variables: {
          id: courseToDelete.id
        }
      });
    }
  };

  const courses = data?.courses || [];
  const levels = levelsData?.levels || [];

  const filteredCourses = courses.filter((course: Course) => {
    const matchesLevel = !selectedLevel || course.levelId === selectedLevel;
    return matchesLevel;
  });

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (course: Course) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{course.name}</span>
        </div>
      )
    },
    {
      key: 'level',
      label: t('academic.level'),
      render: (course: Course) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{course.level?.name}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: t('common.description'),
      render: (course: Course) => (
        <span className="text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</span>
      )
    },
    {
      key: 'isVisible',
      label: t('common.status'),
      render: (course: Course) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {course.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 dark:text-gray-400">Hidden</span>
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
            {t('nav.courses')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage courses and their content
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateCourse}
        >
          Add Course
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {levels.map((level: Level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Courses Table */}
      <Card padding="sm">
        <DataTable
          data={filteredCourses}
          columns={columns}
          actions={(course) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditCourse(course)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteCourse(course)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No courses found"
        />
      </Card>

      {/* Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Add Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('academic.level')}
            </label>
            <select
              value={formData.levelId}
              onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Level</option>
              {levels.map((level: Level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isVisible" className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-700 dark:text-gray-300">
              Visible to students
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteCourse}
        title={t('common.confirmDelete')}
        message={`${t('common.deleteMessage')} "${courseToDelete?.name}"?`}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};