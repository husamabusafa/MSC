import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { 
  Filter, 
  X, 
  Search, 
  Calendar, 
  ChevronDown, 
  RefreshCw,
  Settings,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

// Import GraphQL queries for dynamic data
import { GET_LEVELS } from '../../lib/graphql/academic';
import { GET_PRODUCT_CATEGORIES } from '../../lib/graphql/store';
import { GET_COURSES } from '../../lib/graphql/academic';

// Filter field types
export type FilterFieldType = 
  | 'text' 
  | 'select' 
  | 'multiSelect' 
  | 'date' 
  | 'dateRange'
  | 'boolean' 
  | 'number' 
  | 'numberRange'
  | 'search'
  | 'dynamic';

// Filter field configuration
export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: { value: string | number | boolean; label: string }[];
  dynamicSource?: 'levels' | 'categories' | 'courses' | 'users' | 'books';
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  defaultValue?: any;
  multiple?: boolean;
  width?: 'full' | 'half' | 'third' | 'quarter';
  group?: string;
  condition?: (filters: any) => boolean;
  transform?: (value: any) => any;
}

// Filter component props
interface DynamicFilterProps {
  fields: FilterField[];
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  collapsible?: boolean;
  showClearAll?: boolean;
  showActiveCount?: boolean;
  showPresets?: boolean;
  presets?: Array<{ name: string; filters: any }>;
  theme?: 'admin' | 'student' | 'default';
}

