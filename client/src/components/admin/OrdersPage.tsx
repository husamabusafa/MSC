import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  ShoppingBag, 
  Search,
  Check,
  X,
  Clock,
  User,
  Package,
  Calendar,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const data = getRelatedData();

  const filteredOrders = data.orders.filter(order => {
    const matchesSearch = order.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (status: 'completed' | 'cancelled') => {
    if (!selectedOrder) return;
    
    console.log('Update order status:', {
      orderId: selectedOrder.id,
      status,
      adminNotes
    });
    
    setIsModalOpen(false);
    alert(t('messages.success.orderUpdated'));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (order: Order) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          #{order.id.slice(0, 8)}
        </span>
      )
    },
    {
      key: 'student',
      label: 'Student',
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{order.student?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.student?.universityId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (order: Order) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
        </div>
      )
    },
    {
      key: 'total',
      label: t('store.total'),
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${order.total.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {getStatusIcon(order.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {t(`store.${order.status}`)}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.orders')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage product orders from students
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by student name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <DataTable
          data={filteredOrders}
          columns={columns}
          onRowClick={handleViewOrder}
          actions={(order) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewOrder(order)}
              >
                View Details
              </Button>
            </div>
          )}
          emptyMessage="No orders found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{selectedOrder.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {getStatusIcon(selectedOrder.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {t(`store.${selectedOrder.status}`)}
                </span>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.student?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">University ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.student?.universityId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.student?.email}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
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
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.product?.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  ${selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Student Notes */}
            {selectedOrder.studentNotes && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Student Notes</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300">{selectedOrder.studentNotes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this order..."
              />
            </div>

            {/* Actions */}
            {selectedOrder.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="danger"
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus('completed')}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};