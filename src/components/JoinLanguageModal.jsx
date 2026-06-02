import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { X, KeyRound, Check } from 'lucide-react';

export default function JoinLanguageModal({ isOpen, onClose, nickname }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [foundLang, setFoundLang] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => { setCode(''); setStatus('idle'); setFoundLang(null); setError(''); onClose(); };

  const handleJoin = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 5) { setError('Code must be exactly 5 characters.'); return; }
    setStatus('loading'); setError('');
    try {
      const q = query(collection(db, 'languages'), where('joinCode', '==', trimmed));
      const snap = await getDocs(q);
      if (snap.empty) { setError('No language found with this code.'); setStatus('idle'); return; }
      const langDoc = snap.docs[0];
      const langData = { id: langDoc.id, ...langDoc.data() };
      if (langData.members?.includes(nickname)) {
        setError(`You're already in "${langData.name}"!`); setStatus('idle'); return;
      }
      await updateDoc(doc(db, 'languages', langDoc.id), { members: arrayUnion(nickname) });
      setFoundLang(langData);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Failed to join. Try again.'); setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-xl p-5 sm:slide-up">
        {status === 'success' ? (
          <div className="text-center space-y-3 py-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Joined "{foundLang?.name}"!</p>
              <p className="text-xs text-gray-500 mt-0.5">The tab is now in your dashboard.</p>
            </div>
            <button onClick={handleClose} className="w-full py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer">
              Start Learning!
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Join a Language</h2>
              <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Enter 5-character join code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="e.g. HN4X2"
                    className="w-full pl-8 pr-3 py-2.5 text-sm font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                    maxLength={5} autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleClose} className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={status === 'loading'} className="flex-1 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {status === 'loading' ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Joining...</> : 'Join'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
