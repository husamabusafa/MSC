import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus,
  ShoppingCart,
  Star,
  Tag,
  Package
} from 'lucide-react';
import { GET_PRODUCTS, GET_PRODUCT_CATEGORIES } from '../../lib/graphql/store';

export const StorePage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_PRODUCT_CATEGORIES);
  
  const products = productsData?.products || [];
  const categories = categoriesData?.productCategories || [];

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.isVisible;
  });

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find((p: any) => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find((p: any) => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product);
  };

  const handleSubmitOrder = () => {
    const orderItems = getCartItems();
    console.log('Order submitted:', {
      studentId: user?.id,
      items: orderItems,
      notes: orderNotes,
      total: getCartTotal()
    });
    setCart({});
    setIsCartOpen(false);
    setOrderNotes('');
    // Show success message
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.store')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and order products from our store
          </p>
        </div>
        <Button
          variant="primary"
          colorScheme="student"
          icon={ShoppingCart}
          onClick={() => setIsCartOpen(true)}
        >
          Cart ({Object.keys(cart).length})
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? 'primary' : 'outline'}
                colorScheme="student"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  colorScheme="student"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: any) => (
          <Card key={product.id} hover className="group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-student-100 dark:bg-student-900/20 rounded-lg">
                  <Package className="w-6 h-6 text-student-600 dark:text-student-400" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.category?.name}
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-student-600 dark:group-hover:text-student-400 transition-colors">
                {product.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(product.id)}
                    disabled={!cart[product.id]}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px] text-center">
                    {cart[product.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToCart(product.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  colorScheme="student"
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <div className="p-6 text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      )}

      {/* Cart Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Shopping Cart"
      >
        <div className="space-y-4">
          {getCartItems().length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Your cart is empty
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {getCartItems().map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${product.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="min-w-[20px] text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(product.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total: ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Notes (optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-student-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Any special instructions or notes..."
                  />
                </div>
                
                <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    colorScheme="student"
                    onClick={handleSubmitOrder}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};