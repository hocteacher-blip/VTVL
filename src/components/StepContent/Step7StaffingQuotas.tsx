import React from 'react';
import { StaffingQuotaRow, ImpactFactors } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { calculateStatutoryQuotas, generateInitialQuotas } from '../../utils/statutoryCalculations';
import { Calculator, AlertCircle, CheckCircle, Scale, FileSpreadsheet, PlusCircle } from 'lucide-react';

interface Step7Props {
  quotas: StaffingQuotaRow[];
  onUpdateQuotas: (quotas: StaffingQuotaRow[]) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  schoolInfo: ImpactFactors;
}

export const Step7StaffingQuotas: React.FC<Step7Props> = ({
  quotas,
  onUpdateQuotas,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
}) => {
  const calc = calculateStatutoryQuotas(schoolInfo);

  const handleUpdateRow = (index: number, field: keyof StaffingQuotaRow, value: any) => {
    const updated = [...quotas];
    const row = { ...updated[index], [field]: value };
    if (field === 'calculatedNeed' || field === 'allocatedQuota') {
      row.variance = row.allocatedQuota - row.calculatedNeed;
    }
    updated[index] = row;
    onUpdateQuotas(updated);
  };

  // Aggregates
  const totalCurrent = quotas.reduce((sum, q) => sum + q.currentCount, 0);
  const totalAllocated = quotas.reduce((sum, q) => sum + q.allocatedQuota, 0);
  const totalCalculatedNeed = quotas.reduce((sum, q) => sum + q.calculatedNeed, 0);

  // Civil service quota (excluding contract 111 like Bao ve, Tap vu)
  const civilServiceQuotas = quotas.filter((q) => q.allocatedQuota > 0 || !q.contractArrangement);
  const civilServiceCalculated = civilServiceQuotas.reduce((sum, q) => sum + q.calculatedNeed, 0);
  const civilServiceCurrent = civilServiceQuotas.reduce((sum, q) => sum + q.currentCount, 0);
  const civilServiceAllocated = civilServiceQuotas.reduce((sum, q) => sum + q.allocatedQuota, 0);

  const totalVariance = civilServiceAllocated - civilServiceCalculated;

  return (
    <StepWrapper
      stepNumber={7}
      title="Xác định cơ cấu và số lượng người làm việc theo định mức luật định"
      purpose="Tính toán chuẩn xác số lượng người làm việc theo từng vị trí trên cơ sở định mức biên chế Thông tư 20/2023/TT-BGDĐT. So sánh đối chiếu 3 chỉ số then chốt: (1) Số lượng hiện có thực tế; (2) Số biên chế cấp có thẩm quyền giao; (3) Nhu cầu tính toán theo định mức chuẩn. Phân tích cụ thể phương án bố trí kiêm nhiệm và hợp đồng lao động theo Nghị định 111/2022/NĐ-CP."
      legalBasis="Điều 5, Điều 9 & Điều 15 Thông tư 20/2023/TT-BGDĐT; Nghị định 232/2026/NĐ-CP; NĐ 111/2022/NĐ-CP"
      inputRequirements={[
        'Số lớp, số học sinh và số điểm trường chính thức từ Bước 3',
        'Định mức giáo viên/lớp theo cấp học (Tiểu học: 1.5 hoặc 1.2; THCS: 1.9; Liên cấp TH & THCS: tính riêng từng cấp theo Điều 15)',
        'Quyết định giao biên chế/số lượng người làm việc của UBND cấp huyện/Sở Nội vụ',
        'Bảng thống kê số người thực tế có mặt từ Bước 4',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ quotas, civilServiceCalculated, civilServiceAllocated, totalVariance }}
    >
      {/* 3-Way Core Distinction Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          Rà soát đối chiếu 3 chỉ số theo yêu cầu của Bộ Nội vụ & Bộ GD&ĐT
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400">1. Số người thực tế hiện có</div>
            <div className="text-2xl font-bold tabular-nums text-white mt-1">
              {civilServiceCurrent} <span className="text-xs text-slate-400 font-normal">viên chức</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Đang hưởng lương NSNN</div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400">2. Số biên chế cấp trên đã giao</div>
            <div className="text-2xl font-bold tabular-nums text-indigo-400 mt-1">
              {civilServiceAllocated} <span className="text-xs text-slate-400 font-normal">chỉ tiêu</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Được phê duyệt năm hiện hành</div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400">3. Nhu cầu định mức TT 20/2023</div>
            <div className="text-2xl font-bold tabular-nums text-emerald-400 mt-1">
              {civilServiceCalculated} <span className="text-xs text-slate-400 font-normal">người</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {schoolInfo.level === 'LIEN_CAP_TH_THCS'
                ? 'Định mức từng cấp TH & THCS'
                : `Tỷ lệ ${calc.maxTeachersRate} GV/lớp`}
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400">Cân đối (Giao - Nhu cầu)</div>
            <div className={`text-2xl font-bold tabular-nums mt-1 ${
              totalVariance === 0 ? 'text-emerald-400' : totalVariance > 0 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {totalVariance > 0 ? `+${totalVariance} (Dư)` : totalVariance < 0 ? `${totalVariance} (Thiếu)` : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {totalVariance < 0 ? 'Cần tuyển bổ sung' : 'Chỉ tiêu cân đối'}
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Formula Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2 shadow-xs">
        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-600" />
          <span>Công thức xác định định mức cho {schoolInfo.schoolName || 'nhà trường'}:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
          <div>
            <p>
              • <b>Cán bộ quản lý:</b> Hiệu trưởng: 01 người; Phó Hiệu trưởng:{' '}
              <b>0{calc.maxVicePrincipal} người</b> ({calc.schoolTierName}).
            </p>
            <p>
              • <b>Giáo viên:</b>{' '}
              {schoolInfo.level === 'LIEN_CAP_TH_THCS'
                ? `${schoolInfo.primaryClasses || 0} lớp TH x ${schoolInfo.sessionType === '2_BUOI_NGAY' ? '1.5' : '1.2'} + ${schoolInfo.secondaryClasses || 0} lớp THCS x 1.9 = `
                : `${schoolInfo.totalClasses} lớp x định mức ${calc.maxTeachersRate} GV/lớp = `}
              <b>{calc.maxTeachersTotal} giáo viên</b>.
            </p>
          </div>
          <div>
            <p>
              • <b>Nhân viên dùng chung:</b> Thư viện (1), Thiết bị (1), Kế toán (1), Văn thư (1).
            </p>
            <p>
              • <b>Hợp đồng theo Nghị định 111/2022/NĐ-CP:</b> Bảo vệ, Tạp vụ được ký kết theo hợp đồng lao động, <b>không tính vào chỉ tiêu biên chế sự nghiệp</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Quota Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Bảng tổng hợp xác định cơ cấu và số lượng người làm việc chi tiết
            </h3>
            <span className="text-[11px] text-slate-400">
              Đơn vị tính: Người
            </span>
          </div>

          <button
            onClick={() => onUpdateQuotas(generateInitialQuotas(schoolInfo))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tính lại bảng định mức</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 w-56">Tên vị trí việc làm</th>
                <th className="py-2.5 px-3 w-40">Nhóm vị trí</th>
                <th className="py-2.5 px-3 w-24 text-center">Hiện có</th>
                <th className="py-2.5 px-3 w-28 text-center">Biên chế giao</th>
                <th className="py-2.5 px-3 w-28 text-center">Định mức TT 20</th>
                <th className="py-2.5 px-3 w-24 text-center">Chênh lệch</th>
                <th className="py-2.5 px-3">Phương án bố trí / Kiêm nhiệm / HĐ 111</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {quotas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Chưa có bảng định mức số lượng người làm việc.
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-md">
                        {schoolInfo.totalClasses > 0
                          ? `Trường hiện có ${schoolInfo.totalClasses} lớp. Nhấn nút bên dưới để hệ thống lập bảng định mức vị trí việc làm theo Thông tư 20/2023/TT-BGDĐT.`
                          : 'Vui lòng hoàn tất nhập số lớp tại Bước 3 hoặc nhấn nút bên dưới để tạo bảng định mức.'}
                      </p>
                      <button
                        onClick={() => onUpdateQuotas(generateInitialQuotas(schoolInfo))}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                      >
                        Khởi tạo bảng định mức theo quy mô trường
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                quotas.map((q, idx) => {
                  const isContract = !!q.contractArrangement;
                  return (
                    <tr key={q.positionId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 text-center tabular-nums text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {q.positionName}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">
                        {q.group === 'LANH_DAO_QUAN_LY'
                          ? '1. Lãnh đạo'
                          : q.group === 'CHUYEN_MON_NGHIEP_VU'
                          ? '2. Chuyên môn GD'
                          : q.group === 'CHUYEN_MON_DUNG_CHUNG'
                          ? '3. Dùng chung'
                          : '4. Hỗ trợ phục vụ'}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums font-medium">
                        <input
                          type="number"
                          min={0}
                          value={q.currentCount}
                          onChange={(e) => handleUpdateRow(idx, 'currentCount', parseInt(e.target.value) || 0)}
                          className="w-14 text-center p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums">
                        <input
                          type="number"
                          min={0}
                          value={q.allocatedQuota}
                          onChange={(e) => handleUpdateRow(idx, 'allocatedQuota', parseInt(e.target.value) || 0)}
                          className="w-14 text-center p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                        <input
                          type="number"
                          min={0}
                          value={q.calculatedNeed}
                          onChange={(e) => handleUpdateRow(idx, 'calculatedNeed', parseInt(e.target.value) || 0)}
                          className="w-14 text-center p-1 bg-indigo-50/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-md font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums font-semibold">
                        {isContract ? (
                          <span className="text-slate-400 font-normal">HĐ 111</span>
                        ) : q.variance === 0 ? (
                          <span className="text-emerald-600">Đủ (0)</span>
                        ) : q.variance > 0 ? (
                          <span className="text-amber-600">+{q.variance}</span>
                        ) : (
                          <span className="text-rose-600">{q.variance}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <input
                          type="text"
                          value={q.concurrentArrangement || q.contractArrangement || q.proposalNote}
                          onChange={(e) => handleUpdateRow(idx, 'proposalNote', e.target.value)}
                          className="w-full p-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <td colSpan={3} className="py-3 px-3 text-right">
                  TỔNG SỐ LƯỢNG NGƯỜI LÀM VIỆC ĐỀ XUẤT (HƯỞNG LƯƠNG NSNN):
                </td>
                <td className="py-3 px-3 text-center tabular-nums text-sm">
                  {civilServiceCurrent}
                </td>
                <td className="py-3 px-3 text-center tabular-nums text-sm text-indigo-600">
                  {civilServiceAllocated}
                </td>
                <td className="py-3 px-3 text-center tabular-nums text-sm text-emerald-600">
                  {civilServiceCalculated}
                </td>
                <td className="py-3 px-3 text-center tabular-nums text-sm">
                  {totalVariance > 0 ? `+${totalVariance}` : totalVariance}
                </td>
                <td className="py-3 px-3 text-xs font-normal text-slate-500">
                  Chưa bao gồm {calc.maxContractStaff111} chỉ tiêu hợp đồng theo Nghị định 111/2022/NĐ-CP
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </StepWrapper>
  );
};
