import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { DataTable } from '../common/DataTable';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Check,
  X,
  User
} from 'lucide-react';
import { getRelatedData } from '../../data/mockData';
import { PreRegisteredStudent } from '../../types';

export const PreRegisteredStudentsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PreRegisteredStudent | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    universityId: ''
  });
  const data = getRelatedData();

  const filteredStudents = data.preRegisteredStudents.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.universityId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setFormData({
      fullName: '',
      universityId: ''
    });
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: PreRegisteredStudent) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      universityId: student.universityId
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Pre-registered student saved:', formData);
    setIsModalOpen(false);
    alert(selectedStudent ? 'Student updated successfully' : 'Student added successfully');
  };

  const handleDeleteStudent = (student: PreRegisteredStudent) => {
    if (confirm('Are you sure you want to delete this pre-registered student?')) {
      console.log('Delete student:', student.id);
      alert('Student deleted successfully');
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: t('auth.fullName'),
      sortable: true,
      render: (student: PreRegisteredStudent) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{student.fullName}</span>
        </div>
      )
    },
    {
      key: 'universityId',
      label: t('auth.universityId'),
      sortable: true,
      render: (student: PreRegisteredStudent) => (
        <span className="font-mono text-gray-900 dark:text-white">{student.universityId}</span>
      )
    },
    {
      key: 'isUsed',
      label: t('common.status'),
      sortable: true,
      render: (student: PreRegisteredStudent) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {student.isUsed ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Used</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Available</span>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.preRegistered')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage pre-registered students who can create accounts
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateStudent}
        >
          Add Student
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          icon={Search}
          placeholder={`${t('common.search')} students...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Students Table */}
      <Card padding="sm">
        <DataTable
          data={filteredStudents}
          columns={columns}
          actions={(student) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditStudent(student)}
                disabled={student.isUsed}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteStudent(student)}
                disabled={student.isUsed}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage="No pre-registered students found"
        />
      </Card>

      {/* Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? 'Edit Pre-registered Student' : 'Add Pre-registered Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.fullName')}
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            placeholder="Enter student's full name"
          />
          
          <Input
            label={t('auth.universityId')}
            value={formData.universityId}
            onChange={(e) => setFormData(prev => ({ ...prev, universityId: e.target.value }))}
            required
            placeholder="ST001"
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