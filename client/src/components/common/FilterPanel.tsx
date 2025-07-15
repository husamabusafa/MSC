import React, { useState } from 'react';
import { Filter, X, Search, Calendar, ChevronDown } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';
import { Input } from './Input';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'multiSelect';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onFiltersChange: (filters: { [key: string]: any }) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  className = ""
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: any }>({});

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  const getFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = activeFilters[filter.key] || '';

    switch (filter.type) {
      case 'text':
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || `Filter by ${filter.label}`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            icon={Search}
          />
        );

      case 'select':
        return (
          <div key={filter.key} className="relative">
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'date':
        return (
          <div key={filter.key} className="relative">
            <input
              type="date"
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'boolean':
        return (
          <div key={filter.key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={filter.key}
              checked={value === true}
              onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={filter.key} className="text-sm text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Filter}
              onClick={() => setIsOpen(!isOpen)}
            >
              {t('common.filters')}
              {getFilterCount() > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {getFilterCount()}
                </span>
              )}
            </Button>
            
            {getFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                {t('common.clearAll')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 