import React, { useState } from 'react';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Languages, ArrowRight } from 'lucide-react';

export default function NicknameScreen({ onSave }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | taken
  const [suggested, setSuggested] = useState('');
  const [error, setError] = useState('');

  const attemptSave = async (rawName) => {
    const clean = rawName.trim();
    if (!clean) { setError('Please enter a nickname.'); return; }
    setStatus('checking'); setError('');
    try {
      const ref = doc(db, 'usernames', clean);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { takenAt: new Date().toISOString() });
        localStorage.setItem('learnverse_nickname', clean);
        onSave(clean);
      } else {
        // Find next free slot
        let n = 2;
        while (n <= 99) {
          const candidate = `${clean.split('#')[0]}#${n}`;
          const s = await getDoc(doc(db, 'usernames', candidate));
          if (!s.exists()) { setSuggested(candidate); setStatus('taken'); return; }
          n++;
        }
        setError('No available name. Try a different one.');
        setStatus('idle');
      }
    } catch {
      // Firestore rules not open yet — skip uniqueness, just save
      localStorage.setItem('learnverse_nickname', clean);
      onSave(clean);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      {/* Soft background blobs */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-violet-200/40 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-indigo-200/30 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-in">
        {/* Brand header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-200">
            <Languages className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Learnverse</h1>
          <p className="text-sm text-slate-500">Your collaborative language learning diary</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {status === 'taken' ? (
            /* Name taken — suggest alternative */
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">"{name.trim()}" is already taken</p>
                <p className="text-sm text-slate-400 mt-1">How about this name instead?</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl py-4 text-center">
                <span className="text-xl font-black text-violet-700">{suggested}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setStatus('idle'); setSuggested(''); }}
                  className="py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Try different
                </button>
                <button
                  onClick={() => attemptSave(suggested)}
                  className="py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Use this ✓
                </button>
              </div>
            </div>
          ) : (
            /* Main form */
            <form onSubmit={(e) => { e.preventDefault(); attemptSave(name); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="e.g. Ravi, Teacher, Sarah"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                  maxLength={25}
                  autoFocus
                  disabled={status === 'checking'}
                />
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={status === 'checking'}
                className="w-full py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {status === 'checking' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</>
                ) : (
                  <>Let's Go <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-5 pt-4 border-t border-slate-100">
            No password needed · Saved locally on your device
          </p>
        </div>
      </div>
    </div>
  );
}
