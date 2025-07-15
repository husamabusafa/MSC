import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  BookOpen,
  Clock
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { GpaSubject } from '../../types';

export const GpaSubjectsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<GpaSubject | null>(null);
  const [formData, setFormData] = useState({
    yearName: '',
    subjectName: '',
    creditHours: 3,
    order: 1
  });
  const data = getRelatedData();

  const filteredSubjects = data.gpaSubjects.filter(subject => {
    const matchesSearch = subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.yearName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !selectedYear || subject.yearName === selectedYear;
    return matchesSearch && matchesYear;
  }).sort((a, b) => a.order - b.order);

  const uniqueYears = [...new Set(data.gpaSubjects.map(subject => subject.yearName))];

  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setFormData({
      yearName: '',
      subjectName: '',
      creditHours: 3,
      order: data.gpaSubjects.length + 1
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('GPA subject saved:', formData);
    setIsModalOpen(false);
    alert(selectedSubject ? t('messages.success.subjectUpdated') : t('messages.success.subjectCreated'));
  };

  const handleDeleteSubject = (subject: GpaSubject) => {
    if (confirm(t('messages.confirmDelete.subject'))) {
      console.log('Delete subject:', subject.id);
      alert(t('messages.success.subjectDeleted'));
    }
  };

  const columns = [
    {
      key: 'order',
      label: t('common.order'),
      sortable: true,
      width: 'w-20',
      render: (subject: GpaSubject) => (
        <span className="font-mono text-gray-900 dark:text-white">#{subject.order}</span>
      )
    },
    {
      key: 'yearName',
      label: t('academic.yearName'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{subject.yearName}</span>
        </div>
      )
    },
    {
      key: 'subjectName',
      label: t('academic.subjectName'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{subject.subjectName}</span>
        </div>
      )
    },
    {
      key: 'creditHours',
      label: t('academic.creditHours'),
      sortable: true,
      render: (subject: GpaSubject) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{subject.creditHours} hours</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.gpaSubjects')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage subjects for GPA calculation
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateSubject}
        >
          Add Subject
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={`${t('common.search')} subjects...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

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
          emptyMessage="No subjects found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSubject ? 'Edit Subject' : 'Add Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('academic.yearName')}
            value={formData.yearName}
            onChange={(e) => setFormData(prev => ({ ...prev, yearName: e.target.value }))}
            required
            placeholder="First Year"
          />
          
          <Input
            label={t('academic.subjectName')}
            value={formData.subjectName}
            onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
            required
            placeholder="Mathematics I"
          />
          
          <Input
            type="number"
            label={t('academic.creditHours')}
            value={formData.creditHours}
            onChange={(e) => setFormData(prev => ({ ...prev, creditHours: parseInt(e.target.value) || 3 }))}
            min="1"
            max="6"
            required
          />
          
          <Input
            type="number"
            label="Order"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
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