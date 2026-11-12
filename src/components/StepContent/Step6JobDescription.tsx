import React, { useState } from 'react';
import { PositionItem, JobDescriptionCard, ImpactFactors } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { generateJobDescriptionAI } from '../../services/geminiService';
import { Sparkles, Save, CheckCircle2, Award, BookOpen, Layers } from 'lucide-react';

interface Step6Props {
  positions: PositionItem[];
  jobDescriptions: Record<string, JobDescriptionCard>;
  onUpdateJobDescriptions: (descs: Record<string, JobDescriptionCard>) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  schoolInfo: ImpactFactors;
}

export const Step6JobDescription: React.FC<Step6Props> = ({
  positions,
  jobDescriptions,
  onUpdateJobDescriptions,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
}) => {
  // Filter positions applicable to current level
  const applicablePositions = positions.filter(
    (p) => schoolInfo.level === 'LIEN_CAP_TH_THCS' || p.levelApplicable === 'BOTH' || p.levelApplicable === schoolInfo.level
  );

  const [selectedPosId, setSelectedPosId] = useState<string>(
    applicablePositions[0]?.id || 'pos_hieutruong'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active position and active job description
  const activePosition = positions.find((p) => p.id === selectedPosId);
  const activeDesc = jobDescriptions[selectedPosId] || {
    positionId: selectedPosId,
    positionName: activePosition?.name || '',
    objective: `Thực hiện nhiệm vụ ${activePosition?.name} tại ${schoolInfo.schoolName || 'đơn vị trường học'}.`,
    duties: activePosition?.mainDuties || [
      'Thực hiện kế hoạch giáo dục và nhiệm vụ chuyên môn được giao.',
      'Tham gia đầy đủ các cuộc họp, bồi dưỡng chuyên môn thường xuyên.',
      'Thực hiện bảo quản tài sản, thiết bị dạy học được giao.',
    ],
    outputs: activePosition?.workProducts || [
      'Kế hoạch bài dạy / hồ sơ công việc',
      'Kết quả đánh giá người học',
      'Báo cáo định kỳ',
    ],
    criteria: [
      'Hoàn thành 100% khối lượng và tiến độ công việc',
      'Được xếp loại hoàn thành tốt nhiệm vụ trở lên',
    ],
    qualification: 'Cử nhân chuyên ngành đào tạo phù hợp hoặc chuẩn theo quy định hiện hành.',
    experienceReq: 'Đáp ứng tiêu chuẩn thời gian giữ hạng chức danh nghề nghiệp tương ứng.',
    competencies: [
      {
        name: 'Năng lực chuyên môn, nghiệp vụ sư phạm/nghiệp vụ ngành',
        level: 4,
        description: 'Vận dụng thành thạo kiến thức chuyên sâu và phương pháp giáo dục hiện đại.',
      },
      {
        name: 'Năng lực ứng dụng CNTT và chuyển đổi số',
        level: 3,
        description: 'Sử dụng thành thạo phần mềm chuyên ngành và thiết bị số.',
      },
      {
        name: 'Năng lực giao tiếp, phối hợp công tác',
        level: 4,
        description: 'Phối hợp hiệu quả với đồng nghiệp, cha mẹ học sinh và các tổ chức.',
      },
    ],
  };

  const handleUpdateActiveDesc = (field: keyof JobDescriptionCard, value: any) => {
    onUpdateJobDescriptions({
      ...jobDescriptions,
      [selectedPosId]: {
        ...activeDesc,
        [field]: value,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleGenerateWithAI = async () => {
    if (!activePosition) return;
    setIsGenerating(true);
    try {
      const generated = await generateJobDescriptionAI(
        activePosition.name,
        activePosition.group,
        schoolInfo
      );
      if (generated) {
        onUpdateJobDescriptions({
          ...jobDescriptions,
          [selectedPosId]: {
            ...generated,
            positionId: selectedPosId,
            positionName: activePosition.name,
          },
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <StepWrapper
      stepNumber={6}
      title="Xây dựng Bản mô tả công việc và Khung năng lực từng vị trí việc làm"
      purpose="Xây dựng bản mô tả chi tiết và khung năng lực từ bậc 1 đến bậc 5 cho từng vị trí việc làm, xác định rõ: Mục tiêu vị trí, Nhiệm vụ cụ thể, Sản phẩm/Kết quả đầu ra, Tiêu chí đánh giá, Yêu cầu trình độ đào tạo, Kinh nghiệm công tác và các nhóm năng lực cốt lõi."
      legalBasis="Điều 6 Nghị định 106/2020/NĐ-CP & NĐ 232/2026/NĐ-CP; Thông tư 20/2023/TT-BGDĐT"
      inputRequirements={[
        'Danh mục các vị trí việc làm đã chuẩn hóa tại Bước 5',
        'Tiêu chuẩn chức danh nghề nghiệp viên chức theo Thông tư 02, 03, 08/2023/TT-BGDĐT',
        'Khung năng lực vị trí việc làm theo quy định của Bộ Nội vụ (bậc 1 đến bậc 5)',
        'Yêu cầu đặc thù của Chương trình GDPT 2018 tại nhà trường',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ selectedPosId, activeDesc }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Side: Position Picker list */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 shadow-xs">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-2 py-1">
            Chọn vị trí việc làm ({applicablePositions.length})
          </div>
          <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
            {applicablePositions.map((p) => {
              const isSelected = p.id === selectedPosId;
              const hasCustomDesc = !!jobDescriptions[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPosId(p.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-semibold border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {hasCustomDesc && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Job Description & Competency Editor Card */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                {activePosition?.code}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Bản mô tả công việc: {activePosition?.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã lưu
                </span>
              )}

              <button
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors"
                title="Sử dụng chuyên gia AI xây dựng bản mô tả và khung năng lực chuẩn cho vị trí này"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isGenerating ? 'Đang tạo bằng AI...' : 'Tạo chuẩn bằng AI'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Mục tiêu vị trí */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. Mục tiêu của vị trí việc làm
              </label>
              <textarea
                rows={2}
                value={activeDesc.objective}
                onChange={(e) => handleUpdateActiveDesc('objective', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Nhiệm vụ cụ thể */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Các nhiệm vụ cụ thể phải thực hiện (Mỗi dòng một nhiệm vụ)
              </label>
              <textarea
                rows={4}
                value={activeDesc.duties.join('\n')}
                onChange={(e) =>
                  handleUpdateActiveDesc(
                    'duties',
                    e.target.value.split('\n').filter((l) => l.trim())
                  )
                }
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
              />
            </div>

            {/* Kết quả đầu ra và Tiêu chí đánh giá */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  3. Sản phẩm / Kết quả đầu ra chính
                </label>
                <textarea
                  rows={3}
                  value={activeDesc.outputs.join('\n')}
                  onChange={(e) =>
                    handleUpdateActiveDesc(
                      'outputs',
                      e.target.value.split('\n').filter((l) => l.trim())
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  4. Tiêu chí đánh giá mức độ hoàn thành
                </label>
                <textarea
                  rows={3}
                  value={activeDesc.criteria.join('\n')}
                  onChange={(e) =>
                    handleUpdateActiveDesc(
                      'criteria',
                      e.target.value.split('\n').filter((l) => l.trim())
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Yêu cầu trình độ & kinh nghiệm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  5. Yêu cầu trình độ chuyên môn, bằng cấp đào tạo
                </label>
                <input
                  type="text"
                  value={activeDesc.qualification}
                  onChange={(e) => handleUpdateActiveDesc('qualification', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  6. Yêu cầu kinh nghiệm công tác
                </label>
                <input
                  type="text"
                  value={activeDesc.experienceReq || ''}
                  onChange={(e) => handleUpdateActiveDesc('experienceReq', e.target.value)}
                  placeholder="Kinh nghiệm giữ chức danh..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Khung năng lực (Bậc 1-5) */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                7. Khung năng lực theo chuẩn vị trí việc làm (Thang đo 5 bậc)
              </label>
              <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {activeDesc.competencies.map((comp, ci) => (
                  <div key={ci} className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {comp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {comp.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400">Cấp độ yêu cầu:</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold tabular-nums">
                        Bậc {comp.level}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};
