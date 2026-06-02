import React from 'react';
import { Plus, UserPlus, Info } from 'lucide-react';

export default function LanguageTabs({
  languages, activeLanguageId,
  onSelect, onAddLanguage, onJoinLanguage, onShowInfo
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 sm:px-6 py-3">
      {languages.map((lang) => {
        const active = lang.id === activeLanguageId;
        return (
          <div key={lang.id} className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onSelect(lang.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                active
                  ? 'text-white border-transparent shadow-md'
                  : 'text-slate-500 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-700'
              }`}
              style={active ? { backgroundColor: lang.color, borderColor: lang.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : lang.color }}
              />
              {lang.name}
            </button>

            {/* Info button — only visible on active tab */}
            {active && (
              <button
                onClick={() => onShowInfo(lang)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="View join code & language info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={onAddLanguage}
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-slate-400 bg-white border border-dashed border-slate-300 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New</span>
      </button>

      <button
        onClick={onJoinLanguage}
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-slate-400 bg-white border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Join</span>
      </button>
    </div>
  );
}
