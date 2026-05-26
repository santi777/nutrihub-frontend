import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPatient } from '../services/api';

const TOTAL_STEPS = 5;

const CONDITIONS = ['Diabetes', 'Hypertension', 'Celiac disease', 'PCOS', 'Hypothyroidism', 'High cholesterol'];
const DIETARY_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Halal', 'Kosher'];
const HEALTH_GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', icon: '↓' },
  { value: 'gain_muscle', label: 'Gain Muscle', icon: '↑' },
  { value: 'manage_condition', label: 'Manage a Condition', icon: '♥' },
  { value: 'general_wellness', label: 'General Wellness', icon: '✦' },
];

const initialData = {
  age: '',
  gender: 'MALE',
  heightCm: '',
  weightKg: '',
  healthGoal: '',
  healthGoalNote: '',
  conditions: [],
  allergies: '',
  dietaryRestrictions: [],
  activityLevel: '',
  sleepQuality: '',
  stressLevel: '',
  workType: '',
};

function ProgressBar({ step }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-xs text-muted uppercase tracking-widest">Step {step} of {TOTAL_STEPS - 1}</span>
        <span className="font-body text-xs text-lime-400">{Math.round(((step - 1) / (TOTAL_STEPS - 2)) * 100)}%</span>
      </div>
      <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-lime-400 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 2)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {['Info', 'Goals', 'Health', 'Lifestyle', 'Review'].map((label, i) => (
          <span key={label} className={`font-body text-xs ${step > i + 1 ? 'text-lime-400' : step === i + 1 ? 'text-primary' : 'text-muted'}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function OptionCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-lime-400/60 bg-lime-400/10 text-primary'
          : 'border-dark-500 hover:border-dark-400 text-muted hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function ChipToggle({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full border font-body text-sm transition-all ${
        selected
          ? 'border-lime-400/60 bg-lime-400/10 text-lime-400'
          : 'border-dark-500 text-muted hover:border-dark-400 hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}

function FInput({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors"
      />
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function StepBasicInfo({ data, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl tracking-wider text-primary mb-1">BASIC INFO</h2>
        <p className="font-body text-sm text-muted">Let's start with the essentials.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FInput label="Age *" type="number" value={data.age} onChange={v => set('age', v)} required placeholder="e.g. 28" />
        <div>
          <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Gender *</label>
          <select
            value={data.gender}
            onChange={e => set('gender', e.target.value)}
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary focus:outline-none focus:border-lime-400 transition-colors"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other / Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FInput label="Height (cm) *" type="number" value={data.heightCm} onChange={v => set('heightCm', v)} required placeholder="e.g. 170" />
        <FInput label="Current Weight (kg) *" type="number" value={data.weightKg} onChange={v => set('weightKg', v)} required placeholder="e.g. 75" />
      </div>
    </div>
  );
}

// ─── Step 2: Health Goals ─────────────────────────────────────────────────────
function StepHealthGoals({ data, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl tracking-wider text-primary mb-1">YOUR GOAL</h2>
        <p className="font-body text-sm text-muted">What brings you to NutriHub?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {HEALTH_GOALS.map(goal => (
          <OptionCard key={goal.value} selected={data.healthGoal === goal.value} onClick={() => set('healthGoal', goal.value)}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.icon}</span>
              <span className="font-body text-sm font-medium">{goal.label}</span>
            </div>
          </OptionCard>
        ))}
      </div>

      {data.healthGoal === 'manage_condition' && (
        <div className="animate-fade-in">
          <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Tell us about the condition</label>
          <textarea
            rows={2}
            value={data.healthGoalNote}
            onChange={e => set('healthGoalNote', e.target.value)}
            placeholder="e.g. Type 2 diabetes, managing blood sugar levels"
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors resize-none"
          />
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Medical History ──────────────────────────────────────────────────
function StepMedicalHistory({ data, set }) {
  const toggle = (field, value) => {
    const current = data[field];
    set(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl tracking-wider text-primary mb-1">HEALTH HISTORY</h2>
        <p className="font-body text-sm text-muted">Help your dietitian understand your needs.</p>
      </div>

      <div>
        <p className="font-body text-xs text-muted uppercase tracking-widest mb-3">Existing Conditions <span className="normal-case">(select all that apply)</span></p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => (
            <ChipToggle key={c} label={c} selected={data.conditions.includes(c)} onClick={() => toggle('conditions', c)} />
          ))}
        </div>
      </div>

      <div>
        <p className="font-body text-xs text-muted uppercase tracking-widest mb-3">Dietary Restrictions <span className="normal-case">(select all that apply)</span></p>
        <div className="flex flex-wrap gap-2">
          {DIETARY_RESTRICTIONS.map(r => (
            <ChipToggle key={r} label={r} selected={data.dietaryRestrictions.includes(r)} onClick={() => toggle('dietaryRestrictions', r)} />
          ))}
        </div>
      </div>

      <FInput
        label="Food Allergies"
        value={data.allergies}
        onChange={v => set('allergies', v)}
        placeholder="e.g. nuts, shellfish, soy"
      />
    </div>
  );
}

// ─── Step 4: Lifestyle ────────────────────────────────────────────────────────
const LIFESTYLE_OPTIONS = {
  activityLevel: {
    label: 'Exercise Frequency',
    options: [
      { value: 'never', label: 'Rarely / Never' },
      { value: '1-2x', label: '1–2x per week' },
      { value: '3-5x', label: '3–5x per week' },
      { value: 'daily', label: 'Daily' },
    ],
  },
  sleepQuality: {
    label: 'Sleep Quality',
    options: [
      { value: 'poor', label: 'Poor (< 5 hrs)' },
      { value: 'fair', label: 'Fair (5–6 hrs)' },
      { value: 'good', label: 'Good (7–8 hrs)' },
      { value: 'excellent', label: 'Excellent (8+ hrs)' },
    ],
  },
  stressLevel: {
    label: 'Stress Level',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
    ],
  },
  workType: {
    label: 'Work / Daily Activity',
    options: [
      { value: 'sedentary', label: 'Desk / Sedentary' },
      { value: 'light', label: 'Light movement' },
      { value: 'active', label: 'On my feet most of the day' },
      { value: 'very_active', label: 'Physical labour' },
    ],
  },
};

function StepLifestyle({ data, set }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl tracking-wider text-primary mb-1">YOUR LIFESTYLE</h2>
        <p className="font-body text-sm text-muted">Context helps your dietitian personalise your plan.</p>
      </div>

      {Object.entries(LIFESTYLE_OPTIONS).map(([field, { label, options }]) => (
        <div key={field}>
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-3">{label}</p>
          <div className="grid grid-cols-2 gap-2">
            {options.map(opt => (
              <OptionCard key={opt.value} selected={data[field] === opt.value} onClick={() => set(field, opt.value)}>
                <span className="font-body text-sm">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────
function ReviewRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex justify-between py-3 border-b border-dark-700 last:border-0">
      <span className="font-body text-xs text-muted uppercase tracking-widest">{label}</span>
      <span className="font-body text-sm text-primary text-right max-w-xs">{Array.isArray(value) ? value.join(', ') : value}</span>
    </div>
  );
}

function StepReview({ data, onEdit }) {
  const goalLabel = HEALTH_GOALS.find(g => g.value === data.healthGoal)?.label || '—';
  const activityLabel = LIFESTYLE_OPTIONS.activityLevel.options.find(o => o.value === data.activityLevel)?.label || '—';
  const sleepLabel = LIFESTYLE_OPTIONS.sleepQuality.options.find(o => o.value === data.sleepQuality)?.label || '—';
  const stressLabel = LIFESTYLE_OPTIONS.stressLevel.options.find(o => o.value === data.stressLevel)?.label || '—';
  const workLabel = LIFESTYLE_OPTIONS.workType.options.find(o => o.value === data.workType)?.label || '—';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl tracking-wider text-primary mb-1">REVIEW</h2>
        <p className="font-body text-sm text-muted">Everything look right? You can edit any section before submitting.</p>
      </div>

      {[
        { title: 'BASIC INFO', step: 1, rows: [
          { label: 'Age', value: `${data.age} years` },
          { label: 'Gender', value: data.gender },
          { label: 'Height', value: `${data.heightCm} cm` },
          { label: 'Weight', value: `${data.weightKg} kg` },
        ]},
        { title: 'GOAL', step: 2, rows: [
          { label: 'Primary Goal', value: goalLabel },
          { label: 'Notes', value: data.healthGoalNote },
        ]},
        { title: 'HEALTH HISTORY', step: 3, rows: [
          { label: 'Conditions', value: data.conditions },
          { label: 'Dietary Restrictions', value: data.dietaryRestrictions },
          { label: 'Allergies', value: data.allergies },
        ]},
        { title: 'LIFESTYLE', step: 4, rows: [
          { label: 'Exercise', value: activityLabel },
          { label: 'Sleep', value: sleepLabel },
          { label: 'Stress', value: stressLabel },
          { label: 'Work Type', value: workLabel },
        ]},
      ].map(({ title, step, rows }) => (
        <div key={title} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700">
            <span className="font-display text-sm tracking-wider text-primary">{title}</span>
            <button type="button" onClick={() => onEdit(step)} className="font-body text-xs text-lime-400 hover:text-lime-300 transition-colors">Edit</button>
          </div>
          <div className="px-5">
            {rows.map(({ label, value }) => <ReviewRow key={label} label={label} value={value} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function PatientOnboarding() {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!data.age || !data.heightCm || !data.weightKg) return 'Please fill in all required fields.';
    }
    if (step === 2) {
      if (!data.healthGoal) return 'Please select a health goal.';
    }
    if (step === 4) {
      if (!data.activityLevel || !data.sleepQuality || !data.stressLevel || !data.workType)
        return 'Please answer all lifestyle questions.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await createPatient({
        name: currentUser.name,
        email: currentUser.email,
        age: parseInt(data.age),
        gender: data.gender,
        heightCm: parseInt(data.heightCm),
        weightKg: parseFloat(data.weightKg),
        healthGoal: data.healthGoal || null,
        healthGoalNote: data.healthGoalNote || null,
        conditions: data.conditions,
        dietaryRestrictions: data.dietaryRestrictions,
        allergies: data.allergies ? [data.allergies] : [],
        activityLevel: data.activityLevel || null,
        sleepQuality: data.sleepQuality || null,
        stressLevel: data.stressLevel || null,
        workType: data.workType || null,
      });
      const realId = res.data.id;
      updateUser({ localPatientId: realId, onboardingComplete: true, onboardingData: data });
      navigate('/dietitians/browse');
    } catch (e) {
      if (e.response?.status === 409) {
        setError('An account already exists with this email. Please contact support.');
      } else {
        setError(e.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === TOTAL_STEPS;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-start pt-12 pb-20 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#2d5a3d 1px, transparent 1px), linear-gradient(90deg, #2d5a3d 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-lime-400 opacity-5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-lime-400 rounded-sm" />
          <span className="font-display text-2xl tracking-widest text-primary">NUTRIHUB</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-xs text-lime-400">
              {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm text-primary font-medium">{currentUser?.name}</p>
            <p className="font-body text-xs text-muted">Complete your profile to get started</p>
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8">
          <ProgressBar step={step} />

          <div className="animate-fade-in" key={step}>
            {step === 1 && <StepBasicInfo data={data} set={set} />}
            {step === 2 && <StepHealthGoals data={data} set={set} />}
            {step === 3 && <StepMedicalHistory data={data} set={set} />}
            {step === 4 && <StepLifestyle data={data} set={set} />}
            {step === 5 && <StepReview data={data} onEdit={setStep} />}
          </div>

          {error && (
            <p className="mt-4 font-body text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-primary font-body text-sm rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={isLastStep ? handleSubmit : handleNext}
              disabled={submitting}
              className="flex-1 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-display tracking-widest text-sm uppercase py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : isLastStep ? 'Find a Dietitian →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