// Main component
export const DynamicFilter: React.FC<DynamicFilterProps> = ({
  fields,
  onFiltersChange,
  initialFilters = {},
  className = '',
  layout = 'grid',
  collapsible = true,
  showClearAll = true,
  showActiveCount = true,
  showPresets = false,
  presets = [],
  theme = 'default'
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(!collapsible);
  const [activeFilters, setActiveFilters] = useState<any>(initialFilters);
  const [dynamicData, setDynamicData] = useState<any>({});

  // Query dynamic data sources
  const { data: levelsData } = useQuery(GET_LEVELS, {
    skip: !fields.some(f => f.dynamicSource === 'levels'),
    fetchPolicy: 'cache-first'
  });

  const { data: categoriesData } = useQuery(GET_PRODUCT_CATEGORIES, {
    skip: !fields.some(f => f.dynamicSource === 'categories'),
    fetchPolicy: 'cache-first'
  });

  const { data: coursesData } = useQuery(GET_COURSES, {
    skip: !fields.some(f => f.dynamicSource === 'courses'),
    fetchPolicy: 'cache-first'
  });

  // Update dynamic data when queries complete
  useEffect(() => {
    const newDynamicData: any = {};
    
    if (levelsData?.levels) {
      newDynamicData.levels = levelsData.levels.map((level: any) => ({
        value: level.id,
        label: level.name
      }));
    }

    if (categoriesData?.productCategories?.categories) {
      newDynamicData.categories = categoriesData.productCategories.categories.map((cat: any) => ({
        value: cat.id,
        label: cat.name
      }));
    }

    if (coursesData?.courses) {
      newDynamicData.courses = coursesData.courses.map((course: any) => ({
        value: course.id,
        label: course.name
      }));
    }

    setDynamicData(newDynamicData);
  }, [levelsData, categoriesData, coursesData]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const field = fields.find(f => f.key === key);
    const processedValue = field?.transform ? field.transform(value) : value;
    
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      newFilters[key] = processedValue;
    }
    
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  // Apply preset filters
  const applyPreset = (preset: any) => {
    setActiveFilters(preset);
    onFiltersChange(preset);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => {
      const value = activeFilters[key];
      return value !== undefined && value !== null && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
    }).length;
  };

  // Get field options (static or dynamic)
  const getFieldOptions = (field: FilterField) => {
    if (field.options) {
      return field.options;
    }
    
    if (field.dynamicSource && dynamicData[field.dynamicSource]) {
      return dynamicData[field.dynamicSource];
    }
    
    return [];
  };

  // Render individual filter field
  const renderFilterField = (field: FilterField) => {
    const value = activeFilters[field.key];
    const options = getFieldOptions(field);
    
    // Check condition if exists
    if (field.condition && !field.condition(activeFilters)) {
      return null;
    }

    switch (field.type) {
      case 'search':
      case 'text':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <Input
              icon={field.type === 'search' ? Search : undefined}
              placeholder={field.placeholder || `Search ${field.label.toLowerCase()}`}
              value={value || ''}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <div className="relative">
              <select
                value={value || ''}
                onChange={(e) => handleFilterChange(field.key, e.target.value)}
                className="w-full px-3 py-2 pl-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="">
                  {field.placeholder || `All ${field.label}`}
                </option>
                {options.map((option: { value: string | number | boolean; label: string }) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        );

      case 'multiSelect':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
                         <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800">
               {options.map((option: { value: string | number | boolean; label: string }) => (
                 <label key={String(option.value)} className="flex items-center space-x-2 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={Array.isArray(value) && value.includes(option.value)}
                     onChange={(e) => {
                       const currentValue = Array.isArray(value) ? value : [];
                       const newValue = e.target.checked
                         ? [...currentValue, option.value]
                         : currentValue.filter(v => v !== option.value);
                       handleFilterChange(field.key, newValue);
                     }}
                     className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                   />
                   <span className="text-sm text-gray-700 dark:text-gray-300">
                     {option.label}
                   </span>
                 </label>
               ))}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleFilterChange(field.key, e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
            </label>
          </div>
        );

      case 'date':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <div className="relative">
              <input
                type="date"
                value={value || ''}
                onChange={(e) => handleFilterChange(field.key, e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        );

      case 'dateRange':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={value?.from || ''}
                onChange={(e) => handleFilterChange(field.key, { ...value, from: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="From"
              />
              <input
                type="date"
                value={value?.to || ''}
                onChange={(e) => handleFilterChange(field.key, { ...value, to: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="To"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleFilterChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'numberRange':
        return (
          <div key={field.key} className={getFieldWidth(field.width)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={value?.min || ''}
                onChange={(e) => handleFilterChange(field.key, { ...value, min: e.target.value ? Number(e.target.value) : undefined })}
                min={field.min}
                max={field.max}
                step={field.step}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Min"
              />
              <input
                type="number"
                value={value?.max || ''}
                onChange={(e) => handleFilterChange(field.key, { ...value, max: e.target.value ? Number(e.target.value) : undefined })}
                min={field.min}
                max={field.max}
                step={field.step}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Max"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Get field width class
  const getFieldWidth = (width?: string) => {
    switch (width) {
      case 'full': return 'col-span-full';
      case 'half': return 'col-span-2';
      case 'third': return 'col-span-1';
      case 'quarter': return 'col-span-1 md:col-span-1';
      default: return 'col-span-1';
    }
  };

  // Get theme colors
  const getThemeColors = () => {
    switch (theme) {
      case 'admin':
        return {
          primary: 'admin-500',
          ring: 'ring-admin-500',
          bg: 'bg-admin-50 dark:bg-admin-900/20',
          text: 'text-admin-700 dark:text-admin-300'
        };
      case 'student':
        return {
          primary: 'student-500',
          ring: 'ring-student-500',
          bg: 'bg-student-50 dark:bg-student-900/20',
          text: 'text-student-700 dark:text-student-300'
        };
      default:
        return {
          primary: 'blue-500',
          ring: 'ring-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-300'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <Card className={className}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                icon={Filter}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2"
              >
                <span>{t('common.filters')}</span>
                {showActiveCount && getActiveFilterCount() > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${themeColors.bg} ${themeColors.text}`}>
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            )}
            
            {showPresets && presets.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">|</span>
                <div className="flex space-x-1">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPreset(preset.filters)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && showClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4 mr-1" />
                {t('common.clearAll')}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange(activeFilters)}
              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Fields */}
      {isOpen && (
        <div className="p-4">
          <div className={`${
            layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            layout === 'horizontal' ? 'flex flex-wrap gap-4' :
            'space-y-4'
          }`}>
            {fields.map(field => renderFilterField(field))}
          </div>
        </div>
      )}
    </Card>
  );
}; 