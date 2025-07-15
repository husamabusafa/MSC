import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
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
  ExternalLink
} from 'lucide-react';
import { GET_BOOKS } from '../../lib/graphql/library';

export const LibraryPage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [borrowNotes, setBorrowNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: booksData, loading: booksLoading } = useQuery(GET_BOOKS);
  const books = booksData?.books || [];

  const filteredBooks = books.filter((book: any) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && book.isVisible;
  });

  const handleBorrowRequest = (book: any) => {
    setSelectedBook(book);
    setBorrowNotes('');
    setIsModalOpen(true);
  };

  const handleSubmitBorrow = () => {
    // Simulate API call
    console.log('Borrow request submitted:', {
      bookId: selectedBook.id,
      studentId: user?.id,
      notes: borrowNotes
    });
    setIsModalOpen(false);
    setSelectedBook(null);
    setBorrowNotes('');
    // Show success message
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
            Browse and borrow books from our digital library
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="p-6">
          <Input
            icon={Search}
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book: any) => (
          <Card key={book.id} hover className="group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-student-100 dark:bg-student-900/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-student-600 dark:text-student-400" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  book.isAvailable 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {book.isAvailable ? 'Available' : 'Borrowed'}
                </span>
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
                  disabled={!book.isAvailable}
                  className="flex-1"
                >
                  {book.isAvailable ? 'Request Borrow' : 'Unavailable'}
                </Button>
                {book.fileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="student"
                    icon={ExternalLink}
                    onClick={() => window.open(book.fileUrl, '_blank')}
                  >
                    View
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
              No books found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        </Card>
      )}

      {/* Borrow Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Book Borrow"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedBook?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {selectedBook?.author}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={borrowNotes}
              onChange={(e) => setBorrowNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-student-500 dark:bg-gray-800 dark:text-white"
              placeholder="Any additional notes or special requests..."
            />
          </div>
          
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="student"
              onClick={handleSubmitBorrow}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};