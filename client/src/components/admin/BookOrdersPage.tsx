import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  Package, 
  Search,
  Check,
  X,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { BookOrder } from '../../types';

export const BookOrdersPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BookOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const data = getRelatedData();

  const filteredOrders = data.bookOrders.filter(order => {
    const matchesSearch = order.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.book?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: BookOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (status: 'approved' | 'cancelled') => {
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
      case 'approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'returned':
        return <Package className="w-4 h-4 text-blue-500" />;
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
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'returned':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      sortable: true,
      render: (order: BookOrder) => (
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
      key: 'book',
      label: 'Book',
      render: (order: BookOrder) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{order.book?.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.book?.author}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (order: BookOrder) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {getStatusIcon(order.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {t(`library.${order.status}`)}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Request Date',
      sortable: true,
      render: (order: BookOrder) => (
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
            {t('nav.bookOrders')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage book borrowing requests from students
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by student name or book title..."
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
              <option value="approved">Approved</option>
              <option value="returned">Returned</option>
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
          emptyMessage="No book orders found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
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
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Book Information</h3>
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                  {selectedOrder.book?.coverImage ? (
                    <img
                      src={selectedOrder.book.coverImage}
                      alt={selectedOrder.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedOrder.book?.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.book?.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Available: {selectedOrder.book?.availableCopies}/{selectedOrder.book?.totalCopies}
                  </p>
                </div>
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
                placeholder="Add notes about this request..."
              />
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current Status:</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {getStatusIcon(selectedOrder.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {t(`library.${selectedOrder.status}`)}
                  </span>
                </div>
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus('cancelled')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus('approved')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};