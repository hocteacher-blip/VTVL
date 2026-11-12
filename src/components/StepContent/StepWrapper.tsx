import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { analyzeStepData } from '../../services/geminiService';
import { ImpactFactors } from '../../types/scheme';

interface StepWrapperProps {
  stepNumber: number;
  title: string;
  purpose: string;
  legalBasis: string;
  inputRequirements: string[];
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  schoolInfo: ImpactFactors;
  stepData: any;
  children: React.ReactNode;
}

export const StepWrapper: React.FC<StepWrapperProps> = ({
  stepNumber,
  title,
  purpose,
  legalBasis,
  inputRequirements,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
  stepData,
  children,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await analyzeStepData(stepNumber, stepData, schoolInfo);
      setAiAnalysis(res.analysis);
    } catch (err: any) {
      setAiAnalysis('Lỗi kết nối dịch vụ thẩm định: ' + (err.message || ''));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Purpose Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                BƯỚC {stepNumber}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Căn cứ: <span className="font-medium text-slate-700 dark:text-slate-300">{legalBasis}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {purpose}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Nhờ chuyên gia AI đóng vai trò cán bộ thẩm định kiểm tra tính pháp lý và số liệu bước này"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{isAnalyzing ? 'Đang thẩm tra...' : 'Chuyên gia AI Đánh giá'}</span>
            </button>
          </div>
        </div>

        {/* 2. Dữ liệu đầu vào cần chuẩn bị */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Dữ liệu & Căn cứ đầu vào cần có cho bước này:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
            {inputRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">›</span>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis Feedback Panel if triggered */}
      {aiAnalysis && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ý kiến Thẩm định & Kiến nghị của Chuyên gia:</span>
            </div>
            <button
              onClick={() => setAiAnalysis(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Đóng
            </button>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* 3. Main Step Interactive Content */}
      {children}

      {/* 4. Step Confirmation & Navigation Footer */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          {onPrevStep && stepNumber > 1 && (
            <button
              onClick={onPrevStep}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Bước {stepNumber - 1}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onConfirm}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isConfirmed
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isConfirmed ? 'Đã xác nhận kết quả Bước này (Nhấn để cập nhật)' : 'Xác nhận kết quả Bước ' + stepNumber}</span>
            </button>
          </div>
        </div>

        <div>
          {onNextStep && stepNumber < 9 && (
            <button
              onClick={onNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-lg transition-colors shadow-xs"
            >
              <span>Tiếp tục sang Bước {stepNumber + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
