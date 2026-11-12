import React, { useState } from 'react';
import { TaskItem, PositionGroup, ImpactFactors } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { Layers, Shield, BookOpen, Wrench, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface Step2Props {
  tasks: TaskItem[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  schoolInfo: ImpactFactors;
}

export const Step2TaskGrouping: React.FC<Step2Props> = ({
  tasks,
  onUpdateTasks,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
}) => {
  const [activeGroup, setActiveGroup] = useState<PositionGroup>('LANH_DAO_QUAN_LY');

  const groups: Array<{
    id: PositionGroup;
    title: string;
    icon: React.ReactNode;
    desc: string;
    regulatoryBasis: string;
    sampleRoles: string;
  }> = [
    {
      id: 'LANH_DAO_QUAN_LY',
      title: '1. Nhóm Lãnh đạo, quản lý',
      icon: <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      desc: 'Công việc chỉ đạo, điều hành, định hướng chiến lược, quản trị nhân sự, tài chính và kiểm tra toàn diện trường học.',
      regulatoryBasis: 'Khoản 1 Điều 4 (Tiểu học) & Điều 8 (THCS) TT 20/2023/TT-BGDĐT; Nghị định 232/2026/NĐ-CP',
      sampleRoles: 'Hiệu trưởng, Phó Hiệu trưởng',
    },
    {
      id: 'CHUYEN_MON_NGHIEP_VU',
      title: '2. Nhóm Chuyên môn, nghiệp vụ giáo dục',
      icon: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      desc: 'Trực tiếp thực hiện các hoạt động giảng dạy, giáo dục đạo đức, chủ nhiệm lớp, phát triển chương trình và công tác Đội TNTP.',
      regulatoryBasis: 'Khoản 1 Điều 4 & Điều 8 TT 20/2023/TT-BGDĐT; Thông tư 02, 03, 08/2023/TT-BGDĐT',
      sampleRoles: schoolInfo.level === 'LIEN_CAP_TH_THCS'
        ? 'GV Tiểu học (nhiều môn/chủ nhiệm), GV môn THCS (Toán, Văn, KHTN, Lịch sử - Địa lí, Ngoại ngữ,...), TPT Đội'
        : schoolInfo.level === 'THCS'
        ? 'GV Toán, Ngữ văn, KHTN, Lịch sử - Địa lí, Ngoại ngữ, TPT Đội...'
        : 'GV Tiểu học (nhiều môn/chủ nhiệm), Tiếng Anh, Tin học, Mĩ thuật, Âm nhạc, GDTC, TPT Đội',
    },
    {
      id: 'CHUYEN_MON_DUNG_CHUNG',
      title: '3. Nhóm Chuyên môn dùng chung',
      icon: <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      desc: 'Công việc kỹ thuật, quản lý học liệu, hạ tầng thông tin, tài chính công và hành chính văn phòng dùng chung cho toàn trường.',
      regulatoryBasis: 'Khoản 2 Điều 4 & Khoản 2 Điều 8 TT 20/2023/TT-BGDĐT',
      sampleRoles: 'Thư viện viên, Thiết bị thí nghiệm, Kế toán viên, Văn thư viên, CNTT',
    },
    {
      id: 'HO_TRO_PHUC_VU',
      title: '4. Nhóm Hỗ trợ, phục vụ',
      icon: <HeartHandshake className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      desc: 'Chăm sóc sức khỏe y tế học sinh, hỗ trợ khuyết tật, bảo vệ an ninh trật tự cơ sở và công tác tạp vụ phục vụ vệ sinh trường học.',
      regulatoryBasis: 'Khoản 3 Điều 4 & Khoản 3 Điều 8 TT 20/2023/TT-BGDĐT; Nghị định 111/2022/NĐ-CP',
      sampleRoles: 'Y tế học đường, Hỗ trợ GD người khuyết tật, Bảo vệ (HĐ 111), Tạp vụ (HĐ 111)',
    },
  ];

  const handleGroupChange = (taskId: string, newGroup: PositionGroup) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, group: newGroup } : t));
    onUpdateTasks(updated);
  };

  const tasksInActiveGroup = tasks.filter((t) => t.group === activeGroup);

  return (
    <StepWrapper
      stepNumber={2}
      title="Phân nhóm công việc theo tính chất và phân tích mối quan hệ"
      purpose="Phân loại chính xác các đầu việc vào 4 nhóm công việc theo luật định (Lãnh đạo quản lý, Chuyên môn nghiệp vụ, Chuyên môn dùng chung, Hỗ trợ phục vụ). Đồng thời phân tích mối quan hệ tương hỗ giữa các nhóm, kiên quyết loại trừ trùng lặp hoặc bỏ sót nhiệm vụ."
      legalBasis="Nghị định 232/2026/NĐ-CP (hoặc NĐ 106/2020); Điều 4 & Điều 8 Thông tư 20/2023/TT-BGDĐT"
      inputRequirements={[
        'Danh mục công việc đã thống kê đầy đủ tại Bước 1',
        'Cơ cấu tổ chức bộ máy của nhà trường theo Điều lệ',
        'Quy chế phân công nhiệm vụ và phối hợp công tác nội bộ',
        'Nguyên tắc phân nhóm công việc của Bộ Nội vụ và Bộ GD&ĐT',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ activeGroup, groupCounts: groups.map(g => ({ group: g.id, count: tasks.filter(t => t.group === g.id).length })) }}
    >
      {/* 4 Group Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((grp) => {
          const count = tasks.filter((t) => t.group === grp.id).length;
          const isActive = activeGroup === grp.id;
          return (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">{grp.icon}</div>
                <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                  {count} việc
                </span>
              </div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white mt-2">
                {grp.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {grp.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Group Details & Relationship Analysis */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Chi tiết nhóm công việc
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {groups.find((g) => g.id === activeGroup)?.title}
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            Căn cứ pháp lý: <span className="font-medium text-slate-700 dark:text-slate-300">{groups.find((g) => g.id === activeGroup)?.regulatoryBasis}</span>
          </div>
        </div>

        {/* Anti-Overlap Matrix Analysis Callout */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3.5 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
          <div className="font-semibold text-slate-900 dark:text-white">
            Rà soát ranh giới trách nhiệm và chống trùng lặp / bỏ sót nhiệm vụ:
          </div>
          <p>
            - <b>Không trùng lặp:</b> Công việc quản lý chuyên môn của Ban giám hiệu (chỉ đạo, duyệt kế hoạch) tách bạch với công việc chuyên môn trực tiếp của Giáo viên (soạn bài, giảng dạy, chấm điểm).
          </p>
          <p>
            - <b>Trách nhiệm dùng chung:</b> Viên chức Thiết bị thí nghiệm chuẩn bị dụng cụ, hóa chất an toàn; Giáo viên bộ môn chịu trách nhiệm nội dung bài học và quản lý học sinh trong giờ thực hành.
          </p>
          <p>
            - <b>Hỗ trợ phục vụ:</b> Vị trí Bảo vệ và Phục vụ thực hiện theo Hợp đồng Nghị định 111/2022/NĐ-CP; tách biệt với viên chức Y tế học đường (chăm sóc y tế chuyên môn).
          </p>
        </div>

        {/* Tasks Assigned in this group */}
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
            Danh sách các công việc đã gán vào nhóm này ({tasksInActiveGroup.length} việc):
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {tasksInActiveGroup.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {tasks.length === 0
                  ? 'Chưa có công việc nào trong danh mục. Hãy bắt đầu thống kê công việc ở Bước 1.'
                  : 'Chưa có công việc nào thuộc nhóm này.'}
              </div>
            ) : (
              tasksInActiveGroup.map((task, i) => (
                <div key={task.id} className="p-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {i + 1}. {task.taskName}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {task.assignedTo}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-[11px]">Chuyển nhóm:</span>
                    <select
                      value={task.group}
                      onChange={(e) => handleGroupChange(task.id, e.target.value as PositionGroup)}
                      className="text-xs p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                    >
                      <option value="LANH_DAO_QUAN_LY">1. Lãnh đạo, quản lý</option>
                      <option value="CHUYEN_MON_NGHIEP_VU">2. Chuyên môn nghiệp vụ</option>
                      <option value="CHUYEN_MON_DUNG_CHUNG">3. Chuyên môn dùng chung</option>
                      <option value="HO_TRO_PHUC_VU">4. Hỗ trợ phục vụ</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};
