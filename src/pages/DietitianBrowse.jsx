import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDietitians } from '../services/api';
import { createEnrollmentRequest, getRequestByPatient } from '../services/enrollmentRequests';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function DietitianBrowse() {
  const { currentUser } = useAuth();
  const { setRole } = useApp();
  const navigate = useNavigate();

  const [dietitians, setDietitians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingRequest, setPendingRequest] = useState(null);
  const [confirmDietitian, setConfirmDietitian] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const existing = await getRequestByPatient(currentUser.localPatientId);
        if (existing?.status === 'REQUEST_PENDING' || existing?.status === 'ACTIVE') {
          setPendingRequest(existing);
        }
      } catch {
        // no pending request found — proceed normally
      }

      getDietitians()
        .then(res => setDietitians(res.data || []))
        .catch(() => setError('Could not load dietitians. Please check your connection.'))
        .finally(() => setLoading(false));
    };
    init();
  }, [currentUser.localPatientId]);

  const handleRequestEnrollment = (dietitian) => {
    if (pendingRequest) return;
    setConfirmDietitian(dietitian);
    setRequestError('');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setRequestError('');
    try {
      await createEnrollmentRequest({
        patientId: currentUser.localPatientId,
        dietitianId: confirmDietitian.id,
      });
      setConfirmDietitian(null);
      navigate(`/patient/${currentUser.localPatientId}`);
    } catch (e) {
      if (e.response?.status === 409) {
        setRequestError('You already have a pending enrollment request.');
      } else {
        setRequestError(e.response?.data?.error || 'Could not send request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setRole('none');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-lime-400 rounded-sm" />
          <span className="font-display text-2xl tracking-widest text-primary">NUTRIHUB</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-sm text-muted hidden sm:block">{currentUser?.name}</span>
          <button onClick={handleLogout} className="font-body text-xs text-muted hover:text-primary transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wider text-primary mb-2">FIND YOUR DIETITIAN</h1>
          <p className="font-body text-muted text-sm">
            Browse available dietitians and send a request. They'll review your profile and reach out once accepted.
          </p>
        </div>

        {pendingRequest && (
          <div className="mb-8 flex items-center gap-4 p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <p className="font-body text-sm font-medium text-primary">Request already pending</p>
              <p className="font-body text-xs text-muted">You've already sent an enrollment request. You can only have one active request at a time.</p>
            </div>
            <button
              onClick={() => navigate(`/patient/${currentUser.localPatientId}`)}
              className="text-lime-400 font-body text-xs hover:underline flex-shrink-0"
            >
              View dashboard →
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="font-body text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && dietitians.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-muted text-sm">No dietitians available at the moment.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dietitians.map(dt => (
              <DietitianCard
                key={dt.id}
                dietitian={dt}
                disabled={!!pendingRequest}
                onRequest={() => handleRequestEnrollment(dt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmDietitian && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-500 rounded-xl w-full max-w-sm animate-slide-up">
            <div className="px-6 py-5 border-b border-dark-600 flex items-center justify-between">
              <h2 className="font-display text-lg tracking-wider text-primary">SEND REQUEST</h2>
              <button onClick={() => setConfirmDietitian(null)} className="text-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-xl text-lime-400">
                    {confirmDietitian.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-primary">{confirmDietitian.name}</p>
                  <p className="font-body text-xs text-muted">{confirmDietitian.specialization}</p>
                </div>
              </div>
              <p className="font-body text-sm text-muted">
                Your profile will be shared with <span className="text-primary font-medium">{confirmDietitian.name}</span>. They'll review and respond within 1–2 business days.
              </p>
              {requestError && (
                <p className="font-body text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{requestError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDietitian(null)}
                  className="flex-1 bg-dark-600 hover:bg-dark-500 text-primary font-body text-sm py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-body font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DietitianCard({ dietitian, disabled, onRequest }) {
  const accepting = dietitian.isAcceptingPatients !== false;

  return (
    <div className={`bg-dark-800 border rounded-xl p-5 flex flex-col gap-4 transition-opacity ${!accepting ? 'opacity-60' : 'border-dark-600'}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-xl text-lime-400">
            {dietitian.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-body text-sm font-semibold text-primary">{dietitian.name}</h3>
            {accepting ? (
              <span className="font-body text-xs px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400">Accepting</span>
            ) : (
              <span className="font-body text-xs px-2 py-0.5 rounded-full bg-dark-600 border border-dark-500 text-muted">Not accepting</span>
            )}
          </div>
          <p className="font-body text-xs text-muted mt-0.5">{dietitian.specialization}</p>
        </div>
      </div>

      {dietitian.bio && (
        <p className="font-body text-xs text-muted/80 line-clamp-2">{dietitian.bio}</p>
      )}

      <button
        onClick={onRequest}
        disabled={disabled || !accepting}
        className={`w-full py-2.5 rounded-lg font-body font-semibold text-sm transition-all ${
          disabled || !accepting
            ? 'bg-dark-600 text-muted cursor-not-allowed'
            : 'bg-lime-400 hover:bg-lime-500 text-dark-900'
        }`}
      >
        {disabled ? 'Request Sent' : accepting ? 'Request Enrollment' : 'Not Available'}
      </button>
    </div>
  );
}
