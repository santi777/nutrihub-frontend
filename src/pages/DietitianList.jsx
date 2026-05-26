import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDietitians, createDietitian } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function DietitianList() {
  const { setActiveDietitian } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: '', email: '', phoneNumber: '', bio: '', isAcceptingPatients: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (currentUser?.role !== 'dietitian') {
      navigate('/patients', { replace: true });
      return;
    }

    getDietitians()
      .then(res => {
        const match = res.data.find(dt => dt.email?.toLowerCase() === currentUser?.email?.toLowerCase());
        if (match) {
          setActiveDietitian(match);
          navigate(`/dietitian/${match.id}`, { replace: true });
        } else {
          setForm(f => ({ ...f, name: currentUser?.name || '', email: currentUser?.email || '' }));
          setShowForm(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Could not connect to the server. Check that the backend is running.');
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createDietitian(form);
      const created = res.data;
      setActiveDietitian(created);
      navigate(`/dietitian/${created.id}`, { replace: true });
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 font-body text-red-400 text-sm max-w-md text-center">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-500 rounded-xl w-full max-w-lg animate-slide-up">
            <div className="px-6 py-5 border-b border-dark-600">
              <h2 className="font-display text-xl tracking-wider text-primary">COMPLETE YOUR PROFILE</h2>
              <p className="font-body text-xs text-muted mt-1">Tell us a bit about yourself to get started</p>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
                <Input label="Specialization" value={form.specialization} onChange={v => setForm(f => ({ ...f, specialization: v }))} />
              </div>
              <Input label="Email *" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />
              <Input label="Phone" value={form.phoneNumber} onChange={v => setForm(f => ({ ...f, phoneNumber: v }))} />
              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary focus:outline-none focus:border-lime-400 transition-colors resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.isAcceptingPatients} onChange={e => setForm(f => ({ ...f, isAcceptingPatients: e.target.checked }))} />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.isAcceptingPatients ? 'bg-lime-400' : 'bg-dark-500'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isAcceptingPatients ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="font-body text-sm text-primary">Accepting patients</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate('/login')} className="flex-1 bg-dark-600 hover:bg-dark-500 text-primary font-body text-sm py-2.5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-body font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  {submitting ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary focus:outline-none focus:border-lime-400 transition-colors"
      />
    </div>
  );
}
