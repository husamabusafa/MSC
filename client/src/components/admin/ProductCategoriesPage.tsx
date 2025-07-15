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
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Tag
} from 'lucide-react';
import { 
  GET_PRODUCT_CATEGORIES, 
  CREATE_PRODUCT_CATEGORY, 
  UPDATE_PRODUCT_CATEGORY, 
  DELETE_PRODUCT_CATEGORY,
  ProductCategory,
  CreateProductCategoryInput,
  UpdateProductCategoryInput
} from '../../lib/graphql/store';

export const ProductCategoriesPage: React.FC = () => {
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
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isVisible: true
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_CATEGORIES, {
    fetchPolicy: 'cache-and-network'
  });

  const [createProductCategory] = useMutation(CREATE_PRODUCT_CATEGORY, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('productCategories.categoryCreated'));
    },
    onError: (error) => {
      showError(t('productCategories.createError') || 'Failed to create category', error.message);
    }
  });

  const [updateProductCategory] = useMutation(UPDATE_PRODUCT_CATEGORY, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      showSuccess(t('productCategories.categoryUpdated'));
    },
    onError: (error) => {
      showError(t('productCategories.updateError') || 'Failed to update category', error.message);
    }
  });

  const [deleteProductCategory] = useMutation(DELETE_PRODUCT_CATEGORY, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      showError(t('productCategories.deleteError') || 'Failed to delete category', error.message);
    }
  });

  const categories = data?.productCategories || [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategory) {
      // Update existing category
      const updateInput: UpdateProductCategoryInput = {
        name: formData.name,
        description: formData.description,
        isVisible: formData.isVisible
      };
      
      await updateProductCategory({
        variables: {
          id: selectedCategory.id,
          input: updateInput
        }
      });
    } else {
      // Create new category
      const createInput: CreateProductCategoryInput = {
        name: formData.name,
        description: formData.description,
        isVisible: formData.isVisible
      };
      
      await createProductCategory({
        variables: {
          input: createInput
        }
      });
    }
  };

  const handleDeleteCategory = (category: ProductCategory) => {
    confirmDelete({
      title: t('common.confirmDelete') || 'Confirm Delete',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      confirmText: t('common.delete') || 'Delete',
      onConfirm: async () => {
        await deleteProductCategory({
          variables: {
            id: category.id
          }
        });
      },
      successMessage: t('productCategories.categoryDeleted') || 'Category deleted successfully',
      errorMessage: t('productCategories.deleteError') || 'Failed to delete category'
    });
  };

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (category: ProductCategory) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'isVisible',
      label: t('common.status'),
      sortable: true,
      render: (category: ProductCategory) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {category.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('common.visible')}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">{t('common.hidden')}</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      sortable: true,
      render: (category: ProductCategory) => (
        <span className="text-gray-900 dark:text-white">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
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
            {t('nav.productCategories')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('common.managementDescription')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateCategory}
        >
          {t('productCategories.createCategory')}
        </Button>
      </div>

      {/* Categories Table */}
      <Card padding="sm">
        <DataTable
          data={categories}
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
          emptyMessage={t('productCategories.noCategoriesFound')}
        />
      </Card>

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategory ? t('productCategories.editCategory') : t('productCategories.createCategory')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Electronics"
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
              placeholder="Category description..."
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
              {t('common.visible')}
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