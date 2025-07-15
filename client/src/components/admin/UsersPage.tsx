import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { DynamicFilter, FilterField } from '../common/DynamicFilter';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { 
  GET_USERS, 
  CREATE_USER, 
  UPDATE_USER, 
  DELETE_USER,
  User,
  CreateUserInput,
  UpdateUserInput,
  UsersFilterInput
} from '../../lib/graphql/users';

export const UsersPage: React.FC = () => {
  const { t } = useI18n();
  const { showSuccess, showError } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [filters, setFilters] = useState<UsersFilterInput>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'ADMIN',
    universityId: '',
    isActive: true
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network'
  });

  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('users.userCreated'));
    },
    onError: (error) => {
      showError(`Error creating user: ${error.message}`);
    }
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('users.userUpdated'));
    },
    onError: (error) => {
      showError(`Error updating user: ${error.message}`);
    }
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => {
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
      refetch();
      showSuccess(t('users.userDeleted'));
    },
    onError: (error) => {
      showError(`Error deleting user: ${error.message}`);
    }
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      universityId: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role as 'STUDENT' | 'ADMIN',
      universityId: user.universityId || '',
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUser) {
      // Update existing user
      const updateInput: UpdateUserInput = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        universityId: formData.universityId || undefined,
        isActive: formData.isActive
      };
      
      if (formData.password) {
        updateInput.password = formData.password;
      }
      
      await updateUser({
        variables: {
          id: selectedUser.id,
          updateUserInput: updateInput
        }
      });
    } else {
      // Create new user
      const createInput: CreateUserInput = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        universityId: formData.universityId || undefined,
        isActive: formData.isActive
      };
      
      await createUser({
        variables: {
          createUserInput: createInput
        }
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser({
        variables: {
          id: userToDelete.id
        }
      });
    }
  };

  const users = data?.users?.users || [];

  const columns = [
    {
      key: 'name',
      label: t('users.name'),
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-admin-500 to-admin-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: t('users.role'),
      sortable: true,
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'ADMIN' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {t(`users.${user.role}`)}
        </span>
      )
    },
    {
      key: 'universityId',
      label: t('users.universityId'),
      sortable: true,
      render: (user: User) => (
        <span className="text-gray-900 dark:text-white">
          {user.universityId || '-'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: t('users.status'),
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {user.isActive ? (
            <>
              <UserCheck className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('users.active')}</span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">{t('users.inactive')}</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: t('users.createdAt'),
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  // Define filter fields for the dynamic filter
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: t('common.search'),
      type: 'search',
      placeholder: t('common.searchByNameOrEmail'),
      width: 'half'
    },
    {
      key: 'role',
      label: t('users.role'),
      type: 'select',
      options: [
        { value: 'STUDENT', label: t('users.STUDENT') },
        { value: 'ADMIN', label: t('users.ADMIN') }
      ],
      width: 'quarter'
    },
    {
      key: 'isActive',
      label: t('users.status'),
      type: 'select',
      options: [
        { value: true, label: t('users.active') },
        { value: false, label: t('users.inactive') }
      ],
      width: 'quarter'
    },
    {
      key: 'createdDateRange',
      label: t('users.createdDateRange'),
      type: 'dateRange',
      width: 'half',
      transform: (value: { from?: string; to?: string }) => ({
        createdAfter: value.from,
        createdBefore: value.to
      })
    }
  ];

  // Filter presets
  const filterPresets = [
    {
      name: t('users.activeStudents'),
      filters: { role: 'STUDENT', isActive: true }
    },
    {
      name: t('users.admins'),
      filters: { role: 'ADMIN' }
    },
    {
      name: t('users.recentUsers'),
      filters: { 
        createdDateRange: { 
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
    }
  ];

  const handleFiltersChange = (newFilters: any) => {
    // Transform date range filter if it exists
    const graphQLFilters: UsersFilterInput = {};
    
    if (newFilters.search) {
      graphQLFilters.search = newFilters.search;
    }
    
    if (newFilters.role) {
      graphQLFilters.role = newFilters.role;
    }
    
    if (newFilters.isActive !== undefined) {
      graphQLFilters.isActive = newFilters.isActive;
    }

    // Handle date range transformation - commented out until server supports it
    // if (newFilters.createdDateRange) {
    //   if (newFilters.createdDateRange.from) {
    //     graphQLFilters.createdAfter = newFilters.createdDateRange.from;
    //   }
    //   if (newFilters.createdDateRange.to) {
    //     graphQLFilters.createdBefore = newFilters.createdDateRange.to;
    //   }
    // }
    
    setFilters(graphQLFilters);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.users')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('common.managementDescription')}
          </p>
        </div>
        <Button
          variant="primary"
          colorScheme="admin"
          icon={Plus}
          onClick={handleCreateUser}
        >
          {t('users.createUser')}
        </Button>
      </div>

      {/* Dynamic Filters */}
      <DynamicFilter
        fields={filterFields}
        onFiltersChange={handleFiltersChange}
        theme="admin"
        collapsible={true}
        layout="grid"
        showPresets={true}
        presets={filterPresets}
        showActiveCount={true}
        showClearAll={true}
      />

      {/* Users Table */}
      <Card padding="sm">
        <DataTable
          data={users}
          columns={columns}
          actions={(user) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditUser(user)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteUser(user)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage={t('users.noUsersFound')}
        />
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? t('users.editUser') : t('users.createUser')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('users.name')}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('users.email')}
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('users.password')} {selectedUser && '(leave blank to keep current)'}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!selectedUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('users.role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'STUDENT' | 'ADMIN' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-admin-500"
            >
              <option value="STUDENT">{t('users.STUDENT')}</option>
              <option value="ADMIN">{t('users.ADMIN')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('users.universityId')}
            </label>
            <Input
              value={formData.universityId}
              onChange={(e) => setFormData(prev => ({ ...prev, universityId: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-admin-600 border-gray-300 rounded focus:ring-admin-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
              {t('users.active')}
            </label>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              colorScheme="admin"
            >
              {selectedUser ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title={t('users.deleteUser')}
        message={t('users.deleteConfirmation')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  );
};