import React, { useState, useEffect } from 'react';
import { X, BookOpen, Pencil } from 'lucide-react';

export default function AddNoteModal({
  isOpen, onClose, onSubmit,
  languageName, langColor,
  editNote = null   // if provided → edit mode
}) {
  const isEdit = !!editNote;
  const [word, setWord]       = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWord(editNote?.word || '');
      setMeaning(editNote?.meaning || '');
      setExample(editNote?.exampleSentence || '');
      setError('');
      setLoading(false);
    }
  }, [isOpen, editNote]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim())    { setError('Enter a word or phrase.'); return; }
    if (!meaning.trim()) { setError('Enter the meaning.'); return; }
    setLoading(true); setError('');
    try {
      await onSubmit(word.trim(), meaning.trim(), example.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save.'); setLoading(false);
    }
  };

  const accent = langColor || '#7c3aed';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl border border-slate-100 shadow-xl p-5 max-h-[85vh] overflow-y-auto slide-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
              {isEdit
                ? <Pencil className="w-3.5 h-3.5" style={{ color: accent }} />
                : <BookOpen className="w-3.5 h-3.5" style={{ color: accent }} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Note' : 'Add Note'}</h2>
              <p className="text-[11px] text-slate-400">
                {isEdit ? 'Update this vocabulary entry in' : 'Adding to'}{' '}
                <span className="font-semibold" style={{ color: accent }}>{languageName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Word */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Word / Phrase</label>
            <input type="text" value={word}
              onChange={(e) => { setWord(e.target.value); setError(''); }}
              placeholder="e.g. Namaste" autoFocus disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': accent }} />
          </div>

          {/* Meaning */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Meaning / Translation</label>
            <input type="text" value={meaning}
              onChange={(e) => { setMeaning(e.target.value); setError(''); }}
              placeholder="e.g. Hello / Welcome" disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': accent }} />
          </div>

          {/* Example */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Example <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Use it in a sentence..." rows={2} disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
              style={{ '--tw-ring-color': accent }} />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: accent }}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
