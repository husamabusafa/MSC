import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { Level } from '../../types';

export const LevelsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1,
    isVisible: true
  });
  const data = getRelatedData();

  const filteredLevels = data.levels.filter(level => {
    const matchesSearch = level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         level.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => a.order - b.order);

  const handleCreateLevel = () => {
    setSelectedLevel(null);
    setFormData({
      name: '',
      description: '',
      order: data.levels.length + 1,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Level saved:', formData);
    setIsModalOpen(false);
    alert(selectedLevel ? 'Level updated successfully' : 'Level created successfully');
  };

  const handleDeleteLevel = (level: Level) => {
    if (confirm('Are you sure you want to delete this level?')) {
      console.log('Delete level:', level.id);
      alert('Level deleted successfully');
    }
  };

  const columns = [
    {
      key: 'order',
      label: 'Order',
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
      label: 'Visibility',
      render: (level: Level) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {level.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Hidden</span>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.levels')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage academic levels and their order
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateLevel}
        >
          Add Level
        </Button>
      </div>

      <Card>
        <Input
          icon={Search}
          placeholder={`${t('common.search')} levels...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card padding="sm">
        <DataTable
          data={filteredLevels}
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
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLevel ? 'Edit Level' : 'Add Level'}
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
              placeholder="Foundation courses for first-year students"
            />
          </div>
          
          <Input
            type="number"
            label="Order"
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
    </div>
  );
};