import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { FileUpload } from '../../components/common/FileUpload';
import { 
  GET_QUIZ,
  DELETE_QUIZ_QUESTION,
  CREATE_QUIZ_QUESTION,
  Quiz,
  CreateQuizQuestionInput
} from '../../lib/graphql/academic';

interface AdminQuizQuestionsPageProps {
  quizId: string;
}

interface Answer {
  text: string;
  isCorrect: boolean;
  order: number;
}

export const AdminQuizQuestionsPage: React.FC<AdminQuizQuestionsPageProps> = ({ quizId }) => {
  const { t } = useI18n();
  const { showNotification } = useNotification();
  
  // State for inline question creation
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    image: '',
    explanation: '',
    explanationImage: '',
    order: 1
  });
  
  const [answers, setAnswers] = useState<Answer[]>([
    { text: '', isCorrect: false, order: 1 },
    { text: '', isCorrect: false, order: 2 },
    { text: '', isCorrect: false, order: 3 },
    { text: '', isCorrect: false, order: 4 }
  ]);

  // GraphQL queries and mutations
  const { data: quizData, loading: quizLoading, refetch } = useQuery(GET_QUIZ, {
    variables: { id: quizId },
    skip: !quizId
  });

  const [deleteQuestion] = useMutation(DELETE_QUIZ_QUESTION, {
    onCompleted: () => {
      showNotification('success', 'Question deleted successfully!');
      refetch();
    },
    onError: (error) => {
      showNotification('error', `Error: ${error.message}`);
    }
  });

  const [createQuestion, { loading: creating }] = useMutation(CREATE_QUIZ_QUESTION, {
    onCompleted: () => {
      showNotification('success', 'Question created successfully!');
      setShowQuestionForm(false);
      // Reset form
      setFormData({
        text: '',
        image: '',
        explanation: '',
        explanationImage: '',
        order: 1
      });
      setAnswers([
        { text: '', isCorrect: false, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
        { text: '', isCorrect: false, order: 4 }
      ]);
      refetch();
    },
    onError: (error) => {
      showNotification('error', `Error: ${error.message}`);
    }
  });

  const quiz = quizData?.quiz;
  const questions = quiz?.questions || [];

  const handleBack = () => {
    window.history.pushState({}, '', `/admin/quizzes/${quizId}/edit`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleAddQuestion = () => {
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (questionId: string) => {
    window.history.pushState({}, '', `/admin/quizzes/${quizId}/questions/${questionId}/edit`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleDeleteQuestion = async (questionId: string, questionText: string) => {
    if (window.confirm(`هل أنت متأكد من حذف السؤال: "${questionText}"؟`)) {
      await deleteQuestion({
        variables: { id: questionId }
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
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

    const questionInput: CreateQuizQuestionInput = {
      quizId,
      text: formData.text,
      image: formData.image || undefined,
      explanation: formData.explanation || undefined,
      explanationImage: formData.explanationImage || undefined,
      order: questions.length + 1,
      answers: filledAnswers.map(answer => ({
        text: answer.text,
        isCorrect: answer.isCorrect,
        order: answer.order
      }))
    };

    await createQuestion({ variables: { input: questionInput } });
  };

  const handleCancelForm = () => {
    setShowQuestionForm(false);
    // Reset form
    setFormData({
      text: '',
      image: '',
      explanation: '',
      explanationImage: '',
      order: 1
    });
    setAnswers([
      { text: '', isCorrect: false, order: 1 },
      { text: '', isCorrect: false, order: 2 },
      { text: '', isCorrect: false, order: 3 },
      { text: '', isCorrect: false, order: 4 }
    ]);
  };

  if (quizLoading) {
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
            Back
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
              إدارة أسئلة الاختبار
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {quiz.title} - {questions.length} سؤال
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddQuestion}
          className="flex items-center space-x-2 rtl:space-x-reverse bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال</span>
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {/* Inline Question Creation Form */}
        {showQuestionForm && (
          <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  إضافة سؤال جديد
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
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
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
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
                  value={formData.image}
                  onChange={(file, preview) => setFormData({ ...formData, image: preview })}
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
                      <div className="flex-1">
                        <Input
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                          placeholder={`الإجابة ${String.fromCharCode(65 + index)}`}
                          className="w-full"
                        />
                      </div>
                      {answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnswer(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {answers.length < 6 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addAnswer}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة إجابة
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  اختر الإجابة الصحيحة بالنقر على الزر الراديو
                </p>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الشرح
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="أدخل شرح السؤال..."
                />
              </div>

              {/* Explanation Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  صورة توضيحية
                </label>
                <FileUpload
                  value={formData.explanationImage}
                  onChange={(file, preview) => setFormData({ ...formData, explanationImage: preview })}
                  accept="image/*"
                  maxSize={5}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelForm}
                  disabled={creating}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <LoadingSpinner size="sm" />
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    'إضافة السؤال'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {questions.length === 0 && !showQuestionForm ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-4">لا توجد أسئلة في هذا الاختبار</p>
              <Button onClick={handleAddQuestion} className="bg-blue-600 hover:bg-blue-700">
                إضافة أول سؤال
              </Button>
            </div>
          </Card>
        ) : (
          questions.map((question: any, index: number) => (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                {/* Question Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      السؤال {index + 1}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {question.text}
                    </p>
                    
                    {/* Question Image */}
                    {question.image && (
                      <div className="mb-4">
                        <img 
                          src={question.image} 
                          alt="Question" 
                          className="max-w-sm h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id, question.text)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">الإجابات:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.answers?.map((answer: any, answerIndex: number) => (
                      <div 
                        key={answer.id} 
                        className={`p-3 rounded-lg border-2 ${
                          answer.isCorrect 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {String.fromCharCode(65 + answerIndex)}. {answer.text}
                          </span>
                          {answer.isCorrect && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              ✓ صحيح
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      الشرح:
                    </h4>
                    <p className="text-blue-800 dark:text-blue-300">
                      {question.explanation}
                    </p>
                    {question.explanationImage && (
                      <div className="mt-3">
                        <img 
                          src={question.explanationImage} 
                          alt="Explanation" 
                          className="max-w-sm h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 