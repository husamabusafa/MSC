import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { DataTable } from '../common/DataTable';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Check,
  X,
  User
} from 'lucide-react';
import { 
  GET_PRE_REGISTERED_STUDENTS,
  CREATE_PRE_REGISTERED_STUDENT,
  UPDATE_PRE_REGISTERED_STUDENT,
  DELETE_PRE_REGISTERED_STUDENT,
  PreRegisteredStudent,
  CreatePreRegisteredStudentInput,
  UpdatePreRegisteredStudentInput,
  PreRegisteredStudentsFilterInput
} from '../../lib/graphql/users';

export const PreRegisteredStudentsPage: React.FC = () => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PreRegisteredStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<PreRegisteredStudent | null>(null);
  const [filters] = useState<PreRegisteredStudentsFilterInput>({});
  const [formData, setFormData] = useState({
    fullName: '',
    universityId: ''
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_PRE_REGISTERED_STUDENTS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network'
  });

  const [createPreRegisteredStudent] = useMutation(CREATE_PRE_REGISTERED_STUDENT, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error creating pre-registered student:', error);
    }
  });

  const [updatePreRegisteredStudent] = useMutation(UPDATE_PRE_REGISTERED_STUDENT, {
    onCompleted: () => {
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating pre-registered student:', error);
    }
  });

  const [deletePreRegisteredStudent] = useMutation(DELETE_PRE_REGISTERED_STUDENT, {
    onCompleted: () => {
      setIsConfirmModalOpen(false);
      setStudentToDelete(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting pre-registered student:', error);
    }
  });

  const students = data?.preRegisteredStudents?.preRegisteredStudents || [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudent) {
      // Update existing student
      const updateInput: UpdatePreRegisteredStudentInput = {
        fullName: formData.fullName,
        universityId: formData.universityId
      };
      
      await updatePreRegisteredStudent({
        variables: {
          id: selectedStudent.id,
          updatePreRegisteredStudentInput: updateInput
        }
      });
    } else {
      // Create new student
      const createInput: CreatePreRegisteredStudentInput = {
        fullName: formData.fullName,
        universityId: formData.universityId
      };
      
      await createPreRegisteredStudent({
        variables: {
          createPreRegisteredStudentInput: createInput
        }
      });
    }
  };

  const handleDeleteStudent = (student: PreRegisteredStudent) => {
    setStudentToDelete(student);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      await deletePreRegisteredStudent({
        variables: {
          id: studentToDelete.id
        }
      });
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: t('common.name'),
      sortable: true,
      render: (student: PreRegisteredStudent) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{student.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.universityId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'universityId',
      label: t('auth.universityId'),
      sortable: true,
      render: (student: PreRegisteredStudent) => (
        <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {student.universityId}
        </span>
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
              <span className="text-green-600 dark:text-green-400">{t('preRegisteredStudents.used')}</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('preRegisteredStudents.unused')}</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      sortable: true,
      render: (student: PreRegisteredStudent) => (
        <span className="text-gray-900 dark:text-white">
          {new Date(student.createdAt).toLocaleDateString()}
        </span>
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
            {t('nav.preRegisteredStudents')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('common.managementDescription')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleCreateStudent}
        >
          {t('preRegisteredStudents.createStudent')}
        </Button>
      </div>

      {/* Students Table */}
      <Card padding="sm">
        <DataTable
          data={students}
          columns={columns}
          actions={(student) => (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => handleEditStudent(student)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteStudent(student)}
              >
                {t('common.delete')}
              </Button>
            </div>
          )}
          emptyMessage={t('preRegisteredStudents.noStudentsFound')}
        />
      </Card>

      {/* Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? t('preRegisteredStudents.editStudent') : t('preRegisteredStudents.createStudent')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.fullName')}
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            placeholder="أحمد محمد"
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteStudent}
        title={t('common.confirmDelete')}
        message={`${t('common.deleteMessage')} "${studentToDelete?.fullName}"?`}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};