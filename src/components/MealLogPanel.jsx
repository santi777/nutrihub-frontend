import React, { useState } from 'react';

function MacroBadge({ label, value, unit = 'g', color }) {
  return (
    <div className={`flex flex-col items-center bg-dark-700 rounded-lg px-3 py-2 border ${color}`}>
      <span className="font-body text-xs text-muted mb-0.5">{label}</span>
      <span className="font-body text-sm font-semibold text-primary">{value}{unit}</span>
    </div>
  );
}

function MealEntry({ log }) {
  const [open, setOpen] = useState(false);
  const time = new Date(log.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="border-b border-dark-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-dark-700/50 transition-colors text-left"
      >
        <div className="text-right w-16 flex-shrink-0">
          <p className="font-body text-xs font-semibold text-lime-400">{time}</p>
          <p className="font-body text-xs text-muted">{date}</p>
        </div>
        <div className="w-px h-8 bg-dark-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium text-primary truncate">{log.mealName}</p>
          {log.notes && <p className="font-body text-xs text-muted truncate">{log.notes}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-body text-xs font-semibold text-lime-400">{log.nutritionData?.calories} kcal</span>
          <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && log.nutritionData && (
        <div className="px-5 pb-4 pt-1 flex gap-2 animate-fade-in">
          <div className="w-16 flex-shrink-0" />
          <div className="w-px flex-shrink-0" />
          <div className="flex gap-2 pl-4">
            <MacroBadge label="Protein" value={log.nutritionData.protein} color="border-blue-500/30" />
            <MacroBadge label="Carbs" value={log.nutritionData.carbs} color="border-yellow-500/30" />
            <MacroBadge label="Fat" value={log.nutritionData.fat} color="border-orange-500/30" />
            <MacroBadge label="Calories" value={log.nutritionData.calories} unit=" kcal" color="border-lime-400/30" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealLogPanel({ logs }) {
  const totalCalories = logs.reduce((sum, l) => sum + (l.nutritionData?.calories || 0), 0);
  const totalProtein = logs.reduce((sum, l) => sum + (l.nutritionData?.protein || 0), 0);

  // Group by date
  const grouped = logs.reduce((acc, log) => {
    const key = new Date(log.loggedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
        <h3 className="font-display text-lg tracking-wider text-primary">MEAL LOG</h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-body text-xs text-muted">Today</p>
            <p className="font-body text-sm font-semibold text-lime-400">{totalCalories} kcal</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs text-muted">Protein</p>
            <p className="font-body text-sm font-semibold text-primary">{totalProtein}g</p>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(grouped).map(([date, dayLogs]) => (
          <div key={date}>
            <div className="px-5 py-2 bg-dark-700/50 sticky top-0">
              <p className="font-body text-xs text-muted uppercase tracking-widest">{date}</p>
            </div>
            {dayLogs.map(log => <MealEntry key={log.id} log={log} />)}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-body text-muted text-sm">No meals logged yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
