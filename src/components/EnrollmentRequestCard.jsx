import React, { useState } from 'react';
import { approveRequest, declineRequest } from '../services/enrollmentRequests';

const GOAL_LABELS = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
  manage_condition: 'Manage a Condition',
  general_wellness: 'General Wellness',
};

const ACTIVITY_LABELS = {
  never: 'Rarely / Never',
  '1-2x': '1–2x / week',
  '3-5x': '3–5x / week',
  daily: 'Daily',
};

export default function EnrollmentRequestCard({ request, onAction }) {
  const [acting, setActing] = useState(null);
  const [actionError, setActionError] = useState('');
  const { id, patient, requestedAt } = request;
  const snap = patient || {};

  const daysAgo = Math.floor((Date.now() - new Date(requestedAt)) / (1000 * 60 * 60 * 24));
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  const handleApprove = async () => {
    setActing('approve');
    setActionError('');
    try {
      await approveRequest(id);
      onAction(id, 'approved');
    } catch (e) {
      setActionError(e.response?.data?.error || 'Could not approve request.');
      setActing(null);
    }
  };

  const handleDecline = async () => {
    setActing('decline');
    setActionError('');
    try {
      await declineRequest(id);
      onAction(id, 'declined');
    } catch (e) {
      setActionError(e.response?.data?.error || 'Could not decline request.');
      setActing(null);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-sm text-lime-400">
              {snap.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-primary">{snap.name || 'Unknown'}</p>
            <p className="font-body text-xs text-muted">{snap.email}</p>
          </div>
        </div>
        <span className="font-body text-xs text-muted flex-shrink-0">{timeLabel}</span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        {snap.age && (
          <InfoPill label="Age" value={`${snap.age}y`} />
        )}
        {snap.gender && (
          <InfoPill label="Gender" value={snap.gender === 'MALE' ? 'Male' : snap.gender === 'FEMALE' ? 'Female' : 'Other'} />
        )}
        {snap.weightKg && (
          <InfoPill label="Weight" value={`${snap.weightKg} kg`} />
        )}
        {snap.heightCm && (
          <InfoPill label="Height" value={`${snap.heightCm} cm`} />
        )}
        {snap.activityLevel && (
          <InfoPill label="Activity" value={ACTIVITY_LABELS[snap.activityLevel] || snap.activityLevel} />
        )}
      </div>

      {/* Goal */}
      {snap.healthGoal && (
        <div>
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">Goal</p>
          <p className="font-body text-sm text-lime-400 font-medium">{GOAL_LABELS[snap.healthGoal] || snap.healthGoal}</p>
          {snap.healthGoalNote && <p className="font-body text-xs text-muted mt-0.5">{snap.healthGoalNote}</p>}
        </div>
      )}

      {/* Conditions & allergies */}
      {(snap.conditions?.length > 0 || snap.allergies || snap.dietaryRestrictions?.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {snap.conditions?.map(c => (
            <span key={c} className="font-body text-xs px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">{c}</span>
          ))}
          {snap.dietaryRestrictions?.map(r => (
            <span key={r} className="font-body text-xs px-2.5 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400">{r}</span>
          ))}
          {snap.allergies?.length > 0 && (
            <span className="font-body text-xs px-2.5 py-1 rounded-full bg-red-400/10 border border-red-400/20 text-red-400">Allergy: {snap.allergies.join(', ')}</span>
          )}
        </div>
      )}

      {/* Actions */}
      {actionError && (
        <p className="font-body text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{actionError}</p>
      )}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleDecline}
          disabled={!!acting}
          className="flex-1 bg-dark-600 hover:bg-dark-500 disabled:opacity-50 text-primary font-body text-sm py-2.5 rounded-lg transition-colors"
        >
          {acting === 'decline' ? 'Declining...' : 'Decline'}
        </button>
        <button
          onClick={handleApprove}
          disabled={!!acting}
          className="flex-1 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-body font-semibold text-sm py-2.5 rounded-lg transition-colors"
        >
          {acting === 'approve' ? 'Approving...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-dark-700 border border-dark-600">
      <p className="font-body text-xs text-muted leading-none mb-0.5">{label}</p>
      <p className="font-body text-xs text-primary font-medium">{value}</p>
    </div>
  );
}
