import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { 
  BookOpen, 
  Search, 
  User, 
  Calendar, 
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';

export const LibraryPage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [borrowNotes, setBorrowNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = getRelatedData();

  const filteredBooks = data.books.filter(book => {
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
    alert(t('library.requestSent'));
  };

  const isBookBorrowed = (bookId: string) => {
    return data.bookOrders.some(order => 
      order.bookId === bookId && 
      order.studentId === user?.id && 
      order.status === 'pending'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.library')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Al-Jalees Club Library - Browse and borrow books
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <Input
          icon={Search}
          placeholder={`${t('common.search')} books, authors...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => {
          const borrowed = isBookBorrowed(book.id);
          const isAvailable = book.availableCopies > 0;
          
          return (
            <Card key={book.id} hover className="group">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {book.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{book.author}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isAvailable 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {isAvailable ? t('library.available') : t('library.unavailable')}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {book.availableCopies}/{book.totalCopies}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {book.description}
                </p>
                
                <div className="pt-2">
                  {borrowed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBorrowRequest(book)}
                      disabled={!isAvailable}
                      className="w-full"
                    >
                      {t('library.borrow')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <Card>
          <div className="text-center py-12">
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

      {/* Borrow Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('library.borrowRequest')}
      >
        {selectedBook && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {selectedBook.coverImage ? (
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedBook.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBook.author}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('library.studentNotes')} (Optional)
              </label>
              <textarea
                value={borrowNotes}
                onChange={(e) => setBorrowNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes about your borrow request..."
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitBorrow}
                className="flex-1"
              >
                {t('common.submit')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};