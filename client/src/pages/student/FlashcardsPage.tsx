import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { FlashcardViewer } from '../../components/student/FlashcardViewer';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GET_FLASHCARD_DECKS } from '../../lib/graphql/academic';
import { FlashcardDeck } from '../../types';
import { ArrowLeft, Play, Brain, AlertCircle } from 'lucide-react';

interface FlashcardsPageProps {
  courseId: string;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ courseId }) => {
  const { t } = useI18n();
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  const { data, loading, error } = useQuery(GET_FLASHCARD_DECKS, {
    fetchPolicy: 'cache-and-network'
  });

  const flashcardDecks = data?.flashcardDecks || [];
  const availableDecks = flashcardDecks.filter((deck: any) => 
    deck.courseId === courseId && deck.isVisible
  );

  const handleBackToDeckList = () => {
    setSelectedDeck(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('common.error')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message}
          </p>
        </Card>
      </div>
    );
  }

  if (selectedDeck) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDeckList}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t('common.back')}</span>
          </Button>
        </div>
        <FlashcardViewer deck={selectedDeck} onExit={handleBackToDeckList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Brain className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('academic.flashcards')}
        </h1>
      </div>

      {availableDecks.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('academic.noFlashcards')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('academic.noFlashcardsDescription')}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableDecks.map((deck: any) => (
            <Card key={deck.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {deck.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {deck.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{deck.cards?.length || 0} {t('academic.cards')}</span>
              </div>

              <Button
                onClick={() => setSelectedDeck(deck)}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Play className="h-4 w-4" />
                <span>{t('academic.startFlashcards')}</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 