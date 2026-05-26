import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-500 rounded-lg px-4 py-3 shadow-xl">
        <p className="font-body text-xs text-muted mb-1">{label}</p>
        <p className="font-display text-xl text-lime-400">{payload[0].value} <span className="text-sm text-muted font-body">kg</span></p>
      </div>
    );
  }
  return null;
}

export default function HealthChart({ records }) {
  const data = records.map(r => ({
    date: new Date(r.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: r.weightKg,
    notes: r.notes,
  }));

  const weights = data.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const change = (weights[weights.length - 1] - weights[0]).toFixed(1);
  const isPositive = change > 0;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-lg tracking-wider text-primary mb-1">WEIGHT PROGRESS</h3>
          <p className="font-body text-xs text-muted">{records.length} recorded measurements</p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">Total change</p>
          <p className={`font-display text-2xl ${isPositive ? 'text-red-400' : 'text-lime-400'}`}>
            {isPositive ? '+' : ''}{change} kg
          </p>
        </div>
      </div>

      {/* Mini stat row */}
      <div className="flex gap-6 mb-6">
        <div>
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">Starting</p>
          <p className="font-body text-sm font-semibold text-primary">{weights[0]} kg</p>
        </div>
        <div>
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">Current</p>
          <p className="font-body text-sm font-semibold text-lime-400">{weights[weights.length - 1]} kg</p>
        </div>
        <div>
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">Lowest</p>
          <p className="font-body text-sm font-semibold text-primary">{minWeight} kg</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c8ddc8" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b8f6b', fontSize: 11, fontFamily: 'Nunito' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b8f6b', fontSize: 11, fontFamily: 'Nunito' }}
            axisLine={false}
            tickLine={false}
            domain={[minWeight - 2, maxWeight + 2]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={weights[0]} stroke="#88aa88" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2d5a3d"
            strokeWidth={2}
            dot={{ fill: '#2d5a3d', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2d5a3d', stroke: '#f5f8f5', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
