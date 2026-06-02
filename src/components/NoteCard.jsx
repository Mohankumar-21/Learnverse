import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const formatDate = (ts) => {
  if (!ts) return '';
  let d;
  if (typeof ts.toDate === 'function') d = ts.toDate();
  else if (ts?.toDate) d = ts.toDate;
  else if (typeof ts.seconds === 'number') d = new Date(ts.seconds * 1000);
  else if (ts instanceof Date) d = ts;
  else if (typeof ts === 'number') d = new Date(ts);
  else d = new Date(ts);
  
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function NoteCard({ note, langColor, onEdit, onDelete, currentUsername, langCreatedBy, isLast }) {
  const { word, meaning, exampleSentence, addedBy, date } = note;
  const accent = langColor || '#7c3aed';
  const canModify = currentUsername === addedBy || currentUsername === langCreatedBy;

  return (
    <div className="flex gap-4 py-4 group relative">
      
      {/* Left: color dot & lighter vertical connecting line */}
      <div className="flex-shrink-0 relative flex flex-col items-center w-3">
        {!isLast && (
          <div className="absolute top-4.5 bottom-0 w-[1px] bg-slate-200" />
        )}
        <span className="block w-1.5 h-1.5 rounded-full mt-2 relative z-10" style={{ backgroundColor: accent }} />
      </div>

      {/* Right: all text content */}
      <div className="flex-1 min-w-0 space-y-2.5">
        
        {/* Word row with Actions */}
        <div className="flex items-start justify-between gap-4">
          <span
            className="inline-block text-sm font-bold px-2.5 py-0.5 rounded-md border break-all leading-normal"
            style={{ backgroundColor: `${accent}0f`, borderColor: `${accent}30`, color: accent }}
          >
            {word}
          </span>
          
          {/* Edit/Delete Actions */}
          {canModify && (
            <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(note)}
                className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(note)}
                className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Meaning */}
        <div className="text-sm text-slate-700 leading-relaxed break-words font-medium">
          {meaning}
        </div>

        {/* Example sentence (Non-italic) */}
        {exampleSentence && (
          <div
            className="text-sm text-slate-500 leading-relaxed break-words border-l-2 pl-3 py-1 bg-slate-50/50 rounded-r-lg"
            style={{ borderColor: `${accent}45` }}
          >
            "{exampleSentence}"
          </div>
        )}

        {/* Footer info: Author and Date */}
        <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap pt-0.5">
          <span>By {addedBy}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{formatDate(date)}</span>
        </div>

      </div>
    </div>
  );
}
