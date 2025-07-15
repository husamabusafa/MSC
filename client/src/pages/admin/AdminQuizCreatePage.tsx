import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Plus, BookOpen, Target } from 'lucide-react';
import { 
  GET_COURSES, 
  GET_LEVELS,
  CREATE_QUIZ,
  Course,
  Level,
  CreateQuizInput
} from '../../lib/graphql/academic';

export const AdminQuizCreatePage: React.FC = () => {
  const { t } = useI18n();
  const { showNotification } = useNotification();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    isVisible: true,
    hasDuration: false,
    durationMinutes: 30
  });
  const [questions, setQuestions] = useState<any[]>([]);

  // GraphQL queries and mutations
  const { data: levelsData, loading: levelsLoading } = useQuery(GET_LEVELS);
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);

  const [createQuiz, { loading: creating }] = useMutation(CREATE_QUIZ, {
    onCompleted: () => {
      showNotification('success', 'Quiz created successfully!');
      // Navigate back to quizzes page
      window.history.pushState({}, '', '/admin/quizzes');
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    onError: (error) => {
      showNotification('error', `Error: ${error.message}`);
    }
  });

  const levels = levelsData?.levels || [];
  const courses = coursesData?.courses || [];

  const filteredCourses = courses.filter((course: Course) => 
    !selectedLevel || course.levelId === selectedLevel
  );

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

    const createInput: CreateQuizInput = {
      title: formData.title,
      description: formData.description,
      courseId: formData.courseId,
      isVisible: formData.isVisible,
      hasDuration: formData.hasDuration,
      durationMinutes: formData.hasDuration ? formData.durationMinutes : undefined,
      questions: questions.length > 0 ? questions : undefined
    };

    await createQuiz({
      variables: { createQuizInput: createInput }
    });
  };

  const handleAddQuestion = () => {
    // Navigate to question creation page
    window.history.pushState({}, '', `/admin/quizzes/create/question`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (levelsLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
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
              إنشاء اختبار جديد
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              أضف اختبار جديد للطلاب
            </p>
          </div>
        </div>
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

          {/* Questions Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                الأسئلة ({questions.length})
              </h3>
              <Button
                type="button"
                onClick={handleAddQuestion}
                variant="outline"
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال</span>
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                لم يتم إضافة أسئلة بعد
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          السؤال {index + 1}: {question.text}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {question.answers?.length || 0} إجابات
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newQuestions = questions.filter((_, i) => i !== index);
                          setQuestions(newQuestions);
                        }}
                      >
                        <span className="text-red-600">حذف</span>
                      </Button>
                    </div>
                  </Card>
                ))}
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
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating ? <LoadingSpinner size="sm" /> : 'إنشاء الاختبار'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 