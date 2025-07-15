import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FileUpload } from '../../components/common/FileUpload';
import { ArrowLeft, Plus, X, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { 
  GET_COURSES, 
  GET_LEVELS,
  CREATE_QUIZ,
  Course,
  Level,
  CreateQuizInput
} from '../../lib/graphql/academic';

interface Answer {
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id: string;
  text: string;
  image?: string;
  explanation?: string;
  explanationImage?: string;
  order: number;
  answers: Answer[];
}

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
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // State for inline question creation
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    text: '',
    image: '',
    explanation: '',
    explanationImage: '',
  });
  
  const [answers, setAnswers] = useState<Answer[]>([
    { text: '', isCorrect: false, order: 1 },
    { text: '', isCorrect: false, order: 2 },
    { text: '', isCorrect: false, order: 3 },
    { text: '', isCorrect: false, order: 4 }
  ]);

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
      questions: questions.length > 0 ? questions.map(q => ({
        text: q.text,
        image: q.image || undefined,
        explanation: q.explanation || undefined,
        explanationImage: q.explanationImage || undefined,
        order: q.order,
        answers: q.answers.map(a => ({
          text: a.text,
          isCorrect: a.isCorrect,
          order: a.order
        }))
      })) : undefined
    };

    await createQuiz({
      variables: { createQuizInput: createInput }
    });
  };

  const handleAddQuestion = () => {
    setShowQuestionForm(true);
  };

  // Form handlers for inline question creation
  const handleAnswerChange = (index: number, field: keyof Answer, value: string | boolean) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index
    }));
    setAnswers(newAnswers);
  };

  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { text: '', isCorrect: false, order: answers.length + 1 }]);
    }
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      const reorderedAnswers = newAnswers.map((answer, i) => ({
        ...answer,
        order: i + 1
      }));
      setAnswers(reorderedAnswers);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionFormData.text.trim()) {
      showNotification('error', 'Please enter question text');
      return;
    }

    const filledAnswers = answers.filter(answer => answer.text.trim() !== '');
    if (filledAnswers.length < 2) {
      showNotification('error', 'Please provide at least 2 answers');
      return;
    }

    const hasCorrectAnswer = filledAnswers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      showNotification('error', 'Please select a correct answer');
      return;
    }

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: questionFormData.text,
      image: questionFormData.image || undefined,
      explanation: questionFormData.explanation || undefined,
      explanationImage: questionFormData.explanationImage || undefined,
      order: questions.length + 1,
      answers: filledAnswers
    };

    setQuestions([...questions, newQuestion]);
    setShowQuestionForm(false);
    resetQuestionForm();
    showNotification('success', 'Question added successfully!');
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      text: '',
      image: '',
      explanation: '',
      explanationImage: '',
    });
    setAnswers([
      { text: '', isCorrect: false, order: 1 },
      { text: '', isCorrect: false, order: 2 },
      { text: '', isCorrect: false, order: 3 },
      { text: '', isCorrect: false, order: 4 }
    ]);
  };

  const handleCancelQuestionForm = () => {
    setShowQuestionForm(false);
    resetQuestionForm();
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      setQuestions(questions.filter(q => q.id !== questionId));
      showNotification('success', 'Question deleted successfully!');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionFormData({
      text: question.text,
      image: question.image || '',
      explanation: question.explanation || '',
      explanationImage: question.explanationImage || '',
    });
    setAnswers(question.answers);
    setShowQuestionForm(true);
    // Remove the question from the list so it can be re-added after editing
    setQuestions(questions.filter(q => q.id !== question.id));
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

            <div className="space-y-4">
              {/* Inline Question Creation Form */}
              {showQuestionForm && (
                <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
                  <form onSubmit={handleQuestionSubmit} className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        إضافة سؤال جديد
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelQuestionForm}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        نص السؤال *
                      </label>
                      <textarea
                        value={questionFormData.text}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        placeholder="أدخل نص السؤال..."
                        required
                      />
                    </div>

                    {/* Question Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        صورة السؤال
                      </label>
                      <FileUpload
                        value={questionFormData.image}
                        onChange={(file, preview) => setQuestionFormData({ ...questionFormData, image: preview })}
                        accept="image/*"
                        maxSize={5}
                      />
                    </div>

                    {/* Answers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        الإجابات *
                      </label>
                      <div className="space-y-3">
                        {answers.map((answer, index) => (
                          <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={answer.isCorrect}
                              onChange={() => handleCorrectAnswerChange(index)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Input
                              type="text"
                              value={answer.text}
                              onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                              placeholder={`الإجابة ${index + 1}`}
                              className="flex-1 py-4 text-base"
                            />
                            {answers.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAnswer(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {answers.length < 6 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addAnswer}
                            className="flex items-center space-x-2 rtl:space-x-reverse text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                            <span>إضافة إجابة</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        شرح الإجابة
                      </label>
                      <textarea
                        value={questionFormData.explanation}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        placeholder="أدخل شرح الإجابة (اختياري)..."
                      />
                    </div>

                    {/* Explanation Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        صورة توضيحية
                      </label>
                      <FileUpload
                        value={questionFormData.explanationImage}
                        onChange={(file, preview) => setQuestionFormData({ ...questionFormData, explanationImage: preview })}
                        accept="image/*"
                        maxSize={5}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancelQuestionForm}
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        إضافة السؤال
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Existing Questions List */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            السؤال {index + 1}: {question.text}
                          </h4>
                          {question.image && (
                            <img 
                              src={question.image} 
                              alt="Question" 
                              className="w-20 h-20 object-cover rounded-lg mb-2"
                            />
                          )}
                          <div className="space-y-1">
                            {question.answers.map((answer, answerIndex) => (
                              <div key={answerIndex} className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div className={`w-2 h-2 rounded-full ${answer.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className={`text-sm ${answer.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                  {answer.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {questions.length === 0 && !showQuestionForm && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  لا توجد أسئلة حتى الآن. اضغط "إضافة سؤال" لإنشاء أول سؤال.
                </div>
              )}
            </div>
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