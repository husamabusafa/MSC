import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp,
  BookOpen,
  Award,
  Settings
} from 'lucide-react';
import { GET_GPA_SUBJECTS, GET_LEVELS, Level } from '../../lib/graphql/academic';

interface SubjectGrade {
  id: string;
  gpaSubjectId: string;
  subjectName: string;
  yearName: string;
  creditHours: number;
  grade: number;
}

interface YearGrade {
  year: string;
  percentage: number;
  grade: number;
}

export const GpaCalculatorPage: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'semester' | 'cumulative' | 'years'>('semester');
  
  // Semester/Annual GPA states
  const [semesterSubjects, setSemesterSubjects] = useState<SubjectGrade[]>([]);
  const [semesterResult, setSemesterResult] = useState<number | null>(null);
  
  // Cumulative GPA states
  const [cumulativeSubjects, setCumulativeSubjects] = useState<SubjectGrade[]>([]);
  const [previousGPA, setPreviousGPA] = useState<number>(0);
  const [previousHours, setPreviousHours] = useState<number>(0);
  const [cumulativeResult, setCumulativeResult] = useState<number | null>(null);
  
  // Year-based GPA states
  const [yearGrades, setYearGrades] = useState<YearGrade[]>([
    { year: 'السنة الأولى', percentage: 15, grade: 0 },
    { year: 'السنة الثانية', percentage: 15, grade: 0 },
    { year: 'السنة الثالثة', percentage: 15, grade: 0 },
    { year: 'السنة الرابعة', percentage: 15, grade: 0 },
    { year: 'السنة الخامسة', percentage: 15, grade: 0 },
    { year: 'السنة السادسة', percentage: 25, grade: 0 },
  ]);
  const [yearsResult, setYearsResult] = useState<number | null>(null);
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  
  // Get GPA subjects for selection
  const { data: gpaSubjectsData, loading: gpaLoading } = useQuery(GET_GPA_SUBJECTS);
  const gpaSubjects = gpaSubjectsData?.gpaSubjects || [];
  
  // Get levels for year selection
  const { data: levelsData, loading: levelsLoading } = useQuery(GET_LEVELS);
  const levels = levelsData?.levels || [];

  // Tab navigation
  const tabs = [
    { id: 'semester', label: 'حساب المعدل الفصلي/السنوي', icon: BookOpen },
    { id: 'cumulative', label: 'حساب المعدل التراكمي العام', icon: TrendingUp },
    { id: 'years', label: 'حساب المعدل حسب نسبة السنوات', icon: Award }
  ];

  // Semester/Annual GPA functions
  const addSemesterSubject = () => {
    const newSubject: SubjectGrade = {
      id: Date.now().toString(),
      gpaSubjectId: '',
      subjectName: '',
      yearName: '',
      creditHours: 3,
      grade: 0
    };
    setSemesterSubjects([...semesterSubjects, newSubject]);
  };

  const updateSemesterSubject = (id: string, field: keyof SubjectGrade, value: any) => {
    setSemesterSubjects(prev => prev.map(subject => {
      if (subject.id === id) {
        if (field === 'gpaSubjectId') {
          const selectedSubject = gpaSubjects.find((s: any) => s.id === value);
          if (selectedSubject) {
            return {
              ...subject,
              gpaSubjectId: value,
              subjectName: selectedSubject.subjectName,
              yearName: selectedSubject.yearName,
              creditHours: selectedSubject.creditHours
            };
          }
        }
        return { ...subject, [field]: value };
      }
      return subject;
    }));
  };

  const removeSemesterSubject = (id: string) => {
    setSemesterSubjects(prev => prev.filter(subject => subject.id !== id));
  };

  const calculateSemesterGPA = () => {
    if (semesterSubjects.length === 0) return;
    
    let totalGradePoints = 0;
    let totalHours = 0;
    
    semesterSubjects.forEach(subject => {
      totalGradePoints += subject.grade * subject.creditHours;
      totalHours += subject.creditHours;
    });
    
    const gpa = totalHours > 0 ? totalGradePoints / totalHours : 0;
    setSemesterResult(gpa);
  };

  // Cumulative GPA functions
  const addCumulativeSubject = () => {
    const newSubject: SubjectGrade = {
      id: Date.now().toString(),
      gpaSubjectId: '',
      subjectName: '',
      yearName: '',
      creditHours: 3,
      grade: 0
    };
    setCumulativeSubjects([...cumulativeSubjects, newSubject]);
  };

  const updateCumulativeSubject = (id: string, field: keyof SubjectGrade, value: any) => {
    setCumulativeSubjects(prev => prev.map(subject => {
      if (subject.id === id) {
        if (field === 'gpaSubjectId') {
          const selectedSubject = gpaSubjects.find((s: any) => s.id === value);
          if (selectedSubject) {
            return {
              ...subject,
              gpaSubjectId: value,
              subjectName: selectedSubject.subjectName,
              yearName: selectedSubject.yearName,
              creditHours: selectedSubject.creditHours
            };
          }
        }
        return { ...subject, [field]: value };
      }
      return subject;
    }));
  };

  const removeCumulativeSubject = (id: string) => {
    setCumulativeSubjects(prev => prev.filter(subject => subject.id !== id));
  };

  const calculateCumulativeGPA = () => {
    if (cumulativeSubjects.length === 0) return;
    
    let currentGradePoints = 0;
    let currentHours = 0;
    
    cumulativeSubjects.forEach(subject => {
      currentGradePoints += subject.grade * subject.creditHours;
      currentHours += subject.creditHours;
    });
    
    const previousGradePoints = (previousGPA / 100) * previousHours;
    const totalGradePoints = previousGradePoints + currentGradePoints;
    const totalHours = previousHours + currentHours;
    
    const gpa = totalHours > 0 ? (totalGradePoints / totalHours) * 100 : 0;
    setCumulativeResult(gpa);
  };

  // Year-based GPA functions
  const updateYearGrade = (index: number, grade: number) => {
    setYearGrades(prev => prev.map((year, i) => 
      i === index ? { ...year, grade } : year
    ));
  };

  const updateYearPercentage = (index: number, percentage: number) => {
    setYearGrades(prev => prev.map((year, i) => 
      i === index ? { ...year, percentage } : year
    ));
  };

  const calculateYearsGPA = () => {
    let totalWeightedGrade = 0;
    let totalPercentage = 0;
    
    yearGrades.forEach(year => {
      totalWeightedGrade += year.grade * (year.percentage / 100);
      totalPercentage += year.percentage;
    });
    
    const gpa = totalPercentage > 0 ? totalWeightedGrade : 0;
    setYearsResult(gpa);
  };

  if (gpaLoading || levelsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="p-2 bg-student-500 rounded-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            حاسبة المعدل
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          احسب معدلك الدراسي بطرق مختلفة
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 rtl:space-x-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 rtl:space-x-reverse py-4 px-2 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-student-500 text-student-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'semester' && (
        <SemesterGPATab
          subjects={semesterSubjects}
          gpaSubjects={gpaSubjects}
          result={semesterResult}
          onAddSubject={addSemesterSubject}
          onUpdateSubject={updateSemesterSubject}
          onRemoveSubject={removeSemesterSubject}
          onCalculate={calculateSemesterGPA}
          t={t}
        />
      )}

      {activeTab === 'cumulative' && (
        <CumulativeGPATab
          subjects={cumulativeSubjects}
          gpaSubjects={gpaSubjects}
          previousGPA={previousGPA}
          previousHours={previousHours}
          result={cumulativeResult}
          onAddSubject={addCumulativeSubject}
          onUpdateSubject={updateCumulativeSubject}
          onRemoveSubject={removeCumulativeSubject}
          onCalculate={calculateCumulativeGPA}
          onUpdatePreviousGPA={setPreviousGPA}
          onUpdatePreviousHours={setPreviousHours}
          t={t}
        />
      )}

      {activeTab === 'years' && (
        <YearGPATab
          yearGrades={yearGrades}
          result={yearsResult}
          onUpdateYearGrade={updateYearGrade}
          onUpdateYearPercentage={updateYearPercentage}
          onCalculate={calculateYearsGPA}
          onEditPercentages={() => setShowPercentageModal(true)}
          t={t}
        />
      )}

      {/* Percentage Edit Modal */}
      <Modal
        isOpen={showPercentageModal}
        onClose={() => setShowPercentageModal(false)}
        title="تعديل نسب السنوات"
      >
        <div className="space-y-4">
          {yearGrades.map((year, index) => (
            <div key={year.year} className="flex items-center space-x-4 rtl:space-x-reverse">
              <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {year.year}
              </label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Input
                  type="number"
                  value={year.percentage}
                  onChange={(e) => updateYearPercentage(index, Number(e.target.value))}
                  className="w-20"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowPercentageModal(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => setShowPercentageModal(false)}
            >
              حفظ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Semester GPA Tab Component
const SemesterGPATab: React.FC<{
  subjects: SubjectGrade[];
  gpaSubjects: any[];
  result: number | null;
  onAddSubject: () => void;
  onUpdateSubject: (id: string, field: keyof SubjectGrade, value: any) => void;
  onRemoveSubject: (id: string) => void;
  onCalculate: () => void;
  t: any;
}> = ({ subjects, gpaSubjects, result, onAddSubject, onUpdateSubject, onRemoveSubject, onCalculate, t }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              المواد الدراسية
            </h2>
            <Button onClick={onAddSubject} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مادة
            </Button>
          </div>

          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    المادة
                  </label>
                  <select
                    value={subject.gpaSubjectId}
                    onChange={(e) => onUpdateSubject(subject.id, 'gpaSubjectId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-student-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">اختر المادة</option>
                    {gpaSubjects.map((gpaSubject) => (
                      <option key={gpaSubject.id} value={gpaSubject.id}>
                        {gpaSubject.subjectName} - {gpaSubject.yearName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    السنة
                  </label>
                  <Input
                    type="text"
                    value={subject.yearName}
                    onChange={(e) => onUpdateSubject(subject.id, 'yearName', e.target.value)}
                    placeholder="مثال: السنة الأولى"
                    disabled={!!subject.gpaSubjectId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الساعات المعتمدة
                  </label>
                  <Input
                    type="number"
                    value={subject.creditHours}
                    onChange={(e) => onUpdateSubject(subject.id, 'creditHours', Number(e.target.value))}
                    min="1"
                    max="10"
                    disabled={!!subject.gpaSubjectId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الدرجة (%)
                  </label>
                  <Input
                    type="number"
                    value={subject.grade}
                    onChange={(e) => onUpdateSubject(subject.id, 'grade', Number(e.target.value))}
                    min="0"
                    max="100"
                    placeholder="مثال: 85.5"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemoveSubject(subject.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {subjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  لم يتم إضافة أي مادة بعد
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  اضغط على "إضافة مادة" لبدء حساب المعدل
                </p>
              </div>
            )}
          </div>

          {subjects.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <Button onClick={onCalculate} className="bg-student-500 hover:bg-student-600">
                <Calculator className="w-4 h-4 mr-2" />
                حساب المعدل
              </Button>

              {result !== null && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      المعدل الفصلي/السنوي:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {result.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Cumulative GPA Tab Component
const CumulativeGPATab: React.FC<{
  subjects: SubjectGrade[];
  gpaSubjects: any[];
  previousGPA: number;
  previousHours: number;
  result: number | null;
  onAddSubject: () => void;
  onUpdateSubject: (id: string, field: keyof SubjectGrade, value: any) => void;
  onRemoveSubject: (id: string) => void;
  onCalculate: () => void;
  onUpdatePreviousGPA: (value: number) => void;
  onUpdatePreviousHours: (value: number) => void;
  t: any;
}> = ({ 
  subjects, 
  gpaSubjects, 
  previousGPA, 
  previousHours, 
  result, 
  onAddSubject, 
  onUpdateSubject, 
  onRemoveSubject, 
  onCalculate,
  onUpdatePreviousGPA,
  onUpdatePreviousHours,
  t 
}) => {
  return (
    <div className="space-y-6">
      {/* Previous GPA Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            المعلومات السابقة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المعدل التراكمي السابق (%)
              </label>
              <Input
                type="number"
                value={previousGPA}
                onChange={(e) => onUpdatePreviousGPA(Number(e.target.value))}
                placeholder="مثال: 85.5"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                إجمالي الساعات السابقة
              </label>
              <Input
                type="number"
                value={previousHours}
                onChange={(e) => onUpdatePreviousHours(Number(e.target.value))}
                placeholder="مثال: 120"
                min="0"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Current Subjects Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              المواد الحالية
            </h2>
            <Button onClick={onAddSubject} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مادة
            </Button>
          </div>

          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    المادة
                  </label>
                  <select
                    value={subject.gpaSubjectId}
                    onChange={(e) => onUpdateSubject(subject.id, 'gpaSubjectId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-student-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">اختر المادة</option>
                    {gpaSubjects.map((gpaSubject) => (
                      <option key={gpaSubject.id} value={gpaSubject.id}>
                        {gpaSubject.subjectName} - {gpaSubject.yearName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    السنة
                  </label>
                  <Input
                    type="text"
                    value={subject.yearName}
                    onChange={(e) => onUpdateSubject(subject.id, 'yearName', e.target.value)}
                    placeholder="مثال: السنة الأولى"
                    disabled={!!subject.gpaSubjectId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الساعات المعتمدة
                  </label>
                  <Input
                    type="number"
                    value={subject.creditHours}
                    onChange={(e) => onUpdateSubject(subject.id, 'creditHours', Number(e.target.value))}
                    min="1"
                    max="10"
                    disabled={!!subject.gpaSubjectId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الدرجة (%)
                  </label>
                  <Input
                    type="number"
                    value={subject.grade}
                    onChange={(e) => onUpdateSubject(subject.id, 'grade', Number(e.target.value))}
                    min="0"
                    max="100"
                    placeholder="مثال: 85.5"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemoveSubject(subject.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {subjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  لم يتم إضافة أي مادة بعد
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  اضغط على "إضافة مادة" لبدء حساب المعدل التراكمي
                </p>
              </div>
            )}
          </div>

          {subjects.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <Button onClick={onCalculate} className="bg-student-500 hover:bg-student-600">
                <Calculator className="w-4 h-4 mr-2" />
                حساب المعدل التراكمي
              </Button>

              {result !== null && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      المعدل التراكمي العام:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {result.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Year GPA Tab Component
const YearGPATab: React.FC<{
  yearGrades: YearGrade[];
  result: number | null;
  onUpdateYearGrade: (index: number, grade: number) => void;
  onUpdateYearPercentage: (index: number, percentage: number) => void;
  onCalculate: () => void;
  onEditPercentages: () => void;
  t: any;
}> = ({ yearGrades, result, onUpdateYearGrade, onUpdateYearPercentage, onCalculate, onEditPercentages, t }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              معدلات السنوات
            </h2>
            <Button onClick={onEditPercentages} size="sm" variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              تعديل النسب
            </Button>
          </div>

          <div className="space-y-4">
            {yearGrades.map((year, index) => (
              <div key={year.year} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {year.year} (النسبة: {year.percentage}%)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ادخل المعدل (%)
                  </label>
                  <Input
                    type="number"
                    value={year.grade}
                    onChange={(e) => onUpdateYearGrade(index, Number(e.target.value))}
                    min="0"
                    max="100"
                    placeholder="مثال: 85.5"
                  />
                </div>

                <div className="flex items-center justify-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      المساهمة: {(year.grade * year.percentage / 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Button onClick={onCalculate} className="bg-student-500 hover:bg-student-600">
              <Calculator className="w-4 h-4 mr-2" />
              حساب المعدل التراكمي
            </Button>

            {result !== null && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    المعدل التراكمي النهائي:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {result.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GpaCalculatorPage; 