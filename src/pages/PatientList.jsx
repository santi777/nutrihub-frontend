import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getPatients } from '../services/api';

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
];

export default function PatientList() {
  const { id: dietitianId } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPatients({ dietitianId })
      .then(res => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dietitianId]);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout navItems={dietitianNavItems(dietitianId)} title="Patients">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 font-body text-sm text-primary placeholder-muted focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>
        <span className="font-body text-xs text-muted">{filtered.length} patients</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted font-body">
          <div className="w-4 h-4 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-dark-700 border-b border-dark-600">
            <div className="col-span-4 font-body text-xs text-muted uppercase tracking-widest">Patient</div>
            <div className="col-span-2 font-body text-xs text-muted uppercase tracking-widest">Age</div>
            <div className="col-span-2 font-body text-xs text-muted uppercase tracking-widest">Weight</div>
            <div className="col-span-2 font-body text-xs text-muted uppercase tracking-widest">Gender</div>
            <div className="col-span-2" />
          </div>

          <div className="divide-y divide-dark-700">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-body text-muted text-sm">No patients found</p>
              </div>
            ) : filtered.map((pt, i) => (
              <button
                key={pt.id}
                onClick={() => navigate(`/dietitian/${dietitianId}/patient/${pt.id}`)}
                className="w-full grid grid-cols-12 gap-4 px-6 py-4 hover:bg-dark-700 transition-colors text-left group animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-400 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xs text-lime-400">
                      {pt.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-body text-sm font-medium text-primary group-hover:text-lime-400 transition-colors truncate">{pt.name}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="font-body text-sm text-muted">{pt.age}y</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="font-body text-sm text-primary font-medium">{pt.weightKg} kg</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="font-body text-xs px-2.5 py-1 rounded-full bg-dark-600 border border-dark-500 text-muted capitalize">
                    {pt.gender?.toLowerCase()}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <svg className="w-4 h-4 text-dark-400 group-hover:text-lime-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
