import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getLabelClasses } from '../common';
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
  const { t, dir } = useI18n();
  const { showSuccess, showError } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [filters, setFilters] = useState<UsersFilterInput>({});
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN',
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

  // Tab configuration
  const tabs = [
    {
      id: 'all',
      label: t('common.all'),
      filters: {}
    },
    {
      id: 'activeStudents',
      label: t('users.activeStudents'),
      filters: { role: 'STUDENT' as const, isActive: true }
    },
    {
      id: 'superAdmin',
      label: t('users.SUPER_ADMIN'),
      filters: { role: 'SUPER_ADMIN' as const }
    },
    {
      id: 'academicAdmin',
      label: t('users.ACADEMIC_ADMIN'),
      filters: { role: 'ACADEMIC_ADMIN' as const }
    },
    {
      id: 'libraryAdmin',
      label: t('users.LIBRARY_ADMIN'),
      filters: { role: 'LIBRARY_ADMIN' as const }
    },
    {
      id: 'storeAdmin',
      label: t('users.STORE_ADMIN'),
      filters: { role: 'STORE_ADMIN' as const }
    },
    {
      id: 'recentUsers',
      label: t('users.recentUsers'),
      filters: {}
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const selectedTab = tabs.find(tab => tab.id === tabId);
    if (selectedTab) {
      setFilters(selectedTab.filters);
    }
  };

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
      role: user.role as 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN',
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
      render: (user: User) => {
        const roleColors = {
          'STUDENT': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          'SUPER_ADMIN': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
          'ACADEMIC_ADMIN': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          'LIBRARY_ADMIN': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          'STORE_ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roleColors[user.role as keyof typeof roleColors] || roleColors['STUDENT']
          }`}>
            {t(`users.${user.role}`)}
          </span>
        );
      }
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-admin-500 text-admin-600 dark:text-admin-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 focus:ring-offset-2 transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

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
            <label className={getLabelClasses(dir)}>
              {t('users.name')}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={getLabelClasses(dir)}>
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
            <label className={getLabelClasses(dir)}>
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
            <label className={getLabelClasses(dir)}>
              {t('users.role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'STUDENT' | 'SUPER_ADMIN' | 'ACADEMIC_ADMIN' | 'LIBRARY_ADMIN' | 'STORE_ADMIN' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-admin-500"
            >
              <option value="STUDENT">{t('users.STUDENT')}</option>
              <option value="SUPER_ADMIN">{t('users.SUPER_ADMIN')}</option>
              <option value="ACADEMIC_ADMIN">{t('users.ACADEMIC_ADMIN')}</option>
              <option value="LIBRARY_ADMIN">{t('users.LIBRARY_ADMIN')}</option>
              <option value="STORE_ADMIN">{t('users.STORE_ADMIN')}</option>
            </select>
          </div>

          <div>
            <label className={getLabelClasses(dir)}>
              {t('users.universityId')}
            </label>
            <Input
              value={formData.universityId}
              onChange={(e) => setFormData(prev => ({ ...prev, universityId: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('users.status')}
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('users.inactive')}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-admin-300 dark:peer-focus:ring-admin-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-admin-600"></div>
              </label>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {t('users.active')}
              </span>
            </div>
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