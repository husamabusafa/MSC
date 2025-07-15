import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Image, 
  HelpCircle,
  Check,
  FileText
} from 'lucide-react';
import { Question } from '../../types';

interface QuizQuestionEditorProps {
  quizId: string;
  questions: Question[];
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
}

interface QuestionFormData {
  text: string;
  image?: string;
  explanation?: string;
  explanationImage?: string;
  answers: AnswerFormData[];
}

interface AnswerFormData {
  text: string;
  isCorrect: boolean;
}

export const QuizQuestionEditor: React.FC<QuizQuestionEditorProps> = ({
  quizId,
  questions: initialQuestions,
  onSave,
  onCancel
}) => {
  const { t } = useI18n();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
    text: '',
    image: '',
    explanation: '',
    explanationImage: '',
    answers: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setFormData({
      text: '',
      image: '',
      explanation: '',
      explanationImage: '',
      answers: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
    setErrors({});
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      text: question.text,
      image: question.image || '',
      explanation: question.explanation || '',
      explanationImage: question.explanationImage || '',
      answers: question.answers.map(answer => ({
        text: answer.text,
        isCorrect: answer.isCorrect
      }))
    });
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm(t('messages.confirmDelete.question'))) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (formData.answers.length < 2) {
      newErrors.answers = 'At least 2 answers are required';
    }
    
    const nonEmptyAnswers = formData.answers.filter(answer => answer.text.trim());
    if (nonEmptyAnswers.length < 2) {
      newErrors.answers = 'At least 2 answers must have text';
    }
    
    const correctAnswers = formData.answers.filter(answer => answer.isCorrect);
    if (correctAnswers.length === 0) {
      newErrors.answers = 'At least one answer must be marked as correct';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const questionData: Question = {
      id: selectedQuestion?.id || `q_${Date.now()}`,
      text: formData.text,
      image: formData.image || undefined,
      explanation: formData.explanation || undefined,
      explanationImage: formData.explanationImage || undefined,
      quizId,
      order: selectedQuestion?.order || questions.length + 1,
      answers: formData.answers
        .filter(answer => answer.text.trim())
        .map((answer, index) => ({
          id: `a_${Date.now()}_${index}`,
          text: answer.text,
          isCorrect: answer.isCorrect,
          questionId: selectedQuestion?.id || `q_${Date.now()}`,
          order: index + 1
        }))
    };

    if (selectedQuestion) {
      setQuestions(prev => prev.map(q => q.id === selectedQuestion.id ? questionData : q));
    } else {
      setQuestions(prev => [...prev, questionData]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleAddAnswer = () => {
    if (formData.answers.length < 6) {
      setFormData(prev => ({
        ...prev,
        answers: [...prev.answers, { text: '', isCorrect: false }]
      }));
    }
  };

  const handleRemoveAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      setFormData(prev => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAnswerChange = (index: number, field: keyof AnswerFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => 
        i === index ? { ...answer, [field]: value } : answer
      )
    }));
  };

  const handleSaveQuiz = () => {
    onSave(questions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < questions.length) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      
      // Update order
      newQuestions.forEach((q, i) => {
        q.order = i + 1;
      });
      
      setQuestions(newQuestions);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage questions and answers for this quiz
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSaveQuiz}
          >
            Save Quiz
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Questions Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding your first question to the quiz
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={handleCreateQuestion}
              >
                Add First Question
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {questions.map((question, index) => (
              <Card key={question.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-admin-secondary-100 dark:bg-admin-secondary-900/20 text-admin-secondary-600 dark:text-admin-secondary-400 px-2 py-1 rounded text-sm font-medium">
                        Question {index + 1}
                      </span>
                      {question.image && (
                        <span className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded text-sm font-medium">
                          <Image className="w-3 h-3 inline mr-1" />
                          Has Image
                        </span>
                      )}
                      {question.explanation && (
                        <span className="bg-admin-100 dark:bg-admin-900/20 text-admin-600 dark:text-admin-400 px-2 py-1 rounded text-sm font-medium">
                          <FileText className="w-3 h-3 inline mr-1" />
                          Has Explanation
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      {question.text}
                    </h3>
                    
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answer.id} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            answer.isCorrect 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {answer.isCorrect && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${
                            answer.isCorrect 
                              ? 'font-medium text-green-700 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {String.fromCharCode(65 + answerIndex)}. {answer.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditQuestion(question)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            <Card>
              <div className="text-center py-6">
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={handleCreateQuestion}
                >
                  Add Another Question
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedQuestion ? t('common.editQuestion') : t('common.addQuestion')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.questionText')} *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('common.enterQuestionHere')}
            />
            {errors.text && (
              <p className="text-red-600 text-sm mt-1">{errors.text}</p>
            )}
          </div>

          {/* Question Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.questionImage')} ({t('common.optional')})
            </label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder={t('common.enterImageUrl')}
              icon={Image}
            />
          </div>

          {/* Answers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer Options *
            </label>
            <div className="space-y-3">
              {formData.answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={answer.isCorrect}
                    onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <Input
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                      placeholder={`Answer ${String.fromCharCode(65 + index)}`}
                    />
                  </div>
                  {formData.answers.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={() => handleRemoveAnswer(index)}
                    >
                      <span className="sr-only">Remove answer</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.answers && (
              <p className="text-red-600 text-sm mt-1">{errors.answers}</p>
            )}
            {formData.answers.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddAnswer}
                className="mt-2"
              >
                Add Answer Option
              </Button>
            )}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide an explanation for the correct answer..."
            />
          </div>

          {/* Explanation Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation Image (Optional)
            </label>
            <Input
              value={formData.explanationImage}
              onChange={(e) => setFormData(prev => ({ ...prev, explanationImage: e.target.value }))}
              placeholder="Enter explanation image URL..."
              icon={Image}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {selectedQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}; 