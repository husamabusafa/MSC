import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  FileText
} from 'lucide-react';
import { 
  GET_FLASHCARD_DECKS, 
  CREATE_FLASHCARD_DECK, 
  UPDATE_FLASHCARD_DECK, 
  DELETE_FLASHCARD_DECK,
  GET_COURSES,
  FlashcardDeck,
  CreateFlashcardDeckInput,
  UpdateFlashcardDeckInput,
  Course
} from '../../lib/graphql/academic';

export const FlashcardsPage: React.FC = () => {
  const { t } = useI18n();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    isVisible: true
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_FLASHCARD_DECKS, {
    fetchPolicy: 'cache-and-network'
  });

  const { data: coursesData } = useQuery(GET_COURSES);

  const [createFlashcardDeck] = useMutation(CREATE_FLASHCARD_DECK, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      alert('Flashcard deck created successfully!');
    },
    onError: (error) => {
      alert(`Error creating flashcard deck: ${error.message}`);
    }
  });

  const [updateFlashcardDeck] = useMutation(UPDATE_FLASHCARD_DECK, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      alert('Flashcard deck updated successfully!');
    },
    onError: (error) => {
      alert(`Error updating flashcard deck: ${error.message}`);
    }
  });

  const [deleteFlashcardDeck] = useMutation(DELETE_FLASHCARD_DECK, {
    onCompleted: () => {
      refetch();
      alert('Flashcard deck deleted successfully!');
    },
    onError: (error) => {
      alert(`Error deleting flashcard deck: ${error.message}`);
    }
  });

  const flashcardDecks = data?.flashcardDecks || [];
  const courses = coursesData?.courses || [];

  const filteredDecks = flashcardDecks.filter((deck: FlashcardDeck) => {
    const matchesCourse = !selectedCourse || deck.courseId === selectedCourse;
    return matchesCourse;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDeck) {
      // Update existing deck
      const updateInput: UpdateFlashcardDeckInput = {
        name: formData.name,
        description: formData.description,
        courseId: formData.courseId,
        isVisible: formData.isVisible
      };
      
      await updateFlashcardDeck({
        variables: {
          id: selectedDeck.id,
          updateFlashcardDeckInput: updateInput
        }
      });
    } else {
      // Create new deck
      const createInput: CreateFlashcardDeckInput = {
        name: formData.name,
        description: formData.description,
        courseId: formData.courseId,
        isVisible: formData.isVisible
      };
      
      await createFlashcardDeck({
        variables: {
          createFlashcardDeckInput: createInput
        }
      });
    }
  };

  const handleDeleteDeck = async (deck: FlashcardDeck) => {
    if (confirm(`Are you sure you want to delete "${deck.name}"?`)) {
      await deleteFlashcardDeck({
        variables: {
          id: deck.id
        }
      });
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
          <span className="text-gray-900 dark:text-white">{deck.cards?.length || 0} cards</span>
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
      label: t('common.visibility'),
      render: (deck: FlashcardDeck) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {deck.isVisible ? (
            <>
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">{t('common.visible')}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.hidden')}</span>
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

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map((course: Course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Flashcard Decks Table */}
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

      {/* Flashcard Deck Modal */}
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
              {courses.map((course: Course) => (
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