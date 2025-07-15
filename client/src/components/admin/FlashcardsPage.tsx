import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  FileText
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { FlashcardDeck } from '../../types';

export const FlashcardsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    isVisible: true
  });
  const data = getRelatedData();

  const filteredDecks = data.flashcardDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || deck.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleCreateDeck = () => {
    setSelectedDeck(null);
    setFormData({
      name: '',
      description: '',
      courseId: '',
      isVisible: true
    });
    setIsModalOpen(true);
  };

  const handleEditDeck = (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setFormData({
      name: deck.name,
      description: deck.description,
      courseId: deck.courseId,
      isVisible: deck.isVisible
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Flashcard deck saved:', formData);
    setIsModalOpen(false);
    alert(selectedDeck ? t('messages.success.flashcardUpdated') : t('messages.success.flashcardCreated'));
  };

  const handleDeleteDeck = (deck: FlashcardDeck) => {
    if (confirm(t('messages.confirmDelete.flashcard'))) {
      console.log('Delete deck:', deck.id);
      alert(t('messages.success.flashcardDeleted'));
    }
  };

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (deck: FlashcardDeck) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{deck.name}</span>
        </div>
      )
    },
    {
      key: 'course',
      label: t('academic.course'),
      render: (deck: FlashcardDeck) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-900 dark:text-white">{deck.course?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{deck.course?.level?.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'cards',
      label: t('common.cards'),
      render: (deck: FlashcardDeck) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{deck.cards.length} {t('common.cards').toLowerCase()}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: t('common.description'),
      render: (deck: FlashcardDeck) => (
        <span className="text-gray-600 dark:text-gray-400 line-clamp-2">{deck.description}</span>
      )
    },
    {
      key: 'isVisible',
      label: 'Visibility',
      render: (deck: FlashcardDeck) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {deck.isVisible ? (
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.flashcards')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage flashcard decks for student learning
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateDeck}
        >
          Add Flashcard Deck
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={`${t('common.search')} flashcard decks...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {data.courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <DataTable
          data={filteredDecks}
          columns={columns}
          actions={(deck) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditDeck(deck)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteDeck(deck)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No flashcard decks found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDeck ? 'Edit Flashcard Deck' : 'Add Flashcard Deck'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Programming Basics"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('academic.course')}
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Course</option>
              {data.courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          
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
              placeholder="Essential programming concepts for beginners"
            />
          </div>
          
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