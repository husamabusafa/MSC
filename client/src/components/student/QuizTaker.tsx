import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Timer, 
  Target,
  Award,
  RefreshCw
} from 'lucide-react';
import { Quiz } from '../../types';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (score: number, totalQuestions: number) => void;
  onExit: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  isCompleted: boolean;
  score: number;
  showResults: boolean;
  timeElapsed: number;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete, onExit }) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isCompleted: false,
    score: 0,
    showResults: false,
    timeElapsed: 0
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!quizState.isCompleted) {
      const timer = setInterval(() => {
        setQuizState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizState.isCompleted]);

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((quizState.currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answerId: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answerId
      }
    }));
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < totalQuestions - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleFinishQuiz = () => {
    const score = calculateScore();
    setQuizState(prev => ({
      ...prev,
      isCompleted: true,
      score,
      showResults: true
    }));
    onComplete(score, totalQuestions);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      const selectedAnswerId = quizState.answers[question.id];
      const correctAnswer = question.answers.find(answer => answer.isCorrect);
      if (selectedAnswerId === correctAnswer?.id) {
        correct++;
      }
    });
    return correct;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = () => {
    const percentage = (quizState.score / totalQuestions) * 100;
    if (percentage >= 90) return { message: 'Excellent work!', color: 'text-green-600' };
    if (percentage >= 70) return { message: 'Good job!', color: 'text-blue-600' };
    if (percentage >= 50) return { message: 'Not bad, keep practicing!', color: 'text-yellow-600' };
    return { message: 'You can do better next time!', color: 'text-red-600' };
  };

  const handleRetakeQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
      score: 0,
      showResults: false,
      timeElapsed: 0
    });
  };

  const selectedAnswer = quizState.answers[currentQuestion?.id];

  if (quizState.showResults) {
    const scoreMessage = getScoreMessage();
    const percentage = (quizState.score / totalQuestions) * 100;

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <div className="mb-6">
            <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {quiz.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {quizState.score}/{totalQuestions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <Timer className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {formatTime(quizState.timeElapsed)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
            </div>
          </div>
          
          <p className={`text-lg font-medium mb-6 ${scoreMessage.color}`}>
            {scoreMessage.message}
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRetakeQuiz}
            >
              Retake Quiz
            </Button>
            <Button
              variant="primary"
              onClick={onExit}
            >
              Back to Course
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {quiz.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Question {quizState.currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Timer className="w-4 h-4" />
              {formatTime(quizState.timeElapsed)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitModal(true)}
            >
              Exit Quiz
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Question */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentQuestion.text}
          </h3>
          
          {currentQuestion.image && (
            <div className="mb-4">
              <img
                src={currentQuestion.image}
                alt="Question illustration"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
        
        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.answers.map((answer, index) => (
            <button
              key={answer.id}
              onClick={() => handleAnswerSelect(answer.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === answer.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === answer.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedAnswer === answer.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-900 dark:text-white">
                  {String.fromCharCode(65 + index)}. {answer.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={handlePrevious}
          disabled={quizState.currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          variant="primary"
          icon={quizState.currentQuestionIndex === totalQuestions - 1 ? Target : ArrowRight}
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {quizState.currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
        </Button>
      </div>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Quiz"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to exit the quiz? Your progress will be lost.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowExitModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onExit}
              className="flex-1"
            >
              Exit Quiz
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 