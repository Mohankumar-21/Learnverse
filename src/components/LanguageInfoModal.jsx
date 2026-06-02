import React, { useState } from 'react';
import { X, Copy, Check, Share2, Users, Calendar, LogOut, Trash2, AlertTriangle, UserMinus } from 'lucide-react';

export default function LanguageInfoModal({ isOpen, onClose, language, nickname, onLeave, onDelete, onRemoveMember }) {
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'leave' | 'delete'
  const [removingMember, setRemovingMember] = useState(null); // username to remove
  const [loading, setLoading] = useState(false);

  if (!isOpen || !language) return null;

  const isCreator = language.createdBy === nickname;
  const members = language.members || [];

  const copy = () => {
    navigator.clipboard.writeText(language.joinCode || '').then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const createdDate = language.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) || '—';

  const handleConfirmAction = async () => {
    setLoading(true);
    try {
      if (confirmAction === 'leave') await onLeave(language.id);
      if (confirmAction === 'delete') await onDelete(language.id);
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); setConfirmAction(null); }
  };

  const handleConfirmRemove = async () => {
    if (!removingMember) return;
    setLoading(true);
    try {
      await onRemoveMember(language.id, removingMember);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRemovingMember(null); }
  };

  const closeAll = () => { setConfirmAction(null); setRemovingMember(null); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeAll} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl border border-slate-100 shadow-xl p-5 slide-up max-h-[90vh] overflow-y-auto">

        {/* ── Confirm leave/delete overlay ── */}
        {confirmAction && (
          <div className="absolute inset-0 bg-white rounded-2xl z-10 p-5 flex flex-col justify-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction === 'delete' ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${confirmAction === 'delete' ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
            <div className="text-center mb-5">
              <p className="text-base font-bold text-slate-900 mb-2">
                {confirmAction === 'delete' ? `Delete "${language.name}"?` : `Leave "${language.name}"?`}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                {confirmAction === 'delete'
                  ? 'This permanently deletes the language room and all its notes. Cannot be undone.'
                  : 'You will no longer see this language. Rejoin anytime with the invite code.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmAction(null)} disabled={loading}
                className="py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button onClick={handleConfirmAction} disabled={loading}
                className={`py-2.5 text-sm font-bold text-white rounded-xl cursor-pointer disabled:opacity-60 ${confirmAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                {loading ? 'Processing...' : confirmAction === 'delete' ? 'Delete' : 'Leave'}
              </button>
            </div>
          </div>
        )}

        {/* ── Confirm remove member overlay ── */}
        {removingMember && (
          <div className="absolute inset-0 bg-white rounded-2xl z-10 p-5 flex flex-col justify-center">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserMinus className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center mb-5">
              <p className="text-base font-bold text-slate-900 mb-2">Remove "{removingMember}"?</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                They will lose access to this language room. Their notes will remain visible.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setRemovingMember(null)} disabled={loading}
                className="py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button onClick={handleConfirmRemove} disabled={loading}
                className="py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl cursor-pointer disabled:opacity-60">
                {loading ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: language.color }}>
              <span className="text-white text-xs font-black">{language.name[0]}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{language.name}</h2>
              <p className="text-xs text-slate-400">{isCreator ? 'You are the creator' : `Created by ${language.createdBy}`}</p>
            </div>
          </div>
          <button onClick={closeAll} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* ── Invite Code ── */}
        {language.joinCode && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Share2 className="w-3 h-3" /> Invite Code
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <span className="text-xl font-black tracking-[0.2em] text-slate-800 font-mono">{language.joinCode}</span>
              <button onClick={copy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex-shrink-0"
                style={{
                  backgroundColor: copied ? '#f0fdf4' : `${language.color}15`,
                  color: copied ? '#16a34a' : language.color,
                  border: `1px solid ${copied ? '#bbf7d0' : `${language.color}30`}`
                }}>
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Members List ── */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Members ({members.length})
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {members.map((member, i) => {
              const isMe = member === nickname;
              const isMemberCreator = member === language.createdBy;
              return (
                <div
                  key={member}
                  className={`flex items-center justify-between px-3.5 py-2.5 ${i < members.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">{member[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{member}</span>
                      {isMe && <span className="ml-1.5 text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">You</span>}
                      {isMemberCreator && <span className="ml-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Creator</span>}
                    </div>
                  </div>
                  {/* Remove button — creator can remove anyone except themselves */}
                  {isCreator && !isMe && !isMemberCreator && (
                    <button
                      onClick={() => setRemovingMember(member)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <UserMinus className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Meta ── */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Created {createdDate}</span>
        </div>

        {/* ── Danger actions ── */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {!isCreator && (
            <button onClick={() => setConfirmAction('leave')}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" /> Leave "{language.name}"
            </button>
          )}
          {isCreator && (
            <button onClick={() => setConfirmAction('delete')}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer">
              <Trash2 className="w-4 h-4" /> Delete Language Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
