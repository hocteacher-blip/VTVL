import React from 'react';
import { SchoolLevel } from '../types/scheme';
import { FileText, Download, BookOpen, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { UserProfileBadge } from './Auth/UserProfileBadge';

interface HeaderProps {
  currentLevel: SchoolLevel;
  schoolName: string;
  onSelectLevel: (level: SchoolLevel) => void;
  onOpenLegalModal: () => void;
  onExportWord: () => void;
  onExportExcel11Sheets?: () => void;
  onOpenAIAssistant: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  schoolName,
  onSelectLevel,
  onOpenLegalModal,
  onExportWord,
  onExportExcel11Sheets,
  onOpenAIAssistant,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              VTVL 9 Bước GD&ĐT
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 font-mono">
              NĐ 232/2026 & TT 20/2023
            </span>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'workflow' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Quy trình 9 bước
            </button>
            <button
              onClick={() => setActiveTab('dossier')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dossier' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Hồ sơ Đề án
            </button>
            <button
              onClick={() => setActiveTab('quotas')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'quotas' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Định mức biên chế
            </button>
            <button
              onClick={onOpenLegalModal}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Căn cứ pháp lý</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick School Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => onSelectLevel('TIEU_HOC')}
                className={`px-2 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  currentLevel === 'TIEU_HOC'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tiểu học
              </button>
              <button
                onClick={() => onSelectLevel('THCS')}
                className={`px-2 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  currentLevel === 'THCS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                THCS
              </button>
              <button
                onClick={() => onSelectLevel('LIEN_CAP_TH_THCS')}
                className={`px-2 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  currentLevel === 'LIEN_CAP_TH_THCS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Liên cấp
              </button>
            </div>

            {onExportExcel11Sheets && (
              <button
                onClick={onExportExcel11Sheets}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                title="Xuất trọn bộ 11 sheet biểu mẫu (Biểu 1 đến 11) trong 1 file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Xuất 11 Sheet Excel</span>
                <span className="md:hidden">11 Biểu</span>
              </button>
            )}

            <button
              onClick={onExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              title="Xuất hồ sơ Đề án ra file Word (.doc) theo đúng chuẩn thể thức văn bản hành chính"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Đề án Word</span>
            </button>

            {/* User Profile / Auth Status Badge */}
            <UserProfileBadge />
          </div>
        </div>
      </div>
    </header>
  );
};
