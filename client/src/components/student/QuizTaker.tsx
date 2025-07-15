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
  RefreshCw,
  X
} from 'lucide-react';
import { Quiz } from '../../types';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (score: number, totalQuestions: number, answers: { [questionId: string]: string }) => void;
  onExit: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  isCompleted: boolean;
  score: number;
  showResults: boolean;
  timeElapsed: number;
  revealedAnswers: { [questionId: string]: boolean };
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete, onExit }) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isCompleted: false,
    score: 0,
    showResults: false,
    timeElapsed: 0,
    revealedAnswers: {}
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!quizState.isCompleted) {
      const timer = setInterval(() => {
        setQuizState(prev => {
          const newTimeElapsed = prev.timeElapsed + 1;
          
          // Check if quiz has duration and time is up
          if (quiz.hasDuration && quiz.durationMinutes) {
            const timeLimit = quiz.durationMinutes * 60; // Convert to seconds
            if (newTimeElapsed >= timeLimit) {
              // Auto-finish quiz when time is up
              handleFinishQuiz();
              return prev;
            }
          }
          
          return {
            ...prev,
            timeElapsed: newTimeElapsed
          };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizState.isCompleted, quiz.hasDuration, quiz.durationMinutes]);

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((quizState.currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answerId: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answerId
      },
      revealedAnswers: quiz.showAnswersImmediately ? {
        ...prev.revealedAnswers,
        [currentQuestion.id]: true
      } : prev.revealedAnswers
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
    onComplete(score, totalQuestions, quizState.answers);
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

  const getRemainingTime = () => {
    if (!quiz.hasDuration || !quiz.durationMinutes) return null;
    const timeLimit = quiz.durationMinutes * 60; // Convert to seconds
    const remaining = timeLimit - quizState.timeElapsed;
    return remaining > 0 ? remaining : 0;
  };

  const remainingTime = getRemainingTime();
  const isTimeRunningOut = remainingTime !== null && remainingTime < 300; // Less than 5 minutes

  const getScoreMessage = () => {
    const percentage = (quizState.score / totalQuestions) * 100;
          if (percentage >= 90) return { message: 'Excellent work!', color: 'text-student-600' };
      if (percentage >= 70) return { message: 'Good job!', color: 'text-student-600' };
      if (percentage >= 50) return { message: 'Not bad, keep practicing!', color: 'text-student-600' };
      return { message: 'You can do better next time!', color: 'text-student-600' };
  };

  const handleRetakeQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
      score: 0,
      showResults: false,
      timeElapsed: 0,
      revealedAnswers: {}
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
            <Award className="w-16 h-16 mx-auto mb-4 text-student-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {quiz.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-student-50 dark:bg-student-900/20 p-4 rounded-lg">
          <Target className="w-8 h-8 text-student-600 dark:text-student-400 mx-auto mb-2" />
          <p className="text-lg font-semibold text-student-600 dark:text-student-400">
                {quizState.score}/{totalQuestions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
            </div>
            
                          <div className="bg-student-50 dark:bg-student-900/20 p-4 rounded-lg">
                <CheckCircle className="w-8 h-8 text-student-600 dark:text-student-400 mx-auto mb-2" />
                <p className="text-lg font-semibold text-student-600 dark:text-student-400">
                {percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
            </div>
            
                          <div className="bg-student-50 dark:bg-student-900/20 p-4 rounded-lg">
                <Timer className="w-8 h-8 text-student-600 dark:text-student-400 mx-auto mb-2" />
                <p className="text-lg font-semibold text-student-600 dark:text-student-400">
                {formatTime(quizState.timeElapsed)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
            </div>
          </div>
          
          <p className={`text-lg font-medium mb-6 ${scoreMessage.color}`}>
            {scoreMessage.message}
          </p>
          
          {/* Question Review */}
          <div className="text-left mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Question Review
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quiz.questions.map((question, index) => {
                const userAnswer = quizState.answers[question.id];
                const correctAnswer = question.answers.find(answer => answer.isCorrect);
                const isCorrect = userAnswer === correctAnswer?.id;
                
                return (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {index + 1}. {question.text}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">Your answer:</span>
                            <span className={`font-medium ${
                              isCorrect
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {question.answers.find(a => a.id === userAnswer)?.text || 'No answer'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">Correct answer:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {correctAnswer?.text}
                              </span>
                            </div>
                          )}
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Explanation: </span>
                              <span className="text-gray-600 dark:text-gray-400">{question.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              colorScheme="student"
              icon={RefreshCw}
              onClick={handleRetakeQuiz}
            >
              Retake Quiz
            </Button>
            <Button
              variant="primary"
              colorScheme="student"
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
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4" />
              {quiz.hasDuration && remainingTime !== null ? (
                <div className={`font-medium ${isTimeRunningOut ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatTime(remainingTime)} remaining
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  {formatTime(quizState.timeElapsed)}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              colorScheme="student"
              onClick={() => setShowExitModal(true)}
            >
              Exit Quiz
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-student-600 h-2 rounded-full transition-all duration-300"
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
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer.id;
            const isRevealed = quizState.revealedAnswers[currentQuestion.id];
            const isCorrect = answer.isCorrect;
            
            let buttonClass = '';
            if (isRevealed) {
              if (isCorrect) {
                buttonClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
              } else if (isSelected && !isCorrect) {
                buttonClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
              } else {
                buttonClass = 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800';
              }
            } else {
              buttonClass = isSelected
                ? 'border-student-500 bg-student-50 dark:bg-student-900/20'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500';
            }
            
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={isRevealed}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${buttonClass} ${
                  isRevealed ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isRevealed
                      ? isCorrect
                        ? 'border-green-500 bg-green-500'
                        : isSelected
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                      : isSelected
                      ? 'border-student-500 bg-student-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isRevealed && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <X className="w-4 h-4 text-white" />
                    )}
                    {!isRevealed && isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`flex-1 ${
                    isRevealed && isCorrect
                      ? 'text-green-700 dark:text-green-300 font-semibold'
                      : isRevealed && isSelected && !isCorrect
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {String.fromCharCode(65 + index)}. {answer.text}
                  </span>
                </div>
              </button>
                         );
           })}
        </div>
        
        {/* Explanation */}
        {quizState.revealedAnswers[currentQuestion.id] && currentQuestion.explanation && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Explanation:
            </h4>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              {currentQuestion.explanation}
            </p>
            {currentQuestion.explanationImage && (
              <div className="mt-3">
                <img
                  src={currentQuestion.explanationImage}
                  alt="Explanation illustration"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        )}
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