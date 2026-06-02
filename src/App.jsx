import React, { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  arrayRemove, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from './firebase';

import AuthScreen          from './components/AuthScreen';
import LanguageTabs        from './components/LanguageTabs';
import NoteCard            from './components/NoteCard';
import AddLanguageModal    from './components/AddLanguageModal';
import JoinLanguageModal   from './components/JoinLanguageModal';
import AddNoteModal        from './components/AddNoteModal';
import LanguageInfoModal   from './components/LanguageInfoModal';
import DeleteConfirmModal  from './components/DeleteConfirmModal';
import ProfileModal        from './components/ProfileModal';
import DatePickerModal     from './components/DatePickerModal';

import { Languages, Plus, BookOpen, AlertTriangle, UserCircle, Search, Filter, ChevronDown, ArrowLeft, X, ArrowUp } from 'lucide-react';

const toDate = (ts) => {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts?.toDate) return ts.toDate;
  if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  if (ts instanceof Date) return ts;
  if (typeof ts === 'number') return new Date(ts);
  const parsed = new Date(ts);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const groupByDate = (notes) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week  = new Date(today); week.setDate(week.getDate() - 6);
  const month = new Date(today); month.setDate(month.getDate() - 29);
  const buckets = { 'Today': [], 'This Week': [], 'This Month': [], 'Earlier': [] };
  notes.forEach((n) => {
    const d = toDate(n.date);
    if (!d || isNaN(d)) { buckets['Today'].push(n); return; }
    if      (d >= today) buckets['Today'].push(n);
    else if (d >= week)  buckets['This Week'].push(n);
    else if (d >= month) buckets['This Month'].push(n);
    else                 buckets['Earlier'].push(n);
  });
  return Object.entries(buckets).filter(([, a]) => a.length > 0);
};

const formatCompactDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [, month, day] = parts;
  return `${month}/${day}`;
};

