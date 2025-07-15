import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  User,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { Book } from '../../types';

export const BooksPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    totalCopies: 1,
    isVisible: true
  });
  const data = getRelatedData();

  const filteredBooks = data.books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Book saved:', formData);
    setIsModalOpen(false);
    alert(selectedBook ? t('messages.success.bookUpdated') : t('messages.success.bookCreated'));
  };

  const handleDeleteBook = (book: Book) => {
    if (confirm(t('messages.confirmDelete.book'))) {
      console.log('Delete book:', book.id);
      alert(t('messages.success.bookDeleted'));
    }
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
      label: 'Copies',
      render: (book: Book) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {book.availableCopies}/{book.totalCopies}
          </span>
        </div>
      )
    },
    {
      key: 'isVisible',
      label: 'Visibility',
      render: (book: Book) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {book.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Hidden</span>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.books')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage library books and their availability
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateBook}
        >
          Add Book
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          icon={Search}
          placeholder={`${t('common.search')} books...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Books Table */}
      <Card padding="sm">
        <DataTable
          data={filteredBooks}
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
        size="lg"
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
          
          <Input
            label="Cover Image URL"
            value={formData.coverImage}
            onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
          
          <Input
            type="number"
            label="Total Copies"
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
              Visible to students
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
    </div>
  );
};