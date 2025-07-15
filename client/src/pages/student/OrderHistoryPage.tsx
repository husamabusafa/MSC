import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  BookOpen, 
  Calendar, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { BookOrder, Book, Product } from '../../types';

interface BookOrderWithDetails extends BookOrder {
  type: 'book';
  book: Book | undefined;
  total: number;
}

interface ProductOrderWithDetails {
  type: 'product';
  id: string;
  studentId: string;
  status: string;
  total: number;
  studentNotes?: string;
  adminNotes?: string;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product: Product | undefined;
  }>;
}

type CombinedOrder = BookOrderWithDetails | ProductOrderWithDetails;

export const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'books' | 'products'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<CombinedOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = getRelatedData();

  const handleGoBack = () => {
    window.location.href = '/student/dashboard';
  };

  // Get user's book orders
  const userBookOrders = data.bookOrders.filter(order => order.studentId === user?.id);
  const bookOrdersWithDetails: BookOrderWithDetails[] = userBookOrders.map(order => ({
    ...order,
    type: 'book' as const,
    book: data.books.find(book => book.id === order.bookId),
    total: 0 // Books are free
  }));

  // Get user's product orders
  const userProductOrders = data.orders.filter(order => order.studentId === user?.id);
  const productOrdersWithDetails: ProductOrderWithDetails[] = userProductOrders.map(order => ({
    ...order,
    type: 'product' as const,
    items: order.items.map(item => ({
      ...item,
      product: data.products.find(product => product.id === item.productId)
    }))
  }));

  // Combine all orders
  const allOrders: CombinedOrder[] = [...bookOrdersWithDetails, ...productOrdersWithDetails];

  // Type guard functions
  const isBookOrder = (order: CombinedOrder): order is BookOrderWithDetails => {
    return order.type === 'book';
  };

  const isProductOrder = (order: CombinedOrder): order is ProductOrderWithDetails => {
    return order.type === 'product';
  };

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = isBookOrder(order) 
      ? order.book?.title.toLowerCase().includes(searchTerm.toLowerCase())
      : order.items.some((item: any) => 
          item.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    const matchesType = selectedType === 'all' || 
      (selectedType === 'books' && order.type === 'book') ||
      (selectedType === 'products' && order.type === 'product');
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('common.pending');
      case 'approved':
        return t('common.approved');
      case 'completed':
        return t('common.completed');
      case 'cancelled':
        return t('common.cancelled');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'approved':
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={handleGoBack}
        >
          {t('common.backToDashboard')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('common.orderHistory')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.orderHistoryDescription')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'books' | 'products')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('common.allTypes')}</option>
              <option value="books">{t('common.books')}</option>
              <option value="products">{t('common.products')}</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('common.allStatus')}</option>
              <option value="pending">{t('common.pending')}</option>
              <option value="approved">{t('common.approved')}</option>
              <option value="completed">{t('common.completed')}</option>
              <option value="cancelled">{t('common.cancelled')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('common.noOrdersFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' 
                ? t('common.tryAdjustingFilters')
                : t('common.noOrdersYet')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={`${order.type}-${order.id}`} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    order.type === 'book' 
                      ? 'bg-blue-100 dark:bg-blue-900/20' 
                      : 'bg-purple-100 dark:bg-purple-900/20'
                  }`}>
                    {order.type === 'book' ? (
                      <BookOpen className={`w-6 h-6 ${
                        order.type === 'book' 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-purple-600 dark:text-purple-400'
                      }`} />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                                           <h3 className="font-medium text-gray-900 dark:text-white">
                       {isBookOrder(order) ? (
                         order.book?.title || 'Unknown Book'
                       ) : (
                         `Product Order #${order.id.slice(-6)}`
                       )}
                     </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </div>
                                             {isBookOrder(order) ? (
                         <div className="flex items-center gap-1">
                           <BookOpen className="w-4 h-4" />
                           {t('library.bookBorrow')}
                         </div>
                       ) : (
                         <div className="flex items-center gap-1">
                           <Package className="w-4 h-4" />
                           {order.items.length} {order.items.length > 1 ? t('common.items') : t('common.item')}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {order.type === 'product' && (
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('common.total')}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewOrder(order)}
                  >
                    {t('common.viewDetails')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOrder?.type === 'book' ? t('library.bookDetails') : t('store.orderDetails')}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.orderId')}
                </label>
                <p className="text-gray-900 dark:text-white">#{selectedOrder.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.status')}
                </label>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.date')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.type')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedOrder.type === 'book' ? t('library.bookBorrow') : t('store.productPurchase')}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {selectedOrder.type === 'book' ? 'Book Details' : 'Order Items'}
              </h4>
              
                             {isBookOrder(selectedOrder) ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      {selectedOrder.book?.coverImage ? (
                        <img
                          src={selectedOrder.book.coverImage}
                          alt={selectedOrder.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.book?.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {selectedOrder.book?.author}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                                 <div className="space-y-3">
                   {isProductOrder(selectedOrder) && selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {item.product?.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {(selectedOrder.studentNotes || selectedOrder.adminNotes) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notes</h4>
                <div className="space-y-3">
                  {selectedOrder.studentNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                        Your Notes:
                      </p>
                      <p className="text-blue-800 dark:text-blue-400">
                        {selectedOrder.studentNotes}
                      </p>
                    </div>
                  )}
                  {selectedOrder.adminNotes && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Admin Notes:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedOrder.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Total */}
            {selectedOrder.type === 'product' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}; 