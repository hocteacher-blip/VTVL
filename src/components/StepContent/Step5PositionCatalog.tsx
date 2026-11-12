import React, { useState } from 'react';
import { PositionItem, ImpactFactors, PositionGroup } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { Search, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';

interface Step5Props {
  positions: PositionItem[];
  onUpdatePositions: (positions: PositionItem[]) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  schoolInfo: ImpactFactors;
}

export const Step5PositionCatalog: React.FC<Step5Props> = ({
  positions,
  onUpdatePositions,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
}) => {
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState<PositionItem | null>(null);

  // Filter positions applicable to current level (TIEU_HOC vs THCS vs LIEN_CAP_TH_THCS)
  const applicablePositions = positions.filter((p) => {
    const matchLevel =
      schoolInfo.level === 'LIEN_CAP_TH_THCS' ||
      p.levelApplicable === 'BOTH' ||
      p.levelApplicable === schoolInfo.level;
    const matchGroup = filterGroup === 'ALL' || p.group === filterGroup;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.functions.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLevel && matchGroup && matchSearch;
  });

  return (
    <StepWrapper
      stepNumber={5}
      title="Xác định danh mục vị trí việc làm chuẩn hóa theo quy định"
      purpose="Xây dựng và chuẩn hóa danh mục vị trí việc làm phù hợp với cơ cấu tổ chức trường Tiểu học hoặc THCS. Nghiêm cấm việc tự ý đặt tên vị trí việc làm trái với quy định tại Thông tư 20/2023/TT-BGDĐT và Nghị định 232/2026/NĐ-CP. Với từng vị trí việc làm, xác định rõ: Tên, Mã số, Nhóm, Chức năng, Nhiệm vụ chính, Phạm vi trách nhiệm, Mối quan hệ công tác và Sản phẩm đầu ra."
      legalBasis="Điều 4 (Tiểu học) & Điều 8 (THCS) Thông tư 20/2023/TT-BGDĐT; Nghị định 232/2026/NĐ-CP"
      inputRequirements={[
        'Danh mục các nhóm công việc đã phân loại tại Bước 2',
        'Danh mục vị trí việc làm chuẩn do Bộ GD&ĐT quy định tại Thông tư 20/2023/TT-BGDĐT',
        'Quy định mã số chức danh nghề nghiệp viên chức ngành giáo dục',
        'Yêu cầu đặc thù của cấp học (Tiểu học hoặc THCS)',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ totalApplicable: applicablePositions.length, level: schoolInfo.level }}
    >
      {/* Strict Anti-Arbitrary Position Name Rule Callout */}
      <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Nguyên tắc pháp lý then chốt về Danh mục VTVL:</span>
        </div>
        <p>
          Không được tự sáng tác các tên vị trí việc làm như <i>"Tổ trưởng văn phòng"</i>, <i>"Trưởng ban thanh tra"</i>, <i>"Chủ tịch công đoàn"</i> hay <i>"Giáo viên kiêm kế toán"</i> thành vị trí việc làm độc lập. Các nhiệm vụ này là chức vụ quản lý, chức danh đoàn thể hoặc nhiệm vụ kiêm nhiệm, không phải là Vị trí việc làm theo Nghị định 232/2026/NĐ-CP.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên vị trí, mã VTVL, chức năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden"
            />
          </div>

          <div className="text-xs text-slate-500">
            Số vị trí việc làm áp dụng cho {schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'Trường liên cấp TH & THCS' : schoolInfo.level === 'THCS' ? 'cấp THCS' : 'cấp Tiểu học'}:{' '}
            <span className="font-bold tabular-nums text-slate-900 dark:text-white">
              {applicablePositions.length} vị trí
            </span>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-medium whitespace-nowrap">Nhóm vị trí:</span>
          {[
            { id: 'ALL', label: 'Tất cả 4 nhóm' },
            { id: 'LANH_DAO_QUAN_LY', label: '1. Lãnh đạo, quản lý' },
            { id: 'CHUYEN_MON_NGHIEP_VU', label: '2. Chuyên môn GD' },
            { id: 'CHUYEN_MON_DUNG_CHUNG', label: '3. Dùng chung' },
            { id: 'HO_TRO_PHUC_VU', label: '4. Hỗ trợ phục vụ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterGroup(tab.id)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterGroup === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Standardized Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applicablePositions.map((pos) => {
          return (
            <div
              key={pos.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-500 font-medium">{pos.code}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {pos.group === 'LANH_DAO_QUAN_LY'
                        ? 'Nhóm 1: Lãnh đạo'
                        : pos.group === 'CHUYEN_MON_NGHIEP_VU'
                        ? 'Nhóm 2: Chuyên môn GD'
                        : pos.group === 'CHUYEN_MON_DUNG_CHUNG'
                        ? 'Nhóm 3: Dùng chung'
                        : 'Nhóm 4: Hỗ trợ phục vụ'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {pos.name}
                  </h4>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {pos.isMandatory ? 'Bắt buộc có' : 'Theo điều kiện'}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <p>
                  <b>Chức năng:</b> {pos.functions}
                </p>
                <p>
                  <b>Phạm vi trách nhiệm:</b> {pos.responsibilitiesScope}
                </p>
                <p>
                  <b>Quan hệ công tác:</b> {pos.workRelations}
                </p>
              </div>

              {/* Key Deliverables */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sản phẩm công việc đầu ra:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pos.workProducts.map((prod, pi) => (
                    <span
                      key={pi}
                      className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700"
                    >
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Căn cứ: <span className="text-slate-600 dark:text-slate-300">{pos.legalBasis}</span>
              </div>
            </div>
          );
        })}
      </div>
    </StepWrapper>
  );
};
