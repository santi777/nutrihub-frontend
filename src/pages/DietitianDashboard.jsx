import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EnrollmentRequestCard from '../components/EnrollmentRequestCard';
import { useApp } from '../context/AppContext';
import { getDietitian, getPatients } from '../services/api';
import { getRequestsByDietitian } from '../services/enrollmentRequests';

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

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`bg-dark-800 border rounded-xl p-5 ${accent ? 'border-lime-400/30 bg-lime-400/5' : 'border-dark-600'}`}>
      <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-display text-4xl tracking-wide ${accent ? 'text-lime-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="font-body text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function DietitianDashboard() {
  const { id } = useParams();
  const { setActiveDietitian } = useApp();
  const navigate = useNavigate();

  const [dietitian, setDietitian] = useState(null);
  const [patients, setPatients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('patients');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dtRes, ptRes, reqs] = await Promise.all([
          getDietitian(id),
          getPatients({ dietitianId: id }),
          getRequestsByDietitian(id),
        ]);
        setDietitian(dtRes.data);
        setActiveDietitian(dtRes.data);
        setPatients(ptRes.data);
        setRequests(reqs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, setActiveDietitian]);

  const handleRequestAction = (requestId, action) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    if (action === 'approved') {
      // Re-fetch patients in case backend was updated
      getPatients({ dietitianId: id }).then(res => setPatients(res.data)).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout navItems={dietitianNavItems(id)} title={dietitian?.name || 'Dashboard'}>
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Patients" value={patients.length} accent />
        <StatCard label="Requests" value={requests.length} sub="awaiting review" />
        <StatCard label="Specialization" value={dietitian?.specialization?.split(' ')[0] || '—'} sub={dietitian?.specialization} />
        <StatCard label="Status" value={dietitian?.isAcceptingPatients ? 'OPEN' : 'CLOSED'} sub="New patients" accent={dietitian?.isAcceptingPatients} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 border border-dark-600 rounded-lg p-1 w-fit">
        {[
          { key: 'patients', label: 'Patients' },
          { key: 'requests', label: `Requests${requests.length > 0 ? ` (${requests.length})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`font-body text-sm px-5 py-2 rounded-md transition-all ${
              tab === key ? 'bg-lime-400 text-dark-900 font-semibold' : 'text-muted hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={tab}>
        {tab === 'patients' && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
              <h2 className="font-display text-lg tracking-wider text-primary">ACTIVE PATIENTS</h2>
            </div>
            <div className="divide-y divide-dark-700 max-h-[480px] overflow-y-auto">
              {patients.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="font-body text-muted text-sm">No active patients yet.</p>
                  <p className="font-body text-xs text-muted mt-1">Approve enrollment requests to add patients.</p>
                </div>
              ) : patients.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => navigate(`/dietitian/${id}/patient/${pt.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-dark-700 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-400 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xs text-lime-400">
                      {pt.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-primary group-hover:text-lime-400 transition-colors truncate">{pt.name}</p>
                    <p className="font-body text-xs text-muted">{pt.age}y · {pt.gender} · {pt.weightKg}kg</p>
                  </div>
                  <svg className="w-4 h-4 text-dark-400 group-hover:text-lime-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="bg-dark-800 border border-dark-600 rounded-xl px-6 py-14 text-center">
                <p className="font-body text-muted text-sm">No pending enrollment requests.</p>
                <p className="font-body text-xs text-muted mt-1">When patients request you, their profiles will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {requests.map(req => (
                  <EnrollmentRequestCard key={req.id} request={req} onAction={handleRequestAction} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
