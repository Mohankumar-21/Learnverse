import React from 'react';
import { Calendar, Layers, Clock } from 'lucide-react';

export default function DateFilter({ filter, onFilterChange }) {
  const options = [
    { value: 'all', label: 'All Time', icon: Layers },
    { value: 'week', label: 'This Week', icon: Clock },
    { value: 'today', label: 'Today', icon: Calendar },
  ];

  return (
    <div className="w-full flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
      <h2 className="text-lg font-bold text-slate-900 font-display hidden sm:block">Vocabulary Cards</h2>
      
      {/* Segmented Control */}
      <div className="w-full sm:w-auto p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center gap-1">
        {options.map((opt) => {
          const isActive = filter === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[38px] ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
