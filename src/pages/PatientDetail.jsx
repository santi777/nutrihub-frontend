import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import HealthChart from '../components/HealthChart';
import MealLogPanel from '../components/MealLogPanel';
import MealPlanPanel from '../components/MealPlanPanel';
import {
  getPatient, getMealPlan, getHealthRecords, getMealLogs,
} from '../services/api';

const GOAL_LABELS = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
  manage_condition: 'Manage a Condition',
  general_wellness: 'General Wellness',
};
const ACTIVITY_LABELS = {
  never: 'Rarely / Never',
  '1-2x': '1–2x per week',
  '3-5x': '3–5x per week',
  daily: 'Daily',
};
const SLEEP_LABELS = {
  poor: 'Poor (< 5 hrs)',
  fair: 'Fair (5–6 hrs)',
  good: 'Good (7–8 hrs)',
  excellent: 'Excellent (8+ hrs)',
};
const STRESS_LABELS = { low: 'Low', moderate: 'Moderate', high: 'High' };
const WORK_LABELS = {
  sedentary: 'Sedentary',
  light: 'Light movement',
  active: 'On feet most of the day',
  very_active: 'Physical labour',
};

const dietitianNavItems = (dietitianId) => [
  {
    to: `/dietitian/${dietitianId}`,
    exact: true,
    label: 'Dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: `/dietitian/${dietitianId}/patients`,
    label: 'Patients',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

export default function PatientDetail() {
  const { id: dietitianId, patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [enrollmentRequest, setEnrollmentRequest] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  const isLocalPatient = patientId?.startsWith('local_');

  useEffect(() => {
    if (isLocalPatient) {
      setEnrollmentRequest(null);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [ptRes, hrRes, mlRes, mpRes] = await Promise.all([
          getPatient(patientId),
          getHealthRecords(patientId).catch(() => ({ data: [] })),
          getMealLogs(patientId).catch(() => ({ data: [] })),
          getMealPlan(patientId).catch(() => ({ data: null })),
        ]);
        setPatient(ptRes.data);
        setHealthRecords([...(hrRes.data || [])].reverse());
        setMealLogs(mlRes.data || []);
        setMealPlan(mpRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [patientId, dietitianId, isLocalPatient]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) return null;

  const currentWeight = healthRecords[healthRecords.length - 1]?.weightKg;
  const startWeight = healthRecords[0]?.weightKg;
  const weightDelta = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  return (
    <Layout navItems={dietitianNavItems(dietitianId)} title={patient.name}>
      {/* Patient header card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
              <span className="font-display text-2xl text-lime-400">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-body font-semibold text-primary text-lg">{patient.name}</h2>
              <p className="font-body text-sm text-muted">
                {[patient.age && `${patient.age} years`, patient.gender, patient.heightCm && `${patient.heightCm}cm`].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {currentWeight && <InfoChip label="Current Weight" value={`${currentWeight} kg`} accent />}
            {weightDelta !== null && (
              <InfoChip label="Progress" value={`${weightDelta > 0 ? '+' : ''}${weightDelta} kg`} accent={weightDelta < 0} />
            )}
          </div>
        </div>
      </div>

      {/* Enrollment status — read-only for dietitian */}
      {enrollmentRequest && (
        <div className={`mb-6 flex items-center gap-4 p-4 rounded-xl border ${
          enrollmentRequest.status === 'ACTIVE'
            ? 'border-lime-400/20 bg-lime-400/5'
            : 'border-yellow-400/20 bg-yellow-400/5'
        }`}>
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
            enrollmentRequest.status === 'ACTIVE' ? 'bg-lime-400' : 'bg-yellow-400 animate-pulse'
          }`} />
          <div>
            <p className="font-body text-sm font-medium text-primary">
              {enrollmentRequest.status === 'ACTIVE' ? 'Enrolled' : 'Enrollment Pending'}
            </p>
            <p className="font-body text-xs text-muted">
              {enrollmentRequest.status === 'ACTIVE'
                ? `Approved ${enrollmentRequest.approvedAt ? new Date(enrollmentRequest.approvedAt).toLocaleDateString() : ''}`
                : `Requested ${new Date(enrollmentRequest.requestedAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 border border-dark-600 rounded-lg p-1 w-fit">
        {['profile', 'health', 'meals', 'plan'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-body text-sm px-5 py-2 rounded-md transition-all capitalize ${
              tab === t ? 'bg-lime-400 text-dark-900 font-semibold' : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'plan' ? 'Meal Plan' : t === 'profile' ? 'Profile' : t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'profile' && (
          <div className="space-y-5">
            {/* Physical */}
            <ProfileSection title="Physical">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {patient.age && <ProfileField label="Age" value={`${patient.age} years`} />}
                {patient.gender && <ProfileField label="Gender" value={patient.gender === 'MALE' ? 'Male' : patient.gender === 'FEMALE' ? 'Female' : 'Other'} />}
                {patient.heightCm && <ProfileField label="Height" value={`${patient.heightCm} cm`} />}
                {patient.weightKg && <ProfileField label="Weight at Registration" value={`${patient.weightKg} kg`} />}
              </div>
              {patient.email && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <ProfileField label="Email" value={patient.email} />
                </div>
              )}
            </ProfileSection>

            {/* Goal */}
            {patient.healthGoal && (
              <ProfileSection title="Goal">
                <p className="font-body text-base font-semibold text-lime-400">
                  {GOAL_LABELS[patient.healthGoal] || patient.healthGoal}
                </p>
                {patient.healthGoalNote && (
                  <p className="font-body text-sm text-primary/70 mt-1">"{patient.healthGoalNote}"</p>
                )}
              </ProfileSection>
            )}

            {/* Clinical */}
            <ProfileSection title="Clinical">
              {(patient.conditions?.length > 0 || patient.dietaryRestrictions?.length > 0 || patient.allergies?.length > 0 || patient.medicalHistory) ? (
                <div className="space-y-4">
                  {patient.conditions?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.conditions.map(c => (
                          <span key={c} className="font-body text-xs px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.dietaryRestrictions?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.dietaryRestrictions.map(r => (
                          <span key={r} className="font-body text-xs px-2.5 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.allergies?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map(a => (
                          <span key={a} className="font-body text-xs px-2.5 py-1 rounded-full bg-red-400/10 border border-red-400/20 text-red-400">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.medicalHistory && (
                    <div>
                      <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">Medical History</p>
                      <p className="font-body text-sm text-primary/70">{patient.medicalHistory}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-body text-sm text-muted">None recorded.</p>
              )}
            </ProfileSection>

            {/* Lifestyle */}
            {(patient.activityLevel || patient.sleepQuality || patient.stressLevel || patient.workType) && (
              <ProfileSection title="Lifestyle">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {patient.activityLevel && <ProfileField label="Exercise" value={ACTIVITY_LABELS[patient.activityLevel] || patient.activityLevel} />}
                  {patient.sleepQuality && <ProfileField label="Sleep Quality" value={SLEEP_LABELS[patient.sleepQuality] || patient.sleepQuality} />}
                  {patient.stressLevel && <ProfileField label="Stress Level" value={STRESS_LABELS[patient.stressLevel] || patient.stressLevel} />}
                  {patient.workType && <ProfileField label="Work Type" value={WORK_LABELS[patient.workType] || patient.workType} />}
                </div>
              </ProfileSection>
            )}
          </div>
        )}

        {tab === 'health' && <HealthChart records={healthRecords} />}
        {tab === 'meals' && <MealLogPanel logs={mealLogs} />}
        {tab === 'plan' && (
          <MealPlanPanel
            mealPlan={mealPlan}
            onSaved={setMealPlan}
            isAdmin={true}
            patientId={patientId}
            dietitianId={dietitianId}
          />
        )}
      </div>
    </Layout>
  );
}

function InfoChip({ label, value, accent = false }) {
  return (
    <div className={`px-3 py-2 rounded-lg border ${accent ? 'border-lime-400/20 bg-lime-400/5' : 'border-dark-500 bg-dark-700'}`}>
      <p className="font-body text-xs text-muted">{label}</p>
      <p className={`font-body text-sm font-semibold ${accent ? 'text-lime-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-700">
        <p className="font-display text-sm tracking-wider text-primary">{title.toUpperCase()}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs text-muted uppercase tracking-widest mb-0.5">{label}</p>
      <p className="font-body text-sm text-primary">{value}</p>
    </div>
  );
}
