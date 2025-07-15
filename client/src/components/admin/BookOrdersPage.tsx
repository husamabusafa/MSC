import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Package, 
  Check,
  X,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  Filter,
  FilterX
} from 'lucide-react';
import { 
  GET_BOOK_ORDERS,
  UPDATE_BOOK_ORDER,
  BookOrder,
  UpdateBookOrderInput,
  BookOrdersFilterInput
} from '../../lib/graphql/library';

export const BookOrdersPage: React.FC = () => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BookOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status: string;
    search: string;
  }>({
    status: '',
    search: ''
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_BOOK_ORDERS, {
    variables: { 
      filters: {
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  const [updateBookOrder] = useMutation(UPDATE_BOOK_ORDER, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      alert(t('bookOrders.orderUpdated'));
    },
    onError: (error) => {
      alert(`Error updating book order: ${error.message}`);
    }
  });

  const orders = data?.bookOrders?.bookOrders || [];

  const handleViewOrder = (order: BookOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedOrder) return;
    
    const updateInput: UpdateBookOrderInput = {
      status,
      adminNotes: adminNotes.trim() || undefined
    };
    
    await updateBookOrder({
      variables: {
        id: selectedOrder.id,
        updateBookOrderInput: updateInput
      }
    });
  };

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      search: ''
    });
    setIsFilterModalOpen(false);
    refetch();
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value.length > 0).length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'APPROVED':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const columns = [
    {
      key: 'id',
      label: t('bookOrders.id'),
      sortable: true,
      render: (order: BookOrder) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          #{order.id.slice(-8)}
        </span>
      )
    },
    {
      key: 'student',
      label: t('bookOrders.student'),
      sortable: true,
      render: (order: BookOrder) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{order.student?.name}</span>
        </div>
      )
    },
    {
      key: 'book',
      label: t('bookOrders.book'),
      sortable: true,
      render: (order: BookOrder) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{order.book?.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {order.book?.author}
            </p>
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
            {t(`bookOrders.${order.status}`)}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: t('bookOrders.createdAt'),
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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.bookOrders')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('bookOrders.managementDescription')}
          </p>
        </div>
              </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setIsFilterModalOpen(true)}
              className="relative"
            >
              {t('common.filter')}
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                icon={FilterX}
                onClick={handleClearFilters}
                size="sm"
              >
                {t('bookOrders.clearFilters')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Book Orders Table */}
      <Card padding="sm">
        <DataTable
          data={orders}
          columns={columns}
          actions={(order) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewOrder(order)}
            >
              {t('bookOrders.viewOrder')}
            </Button>
          )}
          emptyMessage={t('bookOrders.noOrdersFound')}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${t('bookOrders.orderDetails')} #${selectedOrder?.id.slice(-8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('bookOrders.orderInfo')}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>{t('common.student')}:</strong> {selectedOrder.student?.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>{t('common.date')}:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <strong>{t('common.status')}:</strong>
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {t(`bookOrders.${selectedOrder.status}`)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('bookOrders.bookDetails')}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>{t('common.title')}:</strong> {selectedOrder.book?.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>{t('common.author')}:</strong> {selectedOrder.book?.author}
                  </p>
                </div>
              </div>
            </div>

            {/* Student Notes */}
            {selectedOrder.studentNotes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('bookOrders.studentNotes')}
                </h3>
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
                {t('bookOrders.adminNotes')}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('bookOrders.adminNotesPlaceholder')}
              />
            </div>

            {/* Actions */}
                         {selectedOrder.status === 'PENDING' && (
               <div className="flex gap-3">
                 <Button
                   variant="primary"
                   onClick={() => handleUpdateStatus('APPROVED')}
                   className="flex-1"
                 >
                   {t('bookOrders.approve')}
                 </Button>
                 <Button
                   variant="danger"
                   onClick={() => handleUpdateStatus('REJECTED')}
                   className="flex-1"
                 >
                   {t('bookOrders.cancel')}
                 </Button>
               </div>
             )}
          </div>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title={t('common.filter')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('bookOrders.filterByStatus')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('bookOrders.allStatuses')}</option>
              <option value="PENDING">{t('bookOrders.PENDING')}</option>
              <option value="APPROVED">{t('bookOrders.APPROVED')}</option>
              <option value="REJECTED">{t('bookOrders.CANCELLED')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.search')}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('common.search')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              {t('bookOrders.applyFilters')}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              {t('bookOrders.clearFilters')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};