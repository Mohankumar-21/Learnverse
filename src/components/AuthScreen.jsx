import React, { useState } from 'react';
import { getDoc, setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Languages, ArrowRight, Mail, User } from 'lucide-react';

const sanitizeEmail = (email) => email.toLowerCase().trim().replace(/\./g, '_dot_').replace(/@/g, '_at_');

export default function AuthScreen({ onSave }) {
  // Step 1: email  |  Step 2: new-username  |  Step 3: returning-confirm
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [returningName, setReturningName] = useState('');
  const [suggested, setSuggested] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | taken
  const [error, setError] = useState('');

  /* ── helpers ── */
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const findFreeUsername = async (base) => {
    const clean = base.split('#')[0];
    // Check original
    const q = query(collection(db, 'users'), where('username', '==', clean));
    const snap = await getDocs(q);
    if (snap.empty) return clean;
    let n = 2;
    while (n <= 99) {
      const candidate = `${clean}#${n}`;
      const q2 = query(collection(db, 'users'), where('username', '==', candidate));
      const s2 = await getDocs(q2);
      if (s2.empty) return candidate;
      n++;
    }
    return null;
  };

  /* ── Step 1: Check email ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.toLowerCase().trim();
    if (!isValidEmail(trimmed)) { setError('Enter a valid email address.'); return; }
    setStatus('loading'); setError('');
    try {
      const ref = doc(db, 'users', sanitizeEmail(trimmed));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        // Returning user — confirm identity
        setReturningName(snap.data().username);
        setStep('returning');
      } else {
        // New user — go to username step
        setStep('newuser');
      }
    } catch {
      // Firestore not accessible yet — skip to username
      setStep('newuser');
    } finally {
      setStatus('idle');
    }
  };

  /* ── Step 3: Returning user confirms ── */
  const handleReturningConfirm = () => {
    localStorage.setItem('learnverse_user', JSON.stringify({ email: email.toLowerCase().trim(), username: returningName }));
    onSave(returningName, email.toLowerCase().trim());
  };

  /* ── Step 2: New user picks username ── */
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    const name = (suggested || username).trim();
    if (!name) { setError('Enter a username.'); return; }
    setStatus('loading'); setError('');
    try {
      const q = query(collection(db, 'users'), where('username', '==', name));
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Taken — find suggestion
        const free = await findFreeUsername(name);
        if (!free) { setError('No available usernames. Try a different name.'); setStatus('idle'); return; }
        setSuggested(free);
        setStatus('taken');
        return;
      }
      // Available — save
      const emailClean = email.toLowerCase().trim();
      await setDoc(doc(db, 'users', sanitizeEmail(emailClean)), {
        username: name, email: emailClean, createdAt: new Date().toISOString()
      });
      localStorage.setItem('learnverse_user', JSON.stringify({ email: emailClean, username: name }));
      onSave(name, emailClean);
    } catch {
      // Firestore rules not open — just save locally
      const emailClean = email.toLowerCase().trim();
      const name2 = (suggested || username).trim();
      localStorage.setItem('learnverse_user', JSON.stringify({ email: emailClean, username: name2 }));
      onSave(name2, emailClean);
    } finally {
      setStatus('idle');
    }
  };

  const handleUseSuggested = async () => {
    setSuggested(suggested);
    setStatus('idle');
    // Re-submit with the suggested name already set
    const emailClean = email.toLowerCase().trim();
    try {
      await setDoc(doc(db, 'users', sanitizeEmail(emailClean)), {
        username: suggested, email: emailClean, createdAt: new Date().toISOString()
      });
      localStorage.setItem('learnverse_user', JSON.stringify({ email: emailClean, username: suggested }));
      onSave(suggested, emailClean);
    } catch {
      localStorage.setItem('learnverse_user', JSON.stringify({ email: emailClean, username: suggested }));
      onSave(suggested, emailClean);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-violet-200/30 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-200/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-in">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: '#1e1b4b' }}>
            <Languages className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Learnverse</h1>
          <p className="text-sm text-slate-500">Collaborative language learning</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-0.5">Welcome!</h2>
                <p className="text-sm text-slate-500 mb-4">Enter your email to get started or sign back in.</p>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com" autoFocus
                    className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                    disabled={status === 'loading'}
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              </div>
              <button type="submit" disabled={status === 'loading'}
                className="w-full py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer" style={{ backgroundColor: '#4c1d95' }}>
                {status === 'loading'
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</>
                  : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ── Step 2: New user — pick username ── */}
          {step === 'newuser' && (
            status === 'taken' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">"{username}" is already taken</p>
                  <p className="text-sm text-slate-400 mt-0.5">How about this?</p>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-xl py-4 text-center">
                  <span className="text-xl font-black text-violet-700">{suggested}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setStatus('idle'); setSuggested(''); }}
                    className="py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                    Try different
                  </button>
                  <button onClick={handleUseSuggested}
                    className="py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer">
                    Use this ✓
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-0.5">Create your username</h2>
                  <p className="text-sm text-slate-500 mb-4">This is how others will see you in the app.</p>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); setSuggested(''); }}
                      placeholder="e.g. Rohan, Teacher_Priya" autoFocus maxLength={25}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                      disabled={status === 'loading'}
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>
                <button type="submit" disabled={status === 'loading'}
                  className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  style={{ backgroundColor: '#4c1d95' }}>
                  {status === 'loading'
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</>
                    : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => { setStep('email'); setError(''); }}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  ← Back
                </button>
              </form>
            )
          )}

          {/* ── Step 3: Returning user — confirm ── */}
          {step === 'returning' && (
            <div className="space-y-5 text-center">
              <div>
                <p className="text-sm text-slate-500 mb-1">Welcome back!</p>
                <p className="text-xl font-black text-slate-900">{returningName} 👋</p>
                <p className="text-xs text-slate-400 mt-1">{email}</p>
              </div>
              <button onClick={handleReturningConfirm}
                className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer"
                style={{ backgroundColor: '#4c1d95' }}>
                Continue as {returningName}
              </button>
              <button onClick={() => { setStep('email'); setReturningName(''); setEmail(''); }}
                className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                Not you? Use different email
              </button>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-5 pt-4 border-t border-slate-100">
            No password needed · Works across all your devices
          </p>
        </div>
      </div>
    </div>
  );
}
