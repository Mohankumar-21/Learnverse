import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, word }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-white rounded-2xl border border-slate-100 shadow-xl p-5 animate-in">
        {/* Icon */}
        <div className="flex items-center justify-center w-11 h-11 bg-red-50 rounded-full mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>

        {/* Content */}
        <div className="text-center mb-5">
          <h2 className="text-base font-bold text-slate-900 mb-2">Delete this note?</h2>
          {word && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-2 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 break-all line-clamp-2">{word}</p>
            </div>
          )}
          <p className="text-xs text-slate-400">This note will be permanently removed.</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose}
            className="py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
