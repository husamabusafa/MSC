import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { FilterPanel, FilterOption } from '../common/FilterPanel';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Calendar,
  Users,
  MessageSquare,
  Filter,
  FilterX
} from 'lucide-react';
import { 
  GET_NOTIFICATIONS, 
  CREATE_NOTIFICATION, 
  UPDATE_NOTIFICATION, 
  DELETE_NOTIFICATION,
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationsFilterInput
} from '../../lib/graphql/notifications';
import { GET_LEVELS, Level } from '../../lib/graphql/academic';

export const NotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const { showSuccess, showError } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [filters, setFilters] = useState<NotificationsFilterInput>({});
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    levelId: '',
    isActive: true
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network'
  });

  const { data: levelsData } = useQuery(GET_LEVELS, {
    fetchPolicy: 'cache-and-network'
  });

  const [createNotification] = useMutation(CREATE_NOTIFICATION, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('notifications.notificationCreated'));
    },
    onError: (error) => {
      showError(`Error creating notification: ${error.message}`);
    }
  });

  const [updateNotification] = useMutation(UPDATE_NOTIFICATION, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('notifications.notificationUpdated'));
    },
    onError: (error) => {
      showError(`Error updating notification: ${error.message}`);
    }
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => {
      setIsConfirmModalOpen(false);
      setNotificationToDelete(null);
      refetch();
      showSuccess(t('notifications.notificationDeleted'));
    },
    onError: (error) => {
      showError(`Error deleting notification: ${error.message}`);
    }
  });

  const handleCreateNotification = () => {
    setSelectedNotification(null);
    setFormData({
      title: '',
      message: '',
      levelId: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEditNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      levelId: notification.levelId || '',
      isActive: notification.isActive
    });
    setIsModalOpen(true);
  };

  const handleDeleteNotification = (notification: Notification) => {
    setNotificationToDelete(notification);
    setIsConfirmModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input: CreateNotificationInput | UpdateNotificationInput = {
      title: formData.title,
      message: formData.message,
      levelId: formData.levelId || undefined,
      isActive: formData.isActive
    };

    if (selectedNotification) {
      updateNotification({
        variables: {
          id: selectedNotification.id,
          updateNotificationInput: input
        }
      });
    } else {
      createNotification({
        variables: {
          createNotificationInput: input
        }
      });
    }
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification({
        variables: {
          id: notificationToDelete.id
        }
      });
    }
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const notifications = data?.notifications?.notifications || [];
  const levels = levelsData?.levels || [];

  const filterOptions: FilterOption[] = [
    {
      key: 'levelId',
      label: t('notifications.level'),
      type: 'select',
      options: [
        { value: '', label: t('common.all') },
        { value: 'null', label: t('notifications.allLevels') },
        ...levels.map((level: Level) => ({ value: level.id, label: level.name }))
      ]
    },
    {
      key: 'isActive',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: '', label: t('common.all') },
        { value: true, label: t('common.active') },
        { value: false, label: t('common.inactive') }
      ]
    },
    {
      key: 'search',
      label: t('common.search'),
      type: 'text',
      placeholder: t('notifications.searchPlaceholder')
    }
  ];

  const columns = [
    {
      key: 'title',
      label: t('notifications.title'),
      sortable: true,
      render: (notification: Notification) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {notification.message}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'levelName',
      label: t('notifications.targetLevel'),
      sortable: true,
      render: (notification: Notification) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {notification.levelName || t('notifications.allLevels')}
          </span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: t('common.status'),
      sortable: true,
      render: (notification: Notification) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          notification.isActive 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          {notification.isActive ? t('common.active') : t('common.inactive')}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      sortable: true,
      render: (notification: Notification) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.notifications')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('notifications.managementDescription')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateNotification}
        >
          {t('notifications.createNotification')}
        </Button>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {/* Notifications Table */}
      <Card padding="sm">
        <DataTable
          data={notifications}
          columns={columns}
          actions={(notification) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditNotification(notification)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteNotification(notification)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage={t('notifications.noNotificationsFound')}
        />
      </Card>

      {/* Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedNotification ? t('notifications.editNotification') : t('notifications.createNotification')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notifications.title')}
            </label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('notifications.titlePlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notifications.message')}
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={t('notifications.messagePlaceholder')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-admin-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="levelId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notifications.targetLevel')}
            </label>
            <select
              id="levelId"
              value={formData.levelId}
              onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-admin-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('notifications.allLevels')}</option>
              {levels.map((level: Level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-admin-600 focus:ring-admin-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('notifications.isActive')}
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {selectedNotification ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('notifications.deleteNotification')}
        message={t('notifications.deleteConfirmation')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  );
}; 