import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Shuffle, 
  Eye, 
  BookOpen,
  Brain,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { FlashcardDeck, Flashcard } from '../../types';

interface FlashcardViewerProps {
  deck: FlashcardDeck;
  onExit: () => void;
}

interface FlashcardState {
  currentCardIndex: number;
  isFlipped: boolean;
  studiedCards: Set<string>;
  masteredCards: Set<string>;
  difficultCards: Set<string>;
  isShuffled: boolean;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ deck, onExit }) => {
  const { t } = useI18n();
  const [flashcardState, setFlashcardState] = useState<FlashcardState>({
    currentCardIndex: 0,
    isFlipped: false,
    studiedCards: new Set(),
    masteredCards: new Set(),
    difficultCards: new Set(),
    isShuffled: false
  });

  const [cards, setCards] = useState<Flashcard[]>(deck.cards.sort((a, b) => a.order - b.order));
  
  const currentCard = cards[flashcardState.currentCardIndex];
  const totalCards = cards.length;
  const progress = ((flashcardState.currentCardIndex + 1) / totalCards) * 100;

  const handleFlip = () => {
    setFlashcardState(prev => ({
      ...prev,
      isFlipped: !prev.isFlipped,
      studiedCards: new Set([...prev.studiedCards, currentCard.id])
    }));
  };

  const handleNext = () => {
    if (flashcardState.currentCardIndex < totalCards - 1) {
      setFlashcardState(prev => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex + 1,
        isFlipped: false
      }));
    }
  };

  const handlePrevious = () => {
    if (flashcardState.currentCardIndex > 0) {
      setFlashcardState(prev => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex - 1,
        isFlipped: false
      }));
    }
  };

  const handleShuffle = () => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlashcardState(prev => ({
      ...prev,
      currentCardIndex: 0,
      isFlipped: false,
      isShuffled: true
    }));
  };

  const handleReset = () => {
    const sortedCards = [...deck.cards].sort((a, b) => a.order - b.order);
    setCards(sortedCards);
    setFlashcardState({
      currentCardIndex: 0,
      isFlipped: false,
      studiedCards: new Set(),
      masteredCards: new Set(),
      difficultCards: new Set(),
      isShuffled: false
    });
  };

  const handleMarkDifficulty = (difficulty: 'easy' | 'difficult') => {
    setFlashcardState(prev => {
      const newState = { ...prev };
      if (difficulty === 'easy') {
        newState.masteredCards = new Set([...prev.masteredCards, currentCard.id]);
        newState.difficultCards = new Set([...prev.difficultCards].filter(id => id !== currentCard.id));
      } else {
        newState.difficultCards = new Set([...prev.difficultCards, currentCard.id]);
        newState.masteredCards = new Set([...prev.masteredCards].filter(id => id !== currentCard.id));
      }
      return newState;
    });
  };

  const getCardDifficultyStatus = (cardId: string) => {
    if (flashcardState.masteredCards.has(cardId)) return 'easy';
    if (flashcardState.difficultCards.has(cardId)) return 'difficult';
    return 'none';
  };

  const currentCardStatus = getCardDifficultyStatus(currentCard.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {deck.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Card {flashcardState.currentCardIndex + 1} of {totalCards}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Shuffle}
              onClick={handleShuffle}
              disabled={totalCards <= 1}
            >
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
            >
              Exit
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {flashcardState.studiedCards.size}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Studied</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {flashcardState.masteredCards.size}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mastered</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {flashcardState.difficultCards.size}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Difficult</p>
          </div>
        </div>
      </Card>

      {/* Flashcard */}
      <div className="relative">
        <div 
          className={`min-h-[400px] cursor-pointer transition-all duration-500 transform ${
            flashcardState.isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          <Card className="h-full">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center w-full">
              <div className="flex justify-center mb-4">
                {flashcardState.isFlipped ? (
                  <Brain className="w-12 h-12 text-green-600 dark:text-green-400" />
                ) : (
                  <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                {flashcardState.isFlipped ? 'ANSWER' : 'QUESTION'}
              </h3>
              
              <div className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                {flashcardState.isFlipped ? currentCard.answer : currentCard.question}
              </div>
              
              {!flashcardState.isFlipped && (
                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Click to reveal answer</span>
                </div>
              )}
                         </div>
           </div>
           
           {/* Difficulty indicator */}
           {currentCardStatus !== 'none' && (
             <div className="absolute top-4 right-4">
               {currentCardStatus === 'easy' ? (
                 <CheckCircle className="w-6 h-6 text-green-500" />
               ) : (
                 <XCircle className="w-6 h-6 text-red-500" />
               )}
             </div>
           )}
           </Card>
         </div>
       </div>

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={handlePrevious}
          disabled={flashcardState.currentCardIndex === 0}
        >
          Previous
        </Button>
        
        {flashcardState.isFlipped && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={XCircle}
              onClick={() => handleMarkDifficulty('difficult')}
              className={`${
                currentCardStatus === 'difficult' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400' 
                  : ''
              }`}
            >
              Difficult
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle}
              onClick={() => handleMarkDifficulty('easy')}
              className={`${
                currentCardStatus === 'easy' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 text-green-600 dark:text-green-400' 
                  : ''
              }`}
            >
              Easy
            </Button>
          </div>
        )}
        
        <Button
          variant="primary"
          icon={ArrowRight}
          onClick={handleNext}
          disabled={flashcardState.currentCardIndex === totalCards - 1}
        >
          Next
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {t('common.howToStudy')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('instructions.studyTips')}
          </p>
        </div>
      </Card>
    </div>
  );
}; 