import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { QuizTaker } from '../../components/student/QuizTaker';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GET_QUIZZES_BY_COURSE, CREATE_QUIZ_ATTEMPT, CreateQuizAttemptInput } from '../../lib/graphql/academic';
import { Quiz } from '../../types';
import { ArrowLeft, Play, Target, AlertCircle, Clock } from 'lucide-react';

interface QuizPageProps {
  courseId: string;
}

export const QuizPage: React.FC<QuizPageProps> = ({ courseId }) => {
  const { t } = useI18n();
  const { showNotification } = useNotification();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  const { data, loading, error } = useQuery(GET_QUIZZES_BY_COURSE, {
    variables: { courseId },
    skip: !courseId
  });

  const [createQuizAttempt] = useMutation(CREATE_QUIZ_ATTEMPT, {
    onCompleted: () => {
      showNotification('success', 'Quiz completed successfully!');
    },
    onError: (error) => {
      showNotification('error', `Error submitting quiz: ${error.message}`);
    }
  });

  const availableQuizzes = data?.quizzesByCourse?.filter((quiz: Quiz) => quiz.isVisible) || [];

  const handleBackToQuizList = () => {
    setSelectedQuiz(null);
  };

  const handleQuizComplete = async (score: number, totalQuestions: number, answers: { [questionId: string]: string }) => {
    if (!selectedQuiz) return;

    try {
      const quizAnswers = Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answerId
      }));

      const createQuizAttemptInput: CreateQuizAttemptInput = {
        quizId: selectedQuiz.id,
        answers: quizAnswers
      };

      await createQuizAttempt({
        variables: { createQuizAttemptInput }
      });

      console.log(`Quiz completed: ${score}/${totalQuestions}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleQuizExit = () => {
    setSelectedQuiz(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToQuizList}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t('common.back')}</span>
          </Button>
        </div>
        <QuizTaker 
          quiz={selectedQuiz} 
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Target className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('academic.quizzes')}
        </h1>
      </div>

      {availableQuizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('academic.noQuizzes')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('academic.noQuizzesDescription')}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableQuizzes.map((quiz: Quiz) => (
            <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {quiz.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{quiz.questions?.length || 0} {t('academic.questions')}</span>
                {quiz.hasDuration && quiz.durationMinutes && (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.durationMinutes} {t('common.minutes')}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setSelectedQuiz(quiz)}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Play className="h-4 w-4" />
                <span>{t('academic.startQuiz')}</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 