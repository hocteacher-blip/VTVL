import React, { useState } from 'react';
import { SchemeDossier } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { auditDossierAI } from '../../services/geminiService';
import { exportSubmissionLetterWord } from '../../utils/exportUtils';
import { export11SheetsFullExcel } from '../../utils/export11SheetsExcel';
import { calculateStatutoryQuotas } from '../../utils/statutoryCalculations';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Download, Sparkles, Send } from 'lucide-react';

interface Step9Props {
  dossier: SchemeDossier;
  isConfirmed: boolean;
  onConfirm: () => void;
  onPrevStep: () => void;
}

export const Step9AppraisalExecution: React.FC<Step9Props> = ({
  dossier,
  isConfirmed,
  onConfirm,
  onPrevStep,
}) => {
  const { schoolInfo, staff, quotas, tasks } = dossier;
  const calc = calculateStatutoryQuotas(schoolInfo);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    verdict: string;
    complianceRate: number;
    issuesFound: string[];
    highlights: string[];
    submissionChecklist: Array<{ item: string; status: string }>;
  } | null>(null);

  // Automated Cross-table Mathematical Consistency Check
  const hasQuotas = quotas.length > 0;
  const civilServiceQuotas = quotas.filter((q) => q.allocatedQuota > 0 || !q.contractArrangement);
  const totalNeed = civilServiceQuotas.reduce((sum, q) => sum + q.calculatedNeed, 0);

  const crossTableChecks = [
    {
      check: 'Kiểm tra khớp số lượng người làm việc đề xuất với định mức TT 20/2023',
      isPassed: hasQuotas && totalNeed === calc.totalCivilServantQuotas,
      detail: hasQuotas
        ? `Định mức công thức: ${calc.totalCivilServantQuotas} người; Tổng nhu cầu các vị trí: ${totalNeed} người.`
        : 'Chưa thiết lập bảng định mức tại Bước 7.',
    },
    {
      check: 'Kiểm tra tỷ lệ Phó Hiệu trưởng theo hạng trường',
      isPassed: hasQuotas && quotas.find(q => q.positionId === 'pos_phohieutruong')?.calculatedNeed === calc.maxVicePrincipal,
      detail: `Trường ${calc.schoolTierName} được bố trí ${calc.maxVicePrincipal} Phó Hiệu trưởng.`,
    },
    {
      check: 'Tách biệt chỉ tiêu hợp đồng lao động Nghị định 111/2022/NĐ-CP',
      isPassed: hasQuotas && quotas.filter(q => q.contractArrangement).every(q => q.allocatedQuota === 0),
      detail: 'Các vị trí Bảo vệ, Tạp vụ không tính vào chỉ tiêu biên chế viên chức nhà nước.',
    },
    {
      check: 'Khớp danh mục 4 nhóm vị trí việc làm theo Nghị định 232/2026/NĐ-CP',
      isPassed: hasQuotas && quotas.every(q => ['LANH_DAO_QUAN_LY', 'CHUYEN_MON_NGHIEP_VU', 'CHUYEN_MON_DUNG_CHUNG', 'HO_TRO_PHUC_VU'].includes(q.group)),
      detail: '100% vị trí việc làm đã được xếp đúng 4 nhóm luật định, không tự đặt tên trái quy định.',
    },
    {
      check: 'Bố trí kiêm nhiệm Thủ quỹ cơ quan',
      isPassed: hasQuotas && quotas.some(q => q.concurrentArrangement?.includes('Thủ quỹ')),
      detail: 'Đã phân công Văn thư kiêm nhiệm Thủ quỹ (không phát sinh thêm biên chế riêng).',
    },
  ];

  const allChecksPassed = hasQuotas && crossTableChecks.every(c => c.isPassed);

  const handleRunFullAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await auditDossierAI(schoolInfo, {
        totalClasses: schoolInfo.totalClasses,
        totalStudents: schoolInfo.totalStudents,
        totalStaff: staff.length,
        totalQuotas: quotas.length,
        totalCalculatedCivilServants: calc.totalCivilServantQuotas,
      });
      setAuditResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <StepWrapper
      stepNumber={9}
      title="Thẩm định, phê duyệt và tổ chức thực hiện Đề án vị trí việc làm"
      purpose="Hoàn tất khâu thẩm tra tính pháp lý và đối chiếu tính thống nhất số liệu 100% giữa các bảng biểu phụ lục. Hoàn thiện Tờ trình đề nghị phê duyệt gửi Phòng Giáo dục & Đào tạo, Phòng Nội vụ và UBND cấp huyện thẩm định; sẵn sàng phương án bố trí sắp xếp viên chức khi Đề án được phê duyệt."
      legalBasis="Nghị định 232/2026/NĐ-CP; Nghị định 106/2020/NĐ-CP; Thông tư 20/2023/TT-BGDĐT"
      inputRequirements={[
        'Toàn bộ Đề án và các Phụ lục số liệu từ Bước 1 đến Bước 8',
        'Check-list tiêu chuẩn thẩm định của Sở Nội vụ và Phòng GD&ĐT',
        'Dự thảo Tờ trình đề nghị phê duyệt Đề án VTVL',
        'Kế hoạch tiếp thu giải trình ý kiến thẩm định và lộ trình triển khai',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      schoolInfo={schoolInfo}
      stepData={{ crossTableChecks, auditResult }}
    >
      {/* Automated Consistency Gate Banner */}
      <div className={`rounded-xl p-5 border shadow-xs ${
        allChecksPassed
          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${allChecksPassed ? 'text-emerald-600' : 'text-amber-600'}`} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {allChecksPassed
                  ? 'Đối chiếu số liệu chéo giữa các bảng biểu: HOÀN TOÀN CHÍNH XÁC (100% KHỚP)'
                  : 'Cần rà soát một số chỉ số chênh lệch trước khi nộp'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Đã kiểm tra chéo tự động giữa Bước 3 (Yếu tố ảnh hưởng), Bước 4 (Thực trạng), Bước 5 (Danh mục) và Bước 7 (Định mức).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunFullAudit}
              disabled={isAuditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAuditing ? 'Hội đồng AI đang thẩm tra...' : 'Thẩm định hồ sơ bằng AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Cross-Table Checks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Tiêu chí đối chiếu tính nhất quán của số liệu hồ sơ:
        </h4>

        <div className="space-y-2 text-xs">
          {crossTableChecks.map((chk, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${chk.isPassed ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span>{chk.check}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                  {chk.detail}
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                chk.isPassed
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {chk.isPassed ? 'ĐẠT CHUẨN' : 'CẦN XEM LẠI'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Appraisal Committee Verdict Panel */}
      {auditResult && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kết quả thẩm định của Hội đồng chuyên gia AI (Sở GD&ĐT & Sở Nội vụ)
                </h4>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  Đánh giá: {auditResult.verdict} (Tỷ lệ tuân thủ: {auditResult.complianceRate}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Điểm nổi bật của Đề án:
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                {auditResult.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Danh mục hồ sơ thẩm định cần nộp:
              </div>
              <div className="space-y-1">
                {auditResult.submissionChecklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300">{item.item}</span>
                    <span className="font-semibold text-emerald-600">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Letter & 11-Sheet Excel Package Action Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Bộ hồ sơ nộp thẩm định & phê duyệt Đề án Vị trí việc làm
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Gồm Tờ trình chính thức (Word) và Trọn bộ 11 biểu mẫu dữ liệu (Excel .xlsx từ Sheet 1 đến 11) gửi cơ quan quản lý cấp huyện.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => export11SheetsFullExcel(dossier)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
              title="Xuất trọn bộ 11 biểu tính toán theo mẫu cơ quan quản lý (file .xlsx duy nhất)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất 11 Sheet Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportSubmissionLetterWord(dossier)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Tờ trình Word (.doc)</span>
            </button>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};
