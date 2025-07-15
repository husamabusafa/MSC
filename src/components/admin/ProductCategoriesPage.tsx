import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  Tag
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { ProductCategory } from '../../types';

export const ProductCategoriesPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isVisible: true
  });
  const data = getRelatedData();

  const filteredCategories = data.productCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      isVisible: true
    });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      isVisible: category.isVisible
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Category saved:', formData);
    setIsModalOpen(false);
    alert(selectedCategory ? 'Category updated successfully' : 'Category created successfully');
  };

  const handleDeleteCategory = (category: ProductCategory) => {
    if (confirm('Are you sure you want to delete this category?')) {
      console.log('Delete category:', category.id);
      alert('Category deleted successfully');
    }
  };

  const getProductCount = (categoryId: string) => {
    return data.products.filter(product => product.categoryId === categoryId).length;
  };

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (category: ProductCategory) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: t('common.description'),
      render: (category: ProductCategory) => (
        <span className="text-gray-600 dark:text-gray-400">{category.description}</span>
      )
    },
    {
      key: 'products',
      label: 'Products',
      render: (category: ProductCategory) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{getProductCount(category.id)} products</span>
        </div>
      )
    },
    {
      key: 'isVisible',
      label: 'Visibility',
      render: (category: ProductCategory) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {category.isVisible ? (
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
            {t('nav.productCategories')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage product categories for the store
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateCategory}
        >
          Add Category
        </Button>
      </div>

      <Card>
        <Input
          icon={Search}
          placeholder={`${t('common.search')} categories...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card padding="sm">
        <DataTable
          data={filteredCategories}
          columns={columns}
          actions={(category) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditCategory(category)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteCategory(category)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No categories found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Stationery"
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
              placeholder="Office and study supplies"
            />
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
    </div>
  );
};