/* ─── App ─── */
export default function App() {
  const storedUser = (() => {
    try {
      localStorage.removeItem('learnverse_nickname'); // clear legacy key
      return JSON.parse(localStorage.getItem('learnverse_user') || 'null');
    } catch { return null; }
  })();

  const [user, setUser]                 = useState(storedUser);
  const [languages, setLanguages]       = useState([]);
  const [activeId, setActiveId]         = useState('');
  const [notes, setNotes]               = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [fbError, setFbError]           = useState(null);

  // Modals
  const [showLang, setShowLang]       = useState(false);
  const [showJoin, setShowJoin]       = useState(false);
  const [showNote, setShowNote]       = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [infoLang, setInfoLang]       = useState(null);
  const [editNote, setEditNote]       = useState(null);
  const [deleteNote, setDeleteNote]   = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);

  const username = user?.username || '';

  /* ── Languages ── */
  useEffect(() => {
    if (!username) return;
    const q = query(collection(db, 'languages'), where('members', 'array-contains', username));
    const unsub = onSnapshot(q, (snap) => {
      setFbError(null);
      const langs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      setLanguages(langs);
      setActiveId(prev => prev && langs.some(l => l.id === prev) ? prev : (langs[0]?.id || ''));
    }, (err) => {
      if (err.code === 'permission-denied') setFbError('permission');
      else setFbError(err.message);
    });
    return unsub;
  }, [username]);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter]   = useState('all'); // all | custom | today | week | month | earlier
  const [customDate, setCustomDate]   = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Notes ── */
  useEffect(() => {
    if (!username || !activeId) { setNotes([]); return; }
    setLoadingNotes(true);
    const q = query(collection(db, 'languages', activeId, 'notes'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingNotes(false);
    }, () => setLoadingNotes(false));
    return unsub;
  }, [username, activeId]);

  const activeLang = languages.find(l => l.id === activeId);
  const langColor  = activeLang?.color || '#7c3aed';

  const filteredNotes = notes.filter((note) => {
    // 1. Search Query Filter
    const matchesSearch = searchQuery.trim() === '' ||
      note.word?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.meaning?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.exampleSentence?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Date Filter
    if (dateFilter === 'all') return true;

    const d = toDate(note.date);
    if (!d || isNaN(d)) return dateFilter === 'today'; // Default fallback

    if (dateFilter === 'custom') {
      if (!customDate) return true;
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const formattedNoteDate = `${year}-${monthStr}-${dayStr}`;
      return formattedNoteDate === customDate;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today); week.setDate(week.getDate() - 6);
    const month = new Date(today); month.setDate(month.getDate() - 29);

    if (dateFilter === 'today') return d >= today;
    if (dateFilter === 'week') return d >= week;
    if (dateFilter === 'month') return d >= month;
    if (dateFilter === 'earlier') return d < month;

    return true;
  });

  const groups = groupByDate(filteredNotes);

  /* ── Auth actions ── */
  const handleSaveUser = (uname, email) => {
    const u = { username: uname, email };
    localStorage.setItem('learnverse_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('learnverse_user');
    setUser(null); setLanguages([]); setNotes([]); setActiveId('');
  };

  const handleRemoveAccount = () => {
    localStorage.removeItem('learnverse_user');
    setUser(null); setLanguages([]); setNotes([]); setActiveId('');
  };

  /* ── Language actions ── */
  const handleAddLanguage = async (name, color, joinCode) => {
    const ref = await addDoc(collection(db, 'languages'), {
      name, color, joinCode, members: [username],
      createdAt: serverTimestamp(), createdBy: username,
    });
    setActiveId(ref.id);
  };

  const handleLeaveLanguage = async (langId) => {
    await updateDoc(doc(db, 'languages', langId), { members: arrayRemove(username) });
    setInfoLang(null);
  };

  const handleDeleteLanguage = async (langId) => {
    const notesSnap = await getDocs(collection(db, 'languages', langId, 'notes'));
    const batch = writeBatch(db);
    notesSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'languages', langId));
    await batch.commit();
    setInfoLang(null);
    if (activeId === langId) setActiveId('');
  };

  const handleRemoveMember = async (langId, memberUsername) => {
    await updateDoc(doc(db, 'languages', langId), { members: arrayRemove(memberUsername) });
    // Update local infoLang so modal reflects change immediately
    setInfoLang(prev => prev ? { ...prev, members: (prev.members || []).filter(m => m !== memberUsername) } : null);
  };

  /* ── Note actions ── */
  const handleAddNote = async (word, meaning, exampleSentence) => {
    await addDoc(collection(db, 'languages', activeId, 'notes'), {
      word, meaning, exampleSentence, addedBy: username, date: serverTimestamp(),
    });
  };

  const handleEditNote = async (word, meaning, exampleSentence) => {
    if (!editNote) return;
    await updateDoc(doc(db, 'languages', activeId, 'notes', editNote.id), {
      word, meaning, exampleSentence,
    });
  };

  const handleDeleteNote = async () => {
    if (!deleteNote) return;
    await deleteDoc(doc(db, 'languages', activeId, 'notes', deleteNote.id));
    setDeleteNote(null);
  };

  if (!user) return <AuthScreen onSave={handleSaveUser} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f5f9' }}>

      {/* ══ HEADER ══ */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: '#1e1b4b' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3" style={{ height: 52 }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Languages className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Learnverse</span>
          </div>
          {/* Profile button */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-white/90 max-w-[90px] truncate">{username}</span>
            <UserCircle className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </header>

      {/* ══ TABS ══ */}
      <div className="bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <LanguageTabs
            languages={languages}
            activeLanguageId={activeId}
            onSelect={setActiveId}
            onAddLanguage={() => setShowLang(true)}
            onJoinLanguage={() => setShowJoin(true)}
            onShowInfo={(lang) => setInfoLang(lang)}
          />
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* Permission error */}
        {fbError === 'permission' && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 animate-in">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-900 mb-1">Firestore permissions needed</p>
              <p className="text-amber-700 mb-2">Firebase Console → Firestore → Rules → publish:</p>
              <pre className="bg-amber-100 px-3 py-2 rounded-xl text-xs font-mono text-amber-900 overflow-x-auto">{`match /{document=**} {\n  allow read, write: if true;\n}`}</pre>
            </div>
          </div>
        )}

        {/* No languages */}
        {!fbError && languages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl border-2 border-indigo-100 bg-indigo-50">🌍</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No languages yet</h2>
            <p className="text-sm text-slate-500 max-w-xs mb-8 leading-relaxed">Create a language room or join one with a code from a friend.</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => setShowLang(true)}
                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                style={{ backgroundColor: '#4c1d95' }}>
                + Create Language
              </button>
              <button onClick={() => setShowJoin(true)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                Join with Code
              </button>
            </div>
          </div>
        )}

        {/* Notes area */}
        {languages.length > 0 && activeId && (
          <>
            {showSearchBar ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-5 flex items-center gap-3 animate-in">
                <button
                  onClick={() => { setShowSearchBar(false); setSearchQuery(''); }}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
                  title="Close search"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search words, meanings, or sentences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-between gap-3 mb-5">
                {/* Left Side: Add Note Button (replacing language name) */}
                <button onClick={() => { setEditNote(null); setShowNote(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: langColor }}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
                
                {/* Right Side: Filters & Search */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Date selection dropdown */}
                  <div className="relative">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={dateFilter}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowDateModal(true);
                        } else {
                          setDateFilter(e.target.value);
                          setCustomDate('');
                        }
                      }}
                      className="pl-7 pr-6 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition cursor-pointer font-medium"
                    >
                      <option value="all">All</option>
                      <option value="custom">Date...</option>
                      <option value="today">Today</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="earlier">Earlier</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Selected date badge */}
                  {dateFilter === 'custom' && customDate && (
                    <button
                      onClick={() => setShowDateModal(true)}
                      className="px-2 py-1 text-[10px] font-bold bg-violet-50 border border-violet-100 text-violet-600 rounded-lg cursor-pointer transition hover:bg-violet-100 flex-shrink-0"
                    >
                      {formatCompactDate(customDate)}
                    </button>
                  )}

                  {/* Reset/Clear filter button */}
                  {dateFilter !== 'all' && (
                    <button
                      onClick={() => {
                        setDateFilter('all');
                        setCustomDate('');
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors cursor-pointer flex-shrink-0"
                      title="Clear Date Filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Search toggle trigger icon */}
                  <button
                    onClick={() => setShowSearchBar(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex-shrink-0"
                    title="Search notes"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {loadingNotes ? (
              <div className="flex justify-center py-24">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center py-16 text-center animate-in">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1.5">No notes yet</h3>
                <p className="text-sm text-slate-400 mb-5">Be the first to add a vocabulary word!</p>
                <button onClick={() => { setEditNote(null); setShowNote(true); }}
                  className="px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm cursor-pointer"
                  style={{ backgroundColor: langColor }}>
                  + Add First Note
                </button>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center py-16 text-center animate-in">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1.5">No matching notes</h3>
                <p className="text-sm text-slate-400 mb-5">Try adjusting your search query or date filter.</p>
                <button onClick={() => { setSearchQuery(''); setDateFilter('all'); }}
                  className="px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm cursor-pointer"
                  style={{ backgroundColor: langColor }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in">
                {groups.map(([label, groupNotes]) => (
                  <section key={label}>
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[11px] text-slate-300 font-medium">{groupNotes.length}</span>
                    </div>
                    {/* Plain text list — no card boxes */}
                    <div className="bg-white rounded-2xl border border-slate-100 px-4">
                      {groupNotes.map((note, i) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          langColor={langColor}
                          currentUsername={username}
                          langCreatedBy={activeLang?.createdBy}
                          isLast={i === groupNotes.length - 1}
                          onEdit={(n) => { setEditNote(n); setShowNote(true); }}
                          onDelete={(n) => setDeleteNote(n)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile FAB */}
      {languages.length > 0 && activeId && (
        <button onClick={() => { setEditNote(null); setShowNote(true); }}
          className="fixed bottom-6 right-6 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40 cursor-pointer sm:hidden"
          style={{ backgroundColor: langColor, width: 52, height: 52 }}>
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-7 right-22 sm:bottom-8 sm:right-8 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer border border-slate-700/50"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* ── Modals ── */}
      <AddLanguageModal  isOpen={showLang}    onClose={() => setShowLang(false)}              onSubmit={handleAddLanguage} />
      <JoinLanguageModal isOpen={showJoin}    onClose={() => setShowJoin(false)}              nickname={username} />
      <ProfileModal      isOpen={showProfile} onClose={() => setShowProfile(false)}
                         user={user} onLogout={handleLogout} onRemoveAccount={handleRemoveAccount} />
      <LanguageInfoModal
        isOpen={!!infoLang} onClose={() => setInfoLang(null)}
        language={infoLang} nickname={username}
        onLeave={handleLeaveLanguage}
        onDelete={handleDeleteLanguage}
        onRemoveMember={handleRemoveMember}
      />
      <AddNoteModal
        isOpen={showNote}
        onClose={() => { setShowNote(false); setEditNote(null); }}
        onSubmit={editNote ? handleEditNote : handleAddNote}
        languageName={activeLang?.name || ''}
        langColor={langColor}
        editNote={editNote}
      />
      <DeleteConfirmModal
        isOpen={!!deleteNote} onClose={() => setDeleteNote(null)}
        onConfirm={handleDeleteNote} word={deleteNote?.word}
      />
      <DatePickerModal
        isOpen={showDateModal}
        onClose={() => {
          setShowDateModal(false);
          // If user closed modal without picking a date, reset to 'all'
          if (!customDate) {
            setDateFilter('all');
          }
        }}
        value={customDate}
        onChange={(val) => {
          setCustomDate(val);
          setDateFilter(val ? 'custom' : 'all');
        }}
      />
    </div>
  );
}
