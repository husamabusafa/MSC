import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';

interface FileUploadProps {
  label?: string;
  value?: string;
  onChange: (file: File | null, preview: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5, // 5MB default
  className = "",
  placeholder = "Upload an image",
  required = false
}) => {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError(t('common.invalidFileType'));
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview('');
      onChange(null, '');
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null, '');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${error ? 'border-red-500' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {placeholder}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('common.dragAndDropOrClick')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
              Max file size: {maxSize}MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {preview && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <X className="w-4 h-4 mr-2" />
            {t('common.remove')}
          </Button>
        </div>
      )}
    </div>
  );
}; 