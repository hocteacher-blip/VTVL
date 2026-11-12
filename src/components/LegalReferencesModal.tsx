import React from 'react';
import { LEGAL_DOCUMENTS } from '../data/defaultData';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalReferencesModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hệ thống Căn cứ Pháp lý & Văn bản Quy phạm Pháp luật
              </h3>
              <p className="text-xs text-slate-500">
                Quy định vị trí việc làm trường Tiểu học và THCS công lập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Legal Documents */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {LEGAL_DOCUMENTS.map((doc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 hover:border-indigo-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {doc.code}
                </span>
                <span className="text-[11px] text-slate-400">Hiệu lực: {doc.effectiveDate}</span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                {doc.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                {doc.scope}
              </p>
            </div>
          ))}

          {/* Critical statutory note */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Nguyên tắc áp dụng văn bản pháp luật:</span>
            </div>
            <p>
              1. Tuyệt đối không sử dụng các văn bản đã hết hiệu lực thi hành (ví dụ: Thông tư liên tịch số 35/2006/TTLT-BGDĐT-BNV, Thông tư 16/2017/TT-BGDĐT đã được thay thế toàn diện bởi <b>Thông tư 20/2023/TT-BGDĐT</b>).
            </p>
            <p>
              2. Không lấy định mức của cấp Tiểu học (1.5 hoặc 1.2 GV/lớp, 23 tiết/tuần) áp dụng máy móc cho THCS (1.9 GV/lớp, 19 tiết/tuần) hoặc ngược lại.
            </p>
            <p>
              3. Đối với trường phổ thông có nhiều cấp học (Tiểu học và THCS): Áp dụng <b>Chương III (Điều 14 & Điều 15) Thông tư 20/2023/TT-BGDĐT</b>: Phân hạng theo cấp học cao nhất (cấp THCS); định mức giáo viên của từng cấp tính riêng biệt theo từng cấp học; các vị trí dùng chung phục vụ toàn trường.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
