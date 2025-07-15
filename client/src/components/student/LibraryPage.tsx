import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  BookOpen, 
  Search, 
  User, 
  Calendar, 
  Check,
  X,
  ExternalLink,
  Filter,
  Clock,
  Package
} from 'lucide-react';
import { GET_BOOKS, CREATE_BOOK_ORDER } from '../../lib/graphql/library';

export const LibraryPage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [borrowNotes, setBorrowNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { data: booksData, loading: booksLoading, refetch } = useQuery(GET_BOOKS, {
    variables: { filters: { isVisible: true } },
    fetchPolicy: 'cache-and-network'
  });

  const [createBookOrder] = useMutation(CREATE_BOOK_ORDER, {
    onCompleted: (data) => {
      setIsModalOpen(false);
      setSelectedBook(null);
      setBorrowNotes('');
      setSuccessMessage(t('library.requestSent'));
      setIsSuccessModalOpen(true);
      refetch();
    },
    onError: (error) => {
      console.error('Error creating book order:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const books = booksData?.books?.books || [];

  const filteredBooks = books.filter((book: any) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = !authorFilter || book.author.toLowerCase().includes(authorFilter.toLowerCase());
    const matchesAvailability = !availabilityFilter || 
                               (availabilityFilter === 'available' && book.availableCopies > 0) ||
                               (availabilityFilter === 'unavailable' && book.availableCopies === 0);
    return matchesSearch && matchesAuthor && matchesAvailability && book.isVisible;
  });

  const uniqueAuthors = Array.from(new Set(books.map((book: any) => book.author as string))).filter(Boolean).sort() as string[];

  const handleBorrowRequest = (book: any) => {
    setSelectedBook(book);
    setBorrowNotes('');
    setIsModalOpen(true);
  };

  const handleSubmitBorrow = async () => {
    if (!selectedBook || !user) return;

    try {
      await createBookOrder({
        variables: {
          createBookOrderInput: {
            bookId: selectedBook.id,
            studentNotes: borrowNotes
          }
        }
      });
    } catch (error) {
      console.error('Error submitting borrow request:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAuthorFilter('');
    setAvailabilityFilter('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (authorFilter) count++;
    if (availabilityFilter) count++;
    return count;
  };

  if (booksLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.library')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('library.browseLibrary')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredBooks.length} {t('library.allBooks')}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder={t('library.searchByTitleOrAuthor')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                {t('common.filter')}
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-student-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="outline"
                  icon={X}
                  onClick={clearFilters}
                  size="sm"
                >
                  {t('common.clearAll')}
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('library.filterByAuthor')}
                  </label>
                  <select
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-student-500"
                  >
                    <option value="">{t('common.allAuthors')}</option>
                    {uniqueAuthors.map((author: string) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('library.filterByAvailability')}
                  </label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-student-500"
                  >
                    <option value="">{t('library.allAvailability')}</option>
                    <option value="available">{t('library.availableBooks')}</option>
                    <option value="unavailable">{t('library.unavailableBooks')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book: any) => (
          <Card key={book.id} hover className="group">
            <div className="p-6">
              {/* Book Cover */}
              {book.coverImage && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-32 h-44 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                {!book.coverImage && (
                  <div className="p-3 bg-student-100 dark:bg-student-900/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-student-600 dark:text-student-400" />
                  </div>
                )}
                <div className="flex flex-col gap-2 ml-auto">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    book.availableCopies > 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {book.availableCopies > 0 ? t('library.available') : t('library.unavailable')}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Package className="w-3 h-3" />
                    <span>{book.availableCopies}/{book.totalCopies}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-student-600 dark:group-hover:text-student-400 transition-colors">
                {book.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <User className="w-4 h-4" />
                <span>{book.author}</span>
              </div>
              
              {book.publishDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(book.publishDate).getFullYear()}</span>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {book.description}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  colorScheme="student"
                  onClick={() => handleBorrowRequest(book)}
                  disabled={book.availableCopies === 0}
                  className="flex-1"
                >
                  {book.availableCopies > 0 ? t('library.requestBook') : t('library.unavailable')}
                </Button>
                {book.fileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="student"
                    icon={ExternalLink}
                    onClick={() => window.open(book.fileUrl, '_blank')}
                  >
                    {t('common.view')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <Card>
          <div className="p-6 text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('library.noBooksFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('library.tryAdjustingFilters')}
            </p>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                colorScheme="student"
              >
                {t('common.clearAll')}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Borrow Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('library.borrowRequest')}
      >
        <div className="space-y-4">
          <div className="bg-student-50 dark:bg-student-900/20 rounded-lg p-4">
            {/* Book Cover in Modal */}
            {selectedBook?.coverImage && (
              <div className="mb-4 flex justify-center">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-24 h-32 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedBook?.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <User className="w-4 h-4" />
              <span>{selectedBook?.author}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Package className="w-4 h-4" />
              <span>{selectedBook?.availableCopies}/{selectedBook?.totalCopies} {t('library.availableCopies')}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('library.borrowNotes')}
            </label>
            <textarea
              value={borrowNotes}
              onChange={(e) => setBorrowNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-student-500 dark:bg-gray-800 dark:text-white"
              placeholder={t('library.borrowNotes')}
            />
          </div>
          
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="student"
              onClick={handleSubmitBorrow}
              disabled={!selectedBook || selectedBook.availableCopies === 0}
            >
              {t('library.submitRequest')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={t('common.success')}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">{successMessage}</p>
          </div>
          <div className="flex justify-center">
            <Button
              colorScheme="student"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              {t('common.ok')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};