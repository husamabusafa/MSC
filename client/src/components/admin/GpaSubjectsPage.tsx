import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen
} from 'lucide-react';
import { 
  GET_GPA_SUBJECTS, 
  CREATE_GPA_SUBJECT, 
  UPDATE_GPA_SUBJECT, 
  DELETE_GPA_SUBJECT,
  GpaSubject,
  CreateGpaSubjectInput,
  UpdateGpaSubjectInput
} from '../../lib/graphql/academic';

export const GpaSubjectsPage: React.FC = () => {
  const { t } = useI18n();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<GpaSubject | null>(null);
  const [formData, setFormData] = useState({
    yearName: '',
    subjectName: '',
    creditHours: 3,
    order: 1
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_GPA_SUBJECTS, {
    fetchPolicy: 'cache-and-network'
  });

  const [createGpaSubject] = useMutation(CREATE_GPA_SUBJECT, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      alert(t('gpaSubjects.subjectCreated'));
    },
    onError: (error) => {
      alert(`Error creating GPA subject: ${error.message}`);
    }
  });

  const [updateGpaSubject] = useMutation(UPDATE_GPA_SUBJECT, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
      alert(t('gpaSubjects.subjectUpdated'));
    },
    onError: (error) => {
      alert(`Error updating GPA subject: ${error.message}`);
    }
  });

  const [deleteGpaSubject] = useMutation(DELETE_GPA_SUBJECT, {
    onCompleted: () => {
      refetch();
      alert(t('gpaSubjects.subjectDeleted'));
    },
    onError: (error) => {
      alert(`Error deleting GPA subject: ${error.message}`);
    }
  });

  const subjects = data?.gpaSubjects || [];

  const filteredSubjects = subjects.filter((subject: GpaSubject) => {
    const matchesYear = !selectedYear || subject.yearName === selectedYear;
    return matchesYear;
  }).sort((a: GpaSubject, b: GpaSubject) => a.order - b.order);

  const uniqueYears: string[] = [...new Set(subjects.map((subject: GpaSubject) => subject.yearName))];

  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setFormData({
      yearName: '',
      subjectName: '',
      creditHours: 3,
      order: subjects.length + 1
    });
    setIsModalOpen(true);
  };

  const handleEditSubject = (subject: GpaSubject) => {
    setSelectedSubject(subject);
    setFormData({
      yearName: subject.yearName,
      subjectName: subject.subjectName,
      creditHours: subject.creditHours,
      order: subject.order
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubject) {
      // Update existing subject
      const updateInput: UpdateGpaSubjectInput = {
        yearName: formData.yearName,
        subjectName: formData.subjectName,
        creditHours: formData.creditHours,
        order: formData.order
      };
      
      await updateGpaSubject({
        variables: {
          id: selectedSubject.id,
          updateGpaSubjectInput: updateInput
        }
      });
    } else {
      // Create new subject
      const createInput: CreateGpaSubjectInput = {
        yearName: formData.yearName,
        subjectName: formData.subjectName,
        creditHours: formData.creditHours,
        order: formData.order
      };
      
      await createGpaSubject({
        variables: {
          createGpaSubjectInput: createInput
        }
      });
    }
  };

  const handleDeleteSubject = async (subject: GpaSubject) => {
    if (confirm(t('gpaSubjects.confirmDelete'))) {
      await deleteGpaSubject({
        variables: {
          id: subject.id
        }
      });
    }
  };

  const columns = [
    {
      key: 'yearName',
      label: t('gpaSubjects.year'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {subject.yearName}
          </span>
        </div>
      )
    },
    {
      key: 'subjectName',
      label: t('gpaSubjects.subject'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{subject.subjectName}</span>
        </div>
      )
    },
    {
      key: 'creditHours',
      label: t('gpaSubjects.creditHours'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
          {subject.creditHours} {t('gpaSubjects.hours')}
        </span>
      )
    },
    {
      key: 'order',
      label: t('common.order'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <span className="text-gray-900 dark:text-white">{subject.order}</span>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.gpaSubjects')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('common.managementDescription')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateSubject}
        >
          {t('gpaSubjects.createSubject')}
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('gpaSubjects.allYears')}</option>
              {uniqueYears.map((year: string) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Subjects Table */}
      <Card padding="sm">
        <DataTable
          data={filteredSubjects}
          columns={columns}
          actions={(subject) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditSubject(subject)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteSubject(subject)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage={t('gpaSubjects.noSubjectsFound')}
        />
      </Card>

      {/* Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSubject ? t('gpaSubjects.editSubject') : t('gpaSubjects.createSubject')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('gpaSubjects.yearName')}
            value={formData.yearName}
            onChange={(e) => setFormData(prev => ({ ...prev, yearName: e.target.value }))}
            required
            placeholder="السنة الأولى"
          />
          
          <Input
            label={t('gpaSubjects.subjectName')}
            value={formData.subjectName}
            onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
            required
            placeholder="الرياضيات"
          />
          
          <Input
            type="number"
            label={t('gpaSubjects.creditHours')}
            value={formData.creditHours.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, creditHours: parseInt(e.target.value) }))}
            min="1"
            max="10"
            required
          />
          
          <Input
            type="number"
            label={t('common.order')}
            value={formData.order.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
            min="1"
            required
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};