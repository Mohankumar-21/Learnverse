import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Globe } from 'lucide-react';

const COLORS = ['#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];

const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function AddLanguageModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[5]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) { setName(''); setColor(COLORS[5]); setError(''); setLoading(false); setCreatedCode(''); setCopied(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a language name.'); return; }
    setLoading(true); setError('');
    const code = genCode();
    try {
      await onSubmit(trimmed, color, code);
      setCreatedCode(code);
    } catch (err) {
      setError(err.message || 'Failed to create. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(createdCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={createdCode ? onClose : onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-xl max-h-[85vh] overflow-y-auto sm:slide-up">
        <div className="p-5">
          {createdCode ? (
            /* Success — show join code */
            <div className="space-y-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Language created!</p>
                <p className="text-xs text-gray-500 mt-0.5">Share this code with friends so they can join:</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-2xl font-black tracking-[0.25em] text-gray-900 font-mono">{createdCode}</p>
              </div>
              <button
                onClick={copy}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer"
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer">Done</button>
            </div>
          ) : (
            /* Create form */
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">New Language</h2>
                </div>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Language Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="e.g. Hindi, French, Japanese"
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                    maxLength={20} autoFocus disabled={loading}
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c} type="button"
                        onClick={() => setColor(c)}
                        className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center border-2"
                        style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent', boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none' }}
                        disabled={loading}
                      >
                        {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer" disabled={loading}>Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60" disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
