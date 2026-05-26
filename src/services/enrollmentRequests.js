import {
  requestEnrollment,
  getEnrollmentRequests,
  getEnrollmentHistory,
  approveEnrollmentRequest,
  declineEnrollmentRequest,
} from './api';

export const createEnrollmentRequest = ({ patientId, dietitianId }) =>
  requestEnrollment({ patientId, dietitianId });

export const getRequestByPatient = (patientId) =>
  getEnrollmentHistory(patientId).then(res => {
    const history = res.data || [];
    return (
      history.find(e => e.status === 'ACTIVE') ||
      history.find(e => e.status === 'REQUEST_PENDING') ||
      null
    );
  });

export const getRequestsByDietitian = (dietitianId) =>
  getEnrollmentRequests({ dietitianId, status: 'REQUEST_PENDING' }).then(res => res.data || []);

export const approveRequest = (id) => approveEnrollmentRequest(id);

export const declineRequest = (id) => declineEnrollmentRequest(id);
