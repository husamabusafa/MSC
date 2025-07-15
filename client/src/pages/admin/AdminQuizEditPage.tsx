import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { 
  GET_QUIZ,
  GET_COURSES, 
  GET_LEVELS,
  UPDATE_QUIZ,
  Quiz,
  Course,
  Level,
  UpdateQuizInput
} from '../../lib/graphql/academic';

interface AdminQuizEditPageProps {
  quizId: string;
}

export const AdminQuizEditPage: React.FC<AdminQuizEditPageProps> = ({ quizId }) => {
  const { t } = useI18n();
  const { showNotification } = useNotification();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    isVisible: true,
    hasDuration: false,
    durationMinutes: 30,
    showAnswersImmediately: false
  });

  // GraphQL queries and mutations
  const { data: quizData, loading: quizLoading } = useQuery(GET_QUIZ, {
    variables: { id: quizId },
    skip: !quizId
  });
  const { data: levelsData, loading: levelsLoading } = useQuery(GET_LEVELS);
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);

  const [updateQuiz, { loading: updating }] = useMutation(UPDATE_QUIZ, {
    onCompleted: () => {
      showNotification('success', 'Quiz updated successfully!');
      // Navigate back to quizzes page
      window.history.pushState({}, '', '/admin/quizzes');
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    onError: (error) => {
      showNotification('error', `Error: ${error.message}`);
    }
  });

  const quiz = quizData?.quiz;
  const levels = levelsData?.levels || [];
  const courses = coursesData?.courses || [];

  const filteredCourses = courses.filter((course: Course) => 
    !selectedLevel || course.levelId === selectedLevel
  );

  // Load quiz data when available
  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description,
        courseId: quiz.courseId,
        isVisible: quiz.isVisible,
        hasDuration: quiz.hasDuration || false,
        durationMinutes: quiz.durationMinutes || 30,
        showAnswersImmediately: quiz.showAnswersImmediately || false
      });
      
      // Find the level for this course
      const course = courses.find((c: Course) => c.id === quiz.courseId);
      if (course) {
        setSelectedLevel(course.levelId);
      }
    }
  }, [quiz, courses]);

  const handleBack = () => {
    window.history.pushState({}, '', '/admin/quizzes');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !formData.description) {
      showNotification('error', 'Please fill all required fields');
      return;
    }

    const updateInput: UpdateQuizInput = {
      title: formData.title,
      description: formData.description,
      courseId: formData.courseId,
      isVisible: formData.isVisible,
      hasDuration: formData.hasDuration,
      durationMinutes: formData.hasDuration ? formData.durationMinutes : undefined,
      showAnswersImmediately: formData.showAnswersImmediately
    };

    await updateQuiz({
      variables: { 
        id: quizId,
        updateQuizInput: updateInput 
      }
    });
  };

  const handleManageQuestions = () => {
    // Navigate to questions management page
    window.history.pushState({}, '', `/admin/quizzes/${quizId}/questions`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (quizLoading || levelsLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Quiz not found</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back')}</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              تعديل الاختبار
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              تعديل بيانات الاختبار: {quiz.title}
            </p>
          </div>
        </div>
        <Button
          onClick={handleManageQuestions}
          className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 hover:bg-green-700"
        >
          <Edit className="w-4 h-4" />
          <span>إدارة الأسئلة</span>
        </Button>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiz Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الكويز *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="اسم الاختبار"
                required
                className="w-full"
              />
            </div>

            {/* Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المستوى *
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setFormData({ ...formData, courseId: '' });
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">اختر المستوى</option>
                {levels.map((level: Level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المقرر *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
                disabled={!selectedLevel}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                <option value="">اختر المقرر</option>
                {filteredCourses.map((course: Course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isVisible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('common.visibleToStudents')}
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الوصف *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف الاختبار"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Duration Settings */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إعدادات الوقت
            </h3>
            
            <div className="space-y-4">
              {/* Enable Duration */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="hasDuration"
                  checked={formData.hasDuration}
                  onChange={(e) => setFormData({ ...formData, hasDuration: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasDuration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تحديد وقت للاختبار
                </label>
              </div>

              {/* Duration Minutes */}
              {formData.hasDuration && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    مدة الاختبار:
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                      min="1"
                      max="300"
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      دقيقة
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.hasDuration 
                  ? `سيكون للطلاب ${formData.durationMinutes} دقيقة لإكمال الاختبار`
                  : 'لا يوجد حد زمني للاختبار'
                }
              </p>
            </div>
          </div>

          {/* Answer Display Settings */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إعدادات عرض الإجابات
            </h3>
            
            <div className="space-y-4">
              {/* Show Answers Immediately */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="showAnswersImmediately"
                  checked={formData.showAnswersImmediately}
                  onChange={(e) => setFormData({ ...formData, showAnswersImmediately: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showAnswersImmediately" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  عرض الإجابة الصحيحة فور اختيار الإجابة
                </label>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.showAnswersImmediately 
                  ? 'سيتم عرض الإجابة الصحيحة للطلاب فور اختيار إجابة'
                  : 'سيتم عرض الإجابات الصحيحة للطلاب بعد إكمال الاختبار فقط'
                }
              </p>
            </div>
          </div>

          {/* Questions Summary */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                الأسئلة ({quiz.questions?.length || 0})
              </h3>
              <Button
                type="button"
                onClick={handleManageQuestions}
                variant="outline"
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Edit className="w-4 h-4" />
                <span>إدارة الأسئلة</span>
              </Button>
            </div>

            {(!quiz.questions || quiz.questions.length === 0) ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                لا توجد أسئلة في هذا الاختبار
              </div>
            ) : (
              <div className="space-y-4">
                                 {quiz.questions.slice(0, 3).map((question: any, index: number) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          السؤال {index + 1}: {question.text}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {question.answers?.length || 0} إجابات
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                {quiz.questions.length > 3 && (
                  <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                    و {quiz.questions.length - 3} أسئلة أخرى...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? <LoadingSpinner size="sm" /> : 'حفظ التعديلات'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 