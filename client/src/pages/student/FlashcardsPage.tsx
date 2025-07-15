import React, { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FlashcardViewer } from '../../components/student/FlashcardViewer';
import { 
  ArrowLeft, 
  Play, 
  Brain, 
  BookOpen,
  AlertCircle,
  FileText,
  Layers
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { FlashcardDeck } from '../../types';

interface FlashcardsPageProps {
  courseId: string;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ courseId }) => {
  const { t } = useI18n();
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const data = getRelatedData();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const course = data.courses.find(c => c.id === courseId);
  const flashcardDecks = data.flashcardDecks.filter(d => d.courseId === courseId && d.isVisible);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('academic.courseNotFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('common.notFoundDescription')}
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/student/courses'}
            >
              {t('common.backToCourses')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isStarted && selectedDeck) {
    return (
      <FlashcardViewer 
        deck={selectedDeck}
        onExit={() => {
          setIsStarted(false);
          setSelectedDeck(null);
        }}
      />
    );
  }

  const handleStartStudying = (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setIsStarted(true);
  };

  const handleGoBack = () => {
    window.location.href = '/student/courses';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={handleGoBack}
        >
          {t('common.backToCourses')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {course.name} - {t('academic.flashcardsTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.studyWithInteractive')}
          </p>
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {course.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Flashcard Decks */}
      {flashcardDecks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('academic.noFlashcardsAvailable')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('academic.noFlashcardsDescription')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardDecks.map((deck) => (
            <Card key={deck.id} hover className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Layers className="w-4 h-4" />
                  <span>{deck.cards.length} cards</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {deck.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {deck.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{t('common.studyMode')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span>{t('common.interactive')}</span>
                </div>
              </div>
              
                              <Button
                  variant="primary"
                  icon={Play}
                  onClick={() => handleStartStudying(deck)}
                  className="w-full"
                >
                  {t('common.startStudying')}
                </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
              {t('common.howToStudyFlashcards')}
            </h4>
            <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
              {(t('common.flashcardInstructions') as unknown as string[]).map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}; 