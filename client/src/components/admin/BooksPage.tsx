import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { FilterPanel, FilterOption } from '../common/FilterPanel';
import { FileUpload } from '../common/FileUpload';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  GET_BOOKS, 
  CREATE_BOOK, 
  UPDATE_BOOK, 
  DELETE_BOOK,
  Book,
  CreateBookInput,
  UpdateBookInput,
  BooksFilterInput
} from '../../lib/graphql/library';

export const BooksPage: React.FC = () => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [filters, setFilters] = useState<BooksFilterInput>({});
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    totalCopies: 1,
    isVisible: true
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_BOOKS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network'
  });

  const [createBook] = useMutation(CREATE_BOOK, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error creating book:', error);
    }
  });

  const [updateBook] = useMutation(UPDATE_BOOK, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating book:', error);
    }
  });

  const [deleteBook] = useMutation(DELETE_BOOK, {
    onCompleted: () => {
      setIsConfirmModalOpen(false);
      setBookToDelete(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting book:', error);
    }
  });

  const handleCreateBook = () => {
    setSelectedBook(null);
    setFormData({
      title: '',
      author: '',
      description: '',
      coverImage: '',
      totalCopies: 1,
      isVisible: true
    });
    setCoverImageFile(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      coverImage: book.coverImage || '',
      totalCopies: book.totalCopies,
      isVisible: book.isVisible
    });
    setCoverImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's a file uploaded, use it; otherwise use the existing URL
    const imageToUse = coverImageFile ? formData.coverImage : formData.coverImage;
    
    if (selectedBook) {
      // Update existing book
      const updateInput: UpdateBookInput = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        coverImage: imageToUse || undefined,
        totalCopies: formData.totalCopies,
        isVisible: formData.isVisible
      };
      
      await updateBook({
        variables: {
          id: selectedBook.id,
          updateBookInput: updateInput
        }
      });
    } else {
      // Create new book
      const createInput: CreateBookInput = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        coverImage: imageToUse || undefined,
        totalCopies: formData.totalCopies,
        availableCopies: formData.totalCopies, // Initially all copies are available
        isVisible: formData.isVisible
      };
      
      await createBook({
        variables: {
          createBookInput: createInput
        }
      });
    }
  };

  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteBook = async () => {
    if (bookToDelete) {
      await deleteBook({
        variables: {
          id: bookToDelete.id
        }
      });
    }
  };

  const handleFileUpload = (file: File | null, preview: string) => {
    setCoverImageFile(file);
    setFormData(prev => ({ ...prev, coverImage: preview }));
  };

  const books = data?.books?.books || [];

  const filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: t('common.search'),
      type: 'text',
      placeholder: t('common.searchByTitleOrAuthor')
    },
    {
      key: 'isVisible',
      label: t('common.visibleOnly'),
      type: 'boolean'
    },
    {
      key: 'isAvailable',
      label: t('library.availableOnly'),
      type: 'boolean'
    }
  ];

  const handleFiltersChange = (newFilters: { [key: string]: any }) => {
    const graphQLFilters: BooksFilterInput = {};
    
    if (newFilters.search) {
      graphQLFilters.search = newFilters.search;
    }
    
    if (newFilters.isVisible === true) {
      graphQLFilters.isVisible = true;
    }
    
    if (newFilters.isAvailable === true) {
      graphQLFilters.isAvailable = true;
    }
    
    setFilters(graphQLFilters);
  };

  const columns = [
    {
      key: 'title',
      label: t('library.title'),
      sortable: true,
      render: (book: Book) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{book.slug}</p>
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: t('library.author'),
      sortable: true,
      render: (book: Book) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{book.author}</span>
        </div>
      )
    },
    {
      key: 'copies',
      label: t('library.copies'),
      sortable: true,
      render: (book: Book) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {book.availableCopies} / {book.totalCopies}
          </span>
        </div>
      )
    },
    {
      key: 'isVisible',
      label: t('common.status'),
      render: (book: Book) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {book.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('common.visible')}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 dark:text-gray-400">{t('common.hidden')}</span>
            </>
          )}
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
            {t('nav.books')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('library.manageBooks')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateBook}
        >
          {t('library.addBook')}
        </Button>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {/* Books Table */}
      <Card padding="sm">
        <DataTable
          data={books}
          columns={columns}
          actions={(book) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditBook(book)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteBook(book)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No books found"
        />
      </Card>

      {/* Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBook ? 'Edit Book' : 'Add Book'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('library.title')}
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <Input
            label={t('library.author')}
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <FileUpload
            label="Cover Image"
            value={formData.coverImage}
            onChange={handleFileUpload}
            placeholder="Upload a cover image"
          />
          
          <Input
            type="number"
            label={t('library.totalCopies')}
            value={formData.totalCopies}
            onChange={(e) => setFormData(prev => ({ ...prev, totalCopies: parseInt(e.target.value) || 1 }))}
            min="1"
            required
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isVisible" className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.visibleToStudents')}
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBook}
        title={t('common.confirmDelete')}
        message={`${t('common.deleteMessage')} "${bookToDelete?.title}"?`}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};