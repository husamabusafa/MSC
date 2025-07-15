import React, { useState, useEffect } from 'react';
import { QuizTaker } from '../../components/student/QuizTaker';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getRelatedData } from '../../data/mockData';
import { Quiz } from '../../types';
import { ArrowLeft, Play, Target, AlertCircle } from 'lucide-react';

interface QuizPageProps {
  courseId: string;
}

export const QuizPage: React.FC<QuizPageProps> = ({ courseId }) => {
  const { t } = useI18n();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const data = getRelatedData();
    const courseQuizzes = data.quizzes.filter(quiz => quiz.courseId === courseId);
    setAvailableQuizzes(courseQuizzes);
    setLoading(false);
  }, [courseId]);

  const handleBackToQuizList = () => {
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
            <ArrowLeft className="h-4 w-4" />
            <span>{t('common.back')}</span>
          </Button>
        </div>
        <QuizTaker quiz={selectedQuiz} />
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
          {availableQuizzes.map((quiz) => (
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
                <span>{quiz.questions.length} {t('academic.questions')}</span>
                <span>{quiz.timeLimit} {t('common.minutes')}</span>
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