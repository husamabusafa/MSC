import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { User } from '../../types';

export const UsersPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT' as 'STUDENT' | 'ADMIN',
    universityId: '',
    isActive: true
  });
  const data = getRelatedData();

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.universityId && user.universityId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
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
      role: user.role,
      universityId: user.universityId || '',
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('User saved:', formData);
    setIsModalOpen(false);
    alert(selectedUser ? t('users.userUpdated') : t('users.userCreated'));
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(t('users.confirmDelete'))) {
      console.log('Delete user:', user.id);
      alert(t('users.userDeleted'));
    }
  };

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            {user.universityId && (
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.universityId}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: t('auth.email'),
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{user.email}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: t('users.role'),
      sortable: true,
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.role === 'ADMIN' 
            ? 'bg-admin-100 dark:bg-admin-900/20 text-admin-600 dark:text-admin-400'
            : 'bg-admin-secondary-100 dark:bg-admin-secondary-900/20 text-admin-secondary-600 dark:text-admin-secondary-400'
        }`}>
          {t(`users.${user.role}`)}
        </span>
      )
    },
    {
      key: 'isActive',
      label: t('common.status'),
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
      label: t('users.joinDate'),
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
          icon={Plus}
          onClick={handleCreateUser}
        >
          {t('users.createUser')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          icon={Search}
          placeholder={`${t('common.search')} users...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Users Table */}
      <Card padding="sm">
        <DataTable
          data={filteredUsers}
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
          <Input
            label={t('auth.fullName')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Input
            type="email"
            label={t('auth.email')}
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('users.role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'STUDENT' | 'ADMIN' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">{t('users.student')}</option>
              <option value="admin">{t('users.admin')}</option>
            </select>
          </div>
          
          {formData.role === 'STUDENT' && (
            <Input
              label={t('auth.universityId')}
              value={formData.universityId}
              onChange={(e) => setFormData(prev => ({ ...prev, universityId: e.target.value }))}
              placeholder="ST001"
            />
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isActive" className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('users.active')}
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
    </div>
  );
};