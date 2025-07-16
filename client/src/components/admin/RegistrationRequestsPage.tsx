import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  User, 
  CreditCard, 
  Calendar,
  MessageSquare 
} from 'lucide-react';
import {
  GET_ALL_REGISTRATION_REQUESTS_QUERY,
  APPROVE_REGISTRATION_REQUEST_MUTATION,
  REJECT_REGISTRATION_REQUEST_MUTATION,
  RegistrationRequestResponse,
  ApproveRegistrationRequestInput,
  RejectRegistrationRequestInput,
} from '../../lib/graphql/auth';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RegistrationRequestResponse;
  onApprove: (requestId: string, adminNotes?: string) => void;
  onReject: (requestId: string, adminNotes?: string) => void;
  isLoading: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  isLoading,
}) => {
  const { t } = useI18n();
  const [adminNotes, setAdminNotes] = useState('');

  const handleApprove = () => {
    onApprove(request.id, adminNotes || undefined);
  };

  const handleReject = () => {
    onReject(request.id, adminNotes || undefined);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('registrationRequests.reviewRequest')}>
      <div className="space-y-6">
        {/* Request Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            {t('registrationRequests.requestDetails')}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{request.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('registrationRequests.submittedOn')} {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{request.email}</span>
            </div>
            {request.universityId && (
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{request.universityId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        <div>
          <Input
            type="text"
            label={t('registrationRequests.adminNotes')}
            icon={MessageSquare}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={t('registrationRequests.adminNotesPlaceholder')}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 gap-2">
          <Button
            onClick={handleReject}
            variant="outline"
            size="md"
            colorScheme="admin"
            disabled={isLoading}
            className="min-w-[100px] border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {t('registrationRequests.reject')}
          </Button>
          <Button
            onClick={handleApprove}
            variant="primary"
            size="md"
            colorScheme="admin"
            isLoading={isLoading}
            className="min-w-[100px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            {t('registrationRequests.approve')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const RegistrationRequestsPage: React.FC = () => {
  const { t } = useI18n();
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestResponse | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, loading, refetch } = useQuery<{
    getAllRegistrationRequests: RegistrationRequestResponse[];
  }>(GET_ALL_REGISTRATION_REQUESTS_QUERY);

  const [approveRequest, { loading: approveLoading }] = useMutation<
    { approveRegistrationRequest: RegistrationRequestResponse },
    { input: ApproveRegistrationRequestInput }
  >(APPROVE_REGISTRATION_REQUEST_MUTATION);

  const [rejectRequest, { loading: rejectLoading }] = useMutation<
    { rejectRegistrationRequest: RegistrationRequestResponse },
    { input: RejectRegistrationRequestInput }
  >(REJECT_REGISTRATION_REQUEST_MUTATION);

  const handleApprove = async (requestId: string, adminNotes?: string) => {
    try {
      await approveRequest({
        variables: {
          input: { requestId, adminNotes },
        },
      });
      
      setToast({ message: t('registrationRequests.approveSuccess'), type: 'success' });
      setSelectedRequest(null);
      refetch();
    } catch (error: any) {
      setToast({ message: error.message || t('registrationRequests.approveFailed'), type: 'error' });
    }
  };

  const handleReject = async (requestId: string, adminNotes?: string) => {
    try {
      await rejectRequest({
        variables: {
          input: { requestId, adminNotes },
        },
      });
      
      setToast({ message: t('registrationRequests.rejectSuccess'), type: 'success' });
      setSelectedRequest(null);
      refetch();
    } catch (error: any) {
      setToast({ message: error.message || t('registrationRequests.rejectFailed'), type: 'error' });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('registrationRequests.PENDING');
      case 'APPROVED':
        return t('registrationRequests.APPROVED');
      case 'REJECTED':
        return t('registrationRequests.REJECTED');
      case 'CANCELLED':
        return t('registrationRequests.CANCELLED');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingRequests = data?.getAllRegistrationRequests.filter(r => r.status === 'PENDING') || [];
  const processedRequests = data?.getAllRegistrationRequests.filter(r => r.status !== 'PENDING') || [];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center space-x-3">
          <Users className="w-6 h-6 text-admin-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('registrationRequests.title')}
          </h1>
        </div>
        <div className="flex  items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{t('registrationRequests.pending')}: {pendingRequests.length}</span>
          <span>{t('registrationRequests.processed')}: {processedRequests.length}</span>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('registrationRequests.pendingRequests')}
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex gap-2 items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex gap-2 items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {request.name}
                      </h3>
                      <div className="flex items-center gap-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                          <Mail className="w-3 h-3 mr-1" />
                          {request.email}
                        </span>
                        {request.universityId && (
                          <span className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {request.universityId}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs gap-2 font-medium flex items-center ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="mx-1">{getStatusText(request.status)}</span>
                    </span>
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      variant="primary"
                      size="sm"
                      colorScheme="admin"
                    >
                      {t('registrationRequests.review')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* No Pending Requests */}
      {pendingRequests.length === 0 && (
        <Card>
          <div className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('registrationRequests.noPendingRequests')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('registrationRequests.allProcessedMessage')}
            </p>
          </div>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('registrationRequests.processedRequests')}
            </h2>
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex gap-2 items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {request.name}
                        </h3>
                        <div className="flex items-center gap-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {request.email}
                        </span>
                        {request.universityId && (
                          <span className="flex items-center">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {request.universityId}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {request.adminNotes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {request.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1">{getStatusText(request.status)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <ReviewModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveLoading || rejectLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}; 