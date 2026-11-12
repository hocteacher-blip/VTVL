import React from 'react';
import { StepStatus } from '../types/scheme';
import { CheckCircle2, Circle, AlertCircle, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  steps: StepStatus[];
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  onSelectStep,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Horizontal scrollable stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((st) => {
            const isCurrent = st.step === currentStep;
            const isDone = st.isConfirmed;

            return (
              <button
                key={st.step}
                onClick={() => onSelectStep(st.step)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs'
                    : isDone
                    ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isDone ? '✓' : st.step}
                </span>

                <span className="font-semibold">{st.step}. {st.title}</span>

                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Current Step Summary Banner */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Bước {currentStep}: {steps[currentStep - 1]?.title}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-xl">
              {steps[currentStep - 1]?.purpose}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-500 dark:text-slate-400">
              Trạng thái:{' '}
              {steps[currentStep - 1]?.isConfirmed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Đã xác nhận kết quả
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Đang rà soát & hoàn thiện
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
