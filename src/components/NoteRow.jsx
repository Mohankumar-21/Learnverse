import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

const timeAgo = (ts) => {
  if (!ts) return '';
  let d;
  if (ts?.toDate) d = ts.toDate();
  else if (ts?.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  if (isNaN(d)) return '';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export default function NoteRow({ note, langColor, isLast, onEdit, onDelete }) {
  const { word, meaning, exampleSentence, addedBy, date } = note;
  const [expanded, setExpanded] = useState(false);
  const hasExample = !!exampleSentence;
  const accent = langColor || '#7c3aed';

  return (
    <div className={`group ${!isLast ? 'border-b border-slate-100' : ''}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
        {/* Color dot */}
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />

        {/* Word */}
        <span
          className={`text-sm font-bold text-slate-900 w-28 sm:w-36 flex-shrink-0 truncate ${hasExample ? 'cursor-pointer' : ''}`}
          onClick={() => hasExample && setExpanded(e => !e)}
        >
          {word}
        </span>

        {/* Separator (desktop) */}
        <span className="hidden sm:block w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Meaning — tappable to expand */}
        <span
          className={`flex-1 text-sm text-slate-500 truncate ${hasExample ? 'cursor-pointer' : ''}`}
          onClick={() => hasExample && setExpanded(e => !e)}
        >
          {meaning}
        </span>

        {/* Right side: actions + meta */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {/* Edit button */}
          <button
            onClick={() => onEdit(note)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-violet-500 hover:bg-violet-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            title="Edit note"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(note)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Mobile always-visible dot-menu (shows below) */}
          <span className="hidden text-[11px] text-slate-400 sm:inline">{addedBy}</span>
          <span className="text-[11px] text-slate-300 whitespace-nowrap">{timeAgo(date)}</span>

          {/* Expand toggle */}
          {hasExample && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile action bar — always visible on touch devices */}
      <div className="flex items-center gap-2 px-4 pb-2 sm:hidden group-hover:flex">
        <button
          onClick={() => onEdit(note)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-violet-600 bg-violet-50 rounded-lg cursor-pointer"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onDelete(note)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-500 bg-red-50 rounded-lg cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
        <span className="text-[11px] text-slate-400 ml-auto">{addedBy}</span>
      </div>

      {/* Expanded example sentence */}
      {expanded && hasExample && (
        <div className="px-4 pb-3 flex gap-3 animate-in">
          <span className="w-2 flex-shrink-0" />
          <p className="flex-1 text-sm text-slate-400 italic leading-relaxed pl-0 sm:pl-36">
            "{exampleSentence}"
          </p>
        </div>
      )}
    </div>
  );
}
