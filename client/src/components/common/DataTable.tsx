import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';
import { Input } from './Input';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  searchable?: boolean;
  filterable?: boolean;
  filterOptions?: FilterOption[];
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  actions,
  searchable = true,
  filterable = true,
  filterOptions = [],
  pagination = true,
  pageSize = 10,
  emptyMessage
}: DataTableProps<T>) {
  const { t } = useI18n();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: any }>({});

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length + (searchTerm ? 1 : 0);
  };

  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm) {
      const searchMatch = columns.some(column => {
        const value = item[column.key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
      if (!searchMatch) return false;
    }

    // Custom filters
    for (const [key, value] of Object.entries(activeFilters)) {
      const filterOption = filterOptions.find(opt => opt.key === key);
      if (!filterOption) continue;

      const itemValue = item[key];
      
      if (filterOption.type === 'boolean') {
        if (value === true && !itemValue) return false;
      } else if (filterOption.type === 'select') {
        if (itemValue !== value) return false;
      } else if (filterOption.type === 'text') {
        if (typeof itemValue === 'string' && !itemValue.toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {filterable && filterOptions.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
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
                  icon={X}
                  onClick={clearAllFilters}
                  size="sm"
                >
                  {t('common.clearAll')}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && filterOptions.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'boolean' ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.key] || false}
                      onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {filter.placeholder || filter.label}
                    </label>
                  </div>
                ) : (
                  <Input
                    placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 rtl:space-x-reverse hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <span>{column.label}</span>
                      {sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage || t('common.noDataFound')}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t('common.previous')}
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}