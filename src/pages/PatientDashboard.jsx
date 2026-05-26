import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HealthChart from '../components/HealthChart';
import MealLogPanel from '../components/MealLogPanel';
import MealPlanPanel from '../components/MealPlanPanel';
import {
  getPatient, getEnrollmentHistory, getMealPlan,
  getHealthRecords, getMealLogs, createHealthRecord, createMealLog,
} from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

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

// ─── Weight Log Form ──────────────────────────────────────────────────────────
function WeightLogForm({ onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ weightKg, notes });
    setWeightKg('');
    setNotes('');
    setOpen(false);
  };

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-body text-sm font-medium text-primary">Log Weight</span>
        </div>
        <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-1 border-t border-dark-700 animate-fade-in">
          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                placeholder="e.g. 82.5"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                required
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div className="flex-[2]">
              <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Notes <span className="normal-case text-dark-400">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. After morning workout"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-primary font-body text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving === 'weight'}
              className="px-5 py-2 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-body font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              {saving === 'weight' ? (
                <><div className="w-3.5 h-3.5 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />Saving...</>
              ) : 'Save Weight'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Meal Log Form ────────────────────────────────────────────────────────────
function MealLogForm({ onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ mealName: '', calories: '', protein: '', carbs: '', fat: '', notes: '' });

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    setForm({ mealName: '', calories: '', protein: '', carbs: '', fat: '', notes: '' });
    setOpen(false);
  };

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-body text-sm font-medium text-primary">Log Meal</span>
        </div>
        <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-1 border-t border-dark-700 animate-fade-in space-y-3">
          <div className="mt-3">
            <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Meal Name *</label>
            <input
              type="text"
              placeholder="e.g. Grilled chicken salad"
              value={form.mealName}
              onChange={e => set('mealName', e.target.value)}
              required
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          {/* Macro grid */}
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-widest mb-1.5">
              Nutrition <span className="normal-case text-dark-400">(optional)</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { field: 'calories', label: 'Calories', placeholder: 'kcal', color: 'focus:border-lime-400' },
                { field: 'protein',  label: 'Protein',  placeholder: 'g',    color: 'focus:border-blue-400' },
                { field: 'carbs',    label: 'Carbs',    placeholder: 'g',    color: 'focus:border-yellow-400' },
                { field: 'fat',      label: 'Fat',      placeholder: 'g',    color: 'focus:border-orange-400' },
              ].map(({ field, label, placeholder, color }) => (
                <div key={field}>
                  <label className="block font-body text-xs text-muted mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    className={`w-full bg-dark-700 border border-dark-500 rounded-lg px-2.5 py-2 font-body text-sm text-primary placeholder-muted focus:outline-none ${color} transition-colors`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Notes <span className="normal-case text-dark-400">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Light dressing, extra greens"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-primary font-body text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving === 'meal'}
              className="px-5 py-2 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-body font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              {saving === 'meal' ? (
                <><div className="w-3.5 h-3.5 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />Saving...</>
              ) : 'Save Meal'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Pending Enrollment Banner ────────────────────────────────────────────────
function PendingBanner({ request, onBrowse }) {
  const days = Math.floor((Date.now() - new Date(request.requestedAt)) / (1000 * 60 * 60 * 24));
  const timeLabel = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;

  return (
    <div className="mb-6 p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 flex items-start gap-4">
      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-body text-sm font-medium text-primary">Awaiting dietitian approval</p>
        <p className="font-body text-xs text-muted mt-0.5">Request sent {timeLabel}. Your dietitian will review your profile and respond soon.</p>
      </div>
      <button onClick={onBrowse} className="font-body text-xs text-lime-400 hover:underline flex-shrink-0 mt-0.5">
        Browse others →
      </button>
    </div>
  );
}

function DeclinedBanner({ onBrowse }) {
  return (
    <div className="mb-6 p-4 rounded-xl border border-red-400/20 bg-red-400/5 flex items-start gap-4">
      <div className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-body text-sm font-medium text-primary">Request declined</p>
        <p className="font-body text-xs text-muted mt-0.5">This dietitian couldn't accept you at this time.</p>
      </div>
      <button onClick={onBrowse} className="font-body text-xs text-lime-400 hover:underline flex-shrink-0 mt-0.5">
        Find another →
      </button>
    </div>
  );
}

