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
  Tag,
  DollarSign,
  Star
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { Product } from '../../types';

export const ProductsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    isVisible: true,
    isSpecialOffer: false
  });
  const data = getRelatedData();

  const filteredProducts = data.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
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
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Product saved:', formData);
    setIsModalOpen(false);
    alert(selectedProduct ? t('messages.success.productUpdated') : t('messages.success.productCreated'));
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(t('messages.confirmDelete.product'))) {
      console.log('Delete product:', product.id);
      alert(t('messages.success.productDeleted'));
    }
  };

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
            ${product.price.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'offers',
      label: 'Special Offer',
      render: (product: Product) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {product.isSpecialOffer ? (
            <>
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">Yes</span>
            </>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">No</span>
          )}
        </div>
      )
    },
    {
      key: 'isVisible',
      label: 'Visibility',
      render: (product: Product) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {product.isVisible ? (
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
            {t('nav.products')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage store products and their details
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

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={`${t('common.search')} products...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {data.productCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <DataTable
          data={filteredProducts}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Scientific Calculator"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('store.category')}
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {data.productCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
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
              placeholder="Advanced scientific calculator for engineering students"
            />
          </div>
          
          <Input
            type="number"
            step="0.01"
            label={t('store.price')}
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            min="0"
            required
            placeholder="45.99"
          />
          
          <Input
            label="Product Image URL"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSpecialOffer"
                checked={formData.isSpecialOffer}
                onChange={(e) => setFormData(prev => ({ ...prev, isSpecialOffer: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isSpecialOffer" className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                Special offer
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
    </div>
  );
};