import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getPackages, createPackage } from '../services/api';

const dietitianNavItems = (id) => [
  {
    to: `/dietitian/${id}`,
    exact: true,
    label: 'Dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: `/dietitian/${id}/patients`,
    label: 'Patients',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    to: `/dietitian/${id}/packages`,
    label: 'Packages',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  },
];

export default function PackageList() {
  const { id: dietitianId } = useParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPackages({ dietitianId })
      .then(res => setPackages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dietitianId]);

  const fetchPackages = () =>
    getPackages({ dietitianId })
      .then(res => setPackages(res.data))
      .catch(console.error);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createPackage({ ...form, dietitianId, price: parseFloat(form.price) });
      setShowForm(false);
      setForm({ name: '', description: '', price: '', isActive: true });
      fetchPackages();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to create package');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = packages.filter(p => p.isActive).length;

  return (
    <Layout navItems={dietitianNavItems(dietitianId)} title="Packages">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-muted">{packages.length} total</span>
          <span className="w-1 h-1 rounded-full bg-dark-500" />
          <span className="font-body text-xs text-lime-400">{activeCount} active</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-dark-900 font-body font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Package
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted font-body">
          <div className="w-4 h-4 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.length === 0 ? (
            <div className="col-span-3 text-center py-24">
              <div className="font-display text-5xl text-dark-600 mb-4">NO PACKAGES</div>
              <p className="font-body text-muted text-sm">Create your first nutrition package</p>
            </div>
          ) : packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className="bg-dark-800 border border-dark-600 rounded-xl p-6 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-dark-600 border border-dark-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${
                  pkg.isActive ? 'bg-lime-400/10 border-lime-400/20 text-lime-400' : 'bg-dark-600 border-dark-400 text-muted'
                }`}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-body font-semibold text-primary text-base mb-2">{pkg.name}</h3>
              <p className="font-body text-xs text-muted mb-4 line-clamp-2">{pkg.description || 'No description'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                <p className="font-display text-2xl text-lime-400">${pkg.price}</p>
                <p className="font-body text-xs text-muted">
                  {new Date(pkg.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-500 rounded-xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-dark-600">
              <h2 className="font-display text-xl tracking-wider text-primary">NEW PACKAGE</h2>
              <button onClick={() => setShowForm(false)} className="text-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <FInput label="Package Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary focus:outline-none focus:border-lime-400 transition-colors resize-none" />
              </div>
              <FInput label="Price (USD) *" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} required />
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-lime-400' : 'bg-dark-500'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="font-body text-sm text-primary">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-dark-600 hover:bg-dark-500 text-primary font-body text-sm py-2.5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-dark-900 font-body font-semibold text-sm py-2.5 rounded-lg transition-colors">
                  {submitting ? 'Saving...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function FInput({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 font-body text-sm text-primary focus:outline-none focus:border-lime-400 transition-colors" />
    </div>
  );
}
