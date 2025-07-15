import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { ShoppingCart, Package, Calendar, CreditCard } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const { t } = useI18n();
  
  const orders = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      items: ['علماء الرياضيات', 'آلة حاسبة علمية'],
      total: 150,
      status: 'مكتملة'
    },
    {
      id: 'ORD002', 
      date: '2024-01-10',
      items: ['أساسيات البرمجة', 'قلم رصاص'],
      total: 75,
      status: 'قيد التحضير'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <ShoppingCart className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('store.orderHistory')}
        </h1>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Package className="h-6 w-6 text-gray-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('store.order')} #{order.id}
                  </h3>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{order.date}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'مكتملة' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('store.items')}:
              </h4>
              <ul className="space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {t('store.total')}:
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {order.total} {t('common.currency')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 