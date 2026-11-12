import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, ShieldCheck, CheckCircle2, LogOut, ChevronDown, Building, Mail, Sparkles } from 'lucide-react';

export const UserProfileBadge: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal('LOGIN')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
      >
        <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Đăng nhập / Đăng ký</span>
      </button>
    );
  }

  // Initials for avatar
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : 'CB';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs"
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[11px] shadow-xs">
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Đã kích hoạt bằng mã Gmail" />
        </div>

        <div className="text-left hidden sm:block">
          <div className="font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
            {user.fullName}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Gmail đã xác thực</span>
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {user.fullName}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Tài khoản đã kích hoạt mã Gmail</span>
            </div>
          </div>

          <div className="py-2.5 space-y-2 text-slate-600 dark:text-slate-300 text-[11px]">
            <div className="flex items-start gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400">Đơn vị: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.schoolName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div>
                <span className="text-slate-400">Chức vụ: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors font-medium text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
