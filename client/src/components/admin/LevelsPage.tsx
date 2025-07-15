import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  GET_LEVELS, 
  CREATE_LEVEL, 
  UPDATE_LEVEL, 
  DELETE_LEVEL,
  Level,
  CreateLevelInput,
  UpdateLevelInput
} from '../../lib/graphql/academic';

export const LevelsPage: React.FC = () => {
  const { t } = useI18n();
  const { showSuccess, showError } = useNotification();
  const { 
    confirmDelete, 
    isConfirmOpen, 
    isLoading: isDeleting, 
    currentConfirmation,
    handleConfirm,
    handleCancel
  } = useDeleteConfirmation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1,
    isVisible: true
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_LEVELS, {
    fetchPolicy: 'cache-and-network'
  });

  const [createLevel] = useMutation(CREATE_LEVEL, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('levels.created') || 'Level created successfully!');
    },
    onError: (error) => {
      showError(t('levels.createError') || 'Failed to create level', error.message);
    }
  });

  const [updateLevel] = useMutation(UPDATE_LEVEL, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('levels.updated') || 'Level updated successfully!');
    },
    onError: (error) => {
      showError(t('levels.updateError') || 'Failed to update level', error.message);
    }
  });

  const [deleteLevel] = useMutation(DELETE_LEVEL, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      showError(t('levels.deleteError') || 'Failed to delete level', error.message);
    }
  });

  const levels = data?.levels || [];
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

  const handleCreateLevel = () => {
    setSelectedLevel(null);
    setFormData({
      name: '',
      description: '',
      order: levels.length + 1,
      isVisible: true
    });
    setIsModalOpen(true);
  };

  const handleEditLevel = (level: Level) => {
    setSelectedLevel(level);
    setFormData({
      name: level.name,
      description: level.description,
      order: level.order,
      isVisible: level.isVisible
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedLevel) {
      // Update existing level
      const updateInput: UpdateLevelInput = {
        name: formData.name,
        description: formData.description,
        order: formData.order,
        isVisible: formData.isVisible
      };
      
      await updateLevel({
        variables: {
          id: selectedLevel.id,
          updateLevelInput: updateInput
        }
      });
    } else {
      // Create new level
      const createInput: CreateLevelInput = {
        name: formData.name,
        description: formData.description,
        order: formData.order,
        isVisible: formData.isVisible
      };
      
      await createLevel({
        variables: {
          createLevelInput: createInput
        }
      });
    }
  };

  const handleDeleteLevel = (level: Level) => {
    confirmDelete({
      title: t('common.confirmDelete') || 'Confirm Delete',
      message: `Are you sure you want to delete "${level.name}"? This action cannot be undone.`,
      confirmText: t('common.delete') || 'Delete',
      onConfirm: async () => {
        await deleteLevel({
          variables: {
            id: level.id
          }
        });
      },
      successMessage: t('levels.deleted') || 'Level deleted successfully',
      errorMessage: t('levels.deleteError') || 'Failed to delete level'
    });
  };

  const columns = [
    {
      key: 'order',
      label: t('common.orderColumn'),
      sortable: true,
      width: 'w-20',
      render: (level: Level) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="font-mono text-gray-900 dark:text-white">#{level.order}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (level: Level) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{level.name}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: t('common.description'),
      render: (level: Level) => (
        <span className="text-gray-600 dark:text-gray-400">{level.description}</span>
      )
    },
    {
      key: 'isVisible',
      label: t('common.visibility'),
      render: (level: Level) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {level.isVisible ? (
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
            {t('nav.levels')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('common.levelsManagementDescription')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateLevel}
        >
          {t('common.addLevel')}
        </Button>
      </div>

      {/* Levels Table */}
      <Card padding="sm">
        <DataTable
          data={sortedLevels}
          columns={columns}
          actions={(level) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditLevel(level)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteLevel(level)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No levels found"
          searchable={true}
          filterable={true}
          filterOptions={[
            {
              key: 'isVisible',
              label: t('common.visibility'),
              type: 'select',
              options: [
                { value: 'true', label: t('common.visible') },
                { value: 'false', label: t('common.hidden') }
              ]
            }
          ]}
        />
      </Card>

      {/* Level Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLevel ? t('common.editLevel') : t('common.addLevel')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="First Year"
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
              placeholder={t('common.foundationCourses')}
            />
          </div>
          
          <Input
            type="number"
            label={t('common.order')}
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
            min="1"
            required
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isVisible" className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.visibleToStudents')}
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
        isOpen={isConfirmOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={currentConfirmation?.title || ''}
        message={currentConfirmation?.message || ''}
        confirmText={currentConfirmation?.confirmText}
        loading={isDeleting}
      />
    </div>
  );
};