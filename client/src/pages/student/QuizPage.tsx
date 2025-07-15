import React, { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuizTaker } from '../../components/student/QuizTaker';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  HelpCircle, 
  BookOpen,
  Target,
  AlertCircle
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { Quiz } from '../../types';

interface QuizPageProps {
  courseId: string;
}

export const QuizPage: React.FC<QuizPageProps> = ({ courseId }) => {
  const { t } = useI18n();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
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
  const quizzes = data.quizzes.filter(q => q.courseId === courseId && q.isVisible);

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

  if (isStarted && selectedQuiz) {
    return (
      <QuizTaker 
        quiz={selectedQuiz}
        onComplete={(score, total) => {
          console.log('Quiz completed:', { score, total, quizId: selectedQuiz.id });
          // Here you would typically save the score to the backend
        }}
        onExit={() => {
          setIsStarted(false);
          setSelectedQuiz(null);
        }}
      />
    );
  }

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
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
            {course.name} - {t('academic.quizzesTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.testYourKnowledge')}
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

      {/* Quizzes */}
      {quizzes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('academic.noQuizzesAvailable')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('academic.noQuizzesDescription')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hover className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>{quiz.questions.length} {t('common.questions').toLowerCase()}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {quiz.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {quiz.description}
              </p>

                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>~{Math.ceil(quiz.questions.length * 1.5)} {t('common.min')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{t('common.multipleChoice')}</span>
                  </div>
                </div>
              
                              <Button
                  variant="primary"
                  icon={Play}
                  onClick={() => handleStartQuiz(quiz)}
                  className="w-full"
                >
                  {t('common.startQuiz')}
                </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              {t('common.quizInstructions')}
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Read each question carefully before selecting an answer</li>
              <li>• You can navigate between questions using the Previous/Next buttons</li>
              <li>• Make sure to answer all questions before submitting</li>
              <li>• Your results will be shown immediately after completion</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}; 