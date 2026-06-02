import React, { useState } from 'react';
import { X, Mail, User, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const sanitizeEmail = (email) =>
  email.toLowerCase().trim().replace(/\./g, '_dot_').replace(/@/g, '_at_');

export default function ProfileModal({ isOpen, onClose, user, onLogout, onRemoveAccount }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRemove = async () => {
    setLoading(true);
    try {
      // Remove from Firestore /users collection
      await deleteDoc(doc(db, 'users', sanitizeEmail(user.email)));
    } catch (e) {
      console.error('Could not remove from Firestore:', e);
    } finally {
      onRemoveAccount(); // clears localStorage and resets state
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl border border-slate-100 shadow-xl p-5 slide-up">

        {/* Confirm delete overlay */}
        {confirm && (
          <div className="absolute inset-0 bg-white rounded-2xl z-10 p-5 flex flex-col justify-center">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center mb-5">
              <p className="text-base font-bold text-slate-900 mb-1">Remove your account?</p>
              <p className="text-sm text-slate-500">
                Your username <strong>{user.username}</strong> will be freed up and you'll be signed out.
                You won't lose any notes — they'll stay in the language rooms.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirm(false)} disabled={loading}
                className="py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleRemove} disabled={loading}
                className="py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer disabled:opacity-60">
                {loading ? 'Removing...' : 'Remove Account'}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-900">Your Profile</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* User info */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-base font-black text-violet-700">{user.username[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
            <User className="w-4 h-4 text-slate-300" />
            <span>Username: <strong className="text-slate-700">{user.username}</strong></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
            <Mail className="w-4 h-4 text-slate-300" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign out
          </button>
          <button
            onClick={() => setConfirm(true)}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Remove my account
          </button>
        </div>
      </div>
    </div>
  );
}
