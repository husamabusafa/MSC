import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
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
import { getRelatedData } from '../../data/mockData';

export const StorePage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const data = getRelatedData();

  const filteredProducts = data.products.filter(product => {
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
      const product = data.products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handleCheckout = () => {
    // Simulate API call
    console.log('Order placed:', {
      studentId: user?.id,
      items: Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
        price: data.products.find(p => p.id === productId)?.price || 0
      })),
      total: getCartTotal(),
      notes: orderNotes
    });
    
    setCart({});
    setIsCartOpen(false);
    setOrderNotes('');
    alert(t('store.orderPlaced'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.store')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Shop for academic supplies and materials
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={ShoppingCart}
          onClick={() => setIsCartOpen(true)}
          className="relative"
        >
          {t('store.cart')}
          {getCartItemCount() > 0 && (
                          <span className="absolute -top-2 -right-2 bg-student-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getCartItemCount()}
            </span>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
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
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {data.productCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} hover className="group">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {product.isSpecialOffer && (
                <div className="absolute top-2 left-2 bg-student-500 text-white text-xs px-2 py-1 rounded">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {t('store.specialOffer')}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {product.category?.name}
                </span>
                                  <span className="text-lg font-bold text-student-600 dark:text-student-400">
                  ${product.price}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                {product.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToCart(product.id)}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('store.addToCart')}
                </Button>
                
                {cart[product.id] && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(product.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-900 dark:text-white px-2">
                      {cart[product.id]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <div className="text-center py-12">
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
        title={t('store.cart')}
        size="lg"
      >
        <div className="space-y-4">
          {Object.keys(cart).length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = data.products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <div key={productId} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${product.price} each
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(productId)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-gray-900 dark:text-white px-2">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(productId)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${(product.price * quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <span>{t('store.total')}</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about your order..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCartOpen(false)}
                    className="flex-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCheckout}
                    className="flex-1"
                  >
                    {t('store.placeOrder')}
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