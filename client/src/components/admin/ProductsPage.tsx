import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { FileUpload } from '../common/FileUpload';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Tag,
  DollarSign,
  Star
} from 'lucide-react';
import { 
  GET_PRODUCTS, 
  GET_PRODUCT_CATEGORIES,
  CREATE_PRODUCT, 
  UPDATE_PRODUCT, 
  DELETE_PRODUCT,
  Product,
  ProductCategory,
  CreateProductInput,
  UpdateProductInput,
  ProductsFilter
} from '../../lib/graphql/store';

export const ProductsPage: React.FC = () => {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductsFilter>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    isVisible: true,
    isSpecialOffer: false
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: { filter: filters },
    fetchPolicy: 'cache-and-network'
  });

  const { data: categoriesData } = useQuery(GET_PRODUCT_CATEGORIES, {
    fetchPolicy: 'cache-and-network'
  });

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    }
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    }
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      setIsConfirmModalOpen(false);
      setProductToDelete(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    }
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      image: '',
      isVisible: true,
      isSpecialOffer: false
    });
    setProductImageFile(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      image: product.image || '',
      isVisible: product.isVisible,
      isSpecialOffer: product.isSpecialOffer
    });
    setProductImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProduct) {
      // Update existing product
      const updateInput: UpdateProductInput = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        image: formData.image || undefined,
        isVisible: formData.isVisible,
        isSpecialOffer: formData.isSpecialOffer
      };
      
      await updateProduct({
        variables: {
          id: selectedProduct.id,
          input: updateInput
        }
      });
    } else {
      // Create new product
      const createInput: CreateProductInput = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        image: formData.image || undefined,
        isVisible: formData.isVisible,
        isSpecialOffer: formData.isSpecialOffer
      };
      
      await createProduct({
        variables: {
          input: createInput
        }
      });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProduct({
        variables: {
          id: productToDelete.id
        }
      });
    }
  };

  const handleFileUpload = (file: File | null, preview: string) => {
    setProductImageFile(file);
    setFormData(prev => ({ ...prev, image: preview }));
  };

  const products = data?.products?.products || [];
  const categories = categoriesData?.productCategories?.categories || [];

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{product.slug}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: t('store.category'),
      render: (product: Product) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{product.category?.name}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: t('store.price'),
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            {product.price.toFixed(2)} د.أ
          </span>
        </div>
      )
    },
    {
      key: 'isSpecialOffer',
      label: t('common.specialOffer'),
      render: (product: Product) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {product.isSpecialOffer ? (
            <>
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">{t('store.specialOffer')}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{t('common.regular')}</span>
          )}
        </div>
      )
    },
    {
      key: 'isVisible',
      label: t('common.status'),
      render: (product: Product) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {product.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('common.visible')}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 dark:text-gray-400">{t('common.hidden')}</span>
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
            {t('nav.products')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage store products and their categories
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateProduct}
        >
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card padding="sm">
        <DataTable
          data={products}
          columns={columns}
          actions={(product) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditProduct(product)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteProduct(product)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No products found"
        />
      </Card>

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <Input
            type="number"
            label="Price"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            step="0.01"
            min="0"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category: ProductCategory) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <FileUpload
            label="Product Image"
            value={formData.image}
            onChange={handleFileUpload}
            placeholder="Upload a product image"
          />
          
          <div className="flex items-center space-x-4">
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSpecialOffer"
                checked={formData.isSpecialOffer}
                onChange={(e) => setFormData(prev => ({ ...prev, isSpecialOffer: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isSpecialOffer" className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                Special Offer
              </label>
            </div>
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
        onConfirm={confirmDeleteProduct}
        title={t('common.confirmDelete')}
        message={`${t('common.deleteMessage')} "${productToDelete?.name}"?`}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};