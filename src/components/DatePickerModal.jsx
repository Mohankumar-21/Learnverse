import React from 'react';
import { X } from 'lucide-react';

export default function DatePickerModal({ isOpen, onClose, value, onChange }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-bold text-slate-800 mb-1">Select Filter Date</h3>
        <p className="text-xs text-slate-400 mb-4">Choose a specific calendar day to filter vocabulary notes.</p>

        <input
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClose();
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition cursor-pointer font-medium"
        />

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              onChange('');
              onClose();
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            Clear Date
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