function NoDietitianBanner({ onBrowse }) {
  return (
    <div className="mb-6 p-5 rounded-xl border border-lime-400/20 bg-lime-400/5 flex items-center gap-4">
      <div className="flex-1">
        <p className="font-body text-sm font-medium text-primary">You're not connected to a dietitian yet</p>
        <p className="font-body text-xs text-muted mt-0.5">Browse available dietitians and send an enrollment request to get started.</p>
      </div>
      <button
        onClick={onBrowse}
        className="px-4 py-2 bg-lime-400 hover:bg-lime-500 text-dark-900 font-body font-semibold text-xs rounded-lg transition-colors flex-shrink-0"
      >
        Find a Dietitian
      </button>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl flex items-center justify-center py-16 px-6 text-center">
      <div>
        <div className="w-10 h-10 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-body text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const { patientId } = useParams();
  const { setRole } = useApp();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const isLocalPatient = patientId?.startsWith('local_');

  const [patient, setPatient] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrollmentRequest, setEnrollmentRequest] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('health');
  const [saving, setSaving] = useState(null); // 'weight' | 'meal' | null

  useEffect(() => {
    if (isLocalPatient) {
      const od = currentUser?.onboardingData || {};
      setPatient({
        name: currentUser?.name || 'Patient',
        email: currentUser?.email,
        age: od.age,
        gender: od.gender,
        heightCm: od.heightCm,
        weightKg: od.weightKg,
        healthGoal: od.healthGoal,
        healthGoalNote: od.healthGoalNote,
        conditions: od.conditions || [],
        dietaryRestrictions: od.dietaryRestrictions || [],
        allergies: od.allergies ? [od.allergies] : [],
        medicalHistory: null,
        activityLevel: od.activityLevel,
        sleepQuality: od.sleepQuality,
        stressLevel: od.stressLevel,
        workType: od.workType,
      });
      setLoading(false);
      return;
    }

    Promise.all([
      getPatient(patientId),
      getEnrollmentHistory(patientId).catch(() => ({ data: [] })),
      getHealthRecords(patientId).catch(() => ({ data: [] })),
      getMealLogs(patientId).catch(() => ({ data: [] })),
      getMealPlan(patientId).catch(() => ({ data: null })),
    ])
      .then(([ptRes, enrollHistoryRes, hrRes, mlRes, mpRes]) => {
        const history = enrollHistoryRes.data || [];
        const active = history.find(e => e.status === 'ACTIVE') || null;
        const pending = history.find(e => e.status === 'REQUEST_PENDING') || null;
        const declined = history.find(e => e.status === 'DECLINED') || null;
        setPatient(ptRes.data);
        setEnrollment(active);
        setEnrollmentRequest(active || pending || declined || null);
        setHealthRecords([...(hrRes.data || [])].reverse()); // ASC for chart
        setMealLogs(mlRes.data || []);
        setMealPlan(mpRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, isLocalPatient, currentUser]);

  const handleLogWeight = async ({ weightKg, notes }) => {
    try {
      setSaving('weight');
      const res = await createHealthRecord({
        patientId,
        weightKg: parseFloat(weightKg),
        notes: notes.trim() || null,
      });
      setHealthRecords(prev => [...prev, res.data]); // append to keep ASC order
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save weight record.');
    } finally {
      setSaving(null);
    }
  };

  const handleLogMeal = async ({ mealName, calories, protein, carbs, fat, notes }) => {
    try {
      setSaving('meal');
      const hasNutrition = calories || protein || carbs || fat;
      const res = await createMealLog({
        patientId,
        mealName: mealName.trim(),
        notes: notes.trim() || null,
        nutritionData: hasNutrition
          ? { calories: +calories || 0, protein: +protein || 0, carbs: +carbs || 0, fat: +fat || 0 }
          : null,
      });
      setMealLogs(prev => [res.data, ...prev]); // prepend — newest first
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save meal log.');
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => {
    logout();
    setRole('none');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) return null;

  const currentWeight = healthRecords[healthRecords.length - 1]?.weightKg ?? patient?.weightKg ?? null;
  const startWeight = healthRecords[0]?.weightKg;
  const weightDelta = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;
  const totalDays = healthRecords.length > 0
    ? Math.round((new Date(healthRecords[healthRecords.length - 1].recordedAt) - new Date(healthRecords[0].recordedAt)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top bar */}
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-lime-400 rounded-sm" />
          <span className="font-display text-2xl tracking-widest text-primary">NUTRIHUB</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
              <span className="font-display text-xs text-lime-400">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="font-body text-sm text-primary hidden sm:block">{patient.name}</span>
          </div>
          <button onClick={handleLogout} className="font-body text-xs text-muted hover:text-primary transition-colors">
            Switch Role
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wider text-primary mb-1">
            WELCOME BACK, {patient.name.split(' ')[0].toUpperCase()}
          </h1>
          <p className="font-body text-muted text-sm">Your nutrition journey at a glance</p>
        </div>

        {/* Enrollment / pending banners */}
        {isLocalPatient && !enrollmentRequest && (
          <NoDietitianBanner onBrowse={() => navigate('/dietitians/browse')} />
        )}
        {enrollmentRequest?.status === 'REQUEST_PENDING' && (
          <PendingBanner request={enrollmentRequest} onBrowse={() => navigate('/dietitians/browse')} />
        )}
        {enrollmentRequest?.status === 'DECLINED' && (
          <DeclinedBanner onBrowse={() => navigate('/dietitians/browse')} />
        )}
        {enrollmentRequest?.status === 'ACTIVE' && (
          <div className="mb-6 flex items-center gap-4 p-4 rounded-xl border border-lime-400/20 bg-lime-400/5">
            <div className="w-3 h-3 rounded-full bg-lime-400 flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium text-primary">Enrolled</p>
              <p className="font-body text-xs text-muted">Your dietitian has accepted your request. Your plan will appear here soon.</p>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Current Weight" value={currentWeight ? `${currentWeight}` : '—'} unit={currentWeight ? 'kg' : ''} accent />
          <StatCard
            label="Progress"
            value={weightDelta !== null ? `${weightDelta > 0 ? '+' : ''}${weightDelta}` : '—'}
            unit={weightDelta !== null ? 'kg' : ''}
            highlight={weightDelta < 0}
          />
          <StatCard label="Days Tracked" value={totalDays} unit="days" />
          <StatCard
            label="Status"
            value={enrollmentRequest?.status === 'ACTIVE' || enrollment ? 'ACTIVE' : enrollmentRequest ? enrollmentRequest.status.replace('_', ' ') : 'NONE'}
            highlight={enrollmentRequest?.status === 'ACTIVE' || !!enrollment}
          />
        </div>

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
              {t === 'plan' ? 'Meal Plan' : t === 'profile' ? 'My Profile' : t}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {tab === 'profile' && (
            <div className="space-y-5">
              {/* Physical */}
              <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-dark-700">
                  <p className="font-display text-sm tracking-wider text-primary">PHYSICAL</p>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {patient.age && <ProfileField label="Age" value={`${patient.age} years`} />}
                    {patient.gender && <ProfileField label="Gender" value={patient.gender === 'MALE' ? 'Male' : patient.gender === 'FEMALE' ? 'Female' : 'Other'} />}
                    {patient.heightCm && <ProfileField label="Height" value={`${patient.heightCm} cm`} />}
                    {patient.weightKg && <ProfileField label="Weight at Registration" value={`${patient.weightKg} kg`} />}
                  </div>
                </div>
              </div>

              {/* Goal */}
              {patient.healthGoal && (
                <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-dark-700">
                    <p className="font-display text-sm tracking-wider text-primary">GOAL</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-body text-base font-semibold text-lime-400">
                      {GOAL_LABELS[patient.healthGoal] || patient.healthGoal}
                    </p>
                    {patient.healthGoalNote && (
                      <p className="font-body text-sm text-primary/70 mt-1">"{patient.healthGoalNote}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* Clinical */}
              <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-dark-700">
                  <p className="font-display text-sm tracking-wider text-primary">CLINICAL</p>
                </div>
                <div className="px-5 py-4">
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
                </div>
              </div>

              {/* Lifestyle */}
              {(patient.activityLevel || patient.sleepQuality || patient.stressLevel || patient.workType) && (
                <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-dark-700">
                    <p className="font-display text-sm tracking-wider text-primary">LIFESTYLE</p>
                  </div>
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {patient.activityLevel && <ProfileField label="Exercise" value={ACTIVITY_LABELS[patient.activityLevel] || patient.activityLevel} />}
                      {patient.sleepQuality && <ProfileField label="Sleep Quality" value={SLEEP_LABELS[patient.sleepQuality] || patient.sleepQuality} />}
                      {patient.stressLevel && <ProfileField label="Stress Level" value={STRESS_LABELS[patient.stressLevel] || patient.stressLevel} />}
                      {patient.workType && <ProfileField label="Work Type" value={WORK_LABELS[patient.workType] || patient.workType} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'health' && (
            isLocalPatient
              ? <EmptyState message="Weight tracking becomes available once your dietitian accepts your request." />
              : <>
                  <WeightLogForm onSave={handleLogWeight} saving={saving} />
                  <HealthChart records={healthRecords} />
                </>
          )}

          {tab === 'meals' && (
            isLocalPatient
              ? <EmptyState message="Meal logging becomes available once you're enrolled with a dietitian." />
              : <>
                  <MealLogForm onSave={handleLogMeal} saving={saving} />
                  <MealLogPanel logs={mealLogs} />
                </>
          )}

          {tab === 'plan' && (
            isLocalPatient
              ? <EmptyState message="Your dietitian will upload a personalised meal plan once you're enrolled." />
              : <MealPlanPanel mealPlan={mealPlan} isAdmin={false} />
          )}
        </div>
      </div>
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

function StatCard({ label, value, unit, accent = false, highlight = false }) {
  return (
    <div className={`bg-dark-800 border rounded-xl p-5 ${accent ? 'border-lime-400/30' : 'border-dark-600'}`}>
      <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-end gap-1">
        <p className={`font-display text-3xl tracking-wide ${accent || highlight ? 'text-lime-400' : 'text-white'}`}>{value}</p>
        {unit && <p className="font-body text-xs text-muted mb-1">{unit}</p>}
      </div>
    </div>
  );
}
