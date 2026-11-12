import React, { useState } from 'react';
import { TaskItem, TaskFrequency, TaskRole, PositionGroup, ImpactFactors } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { Plus, Trash2, Filter, Search, CheckCircle } from 'lucide-react';

interface Step1Props {
  tasks: TaskItem[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep?: () => void;
  schoolInfo: ImpactFactors;
}

export const Step1TaskInventory: React.FC<Step1Props> = ({
  tasks,
  onUpdateTasks,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
}) => {
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterFreq, setFilterFreq] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({
    department: 'Tổ Chuyên môn & Giáo viên',
    taskName: '',
    description: '',
    frequency: 'THUONG_XUYEN',
    roleType: 'CHINH',
    group: 'CHUYEN_MON_NGHIEP_VU',
    assignedTo: 'Giáo viên bộ môn',
  });

  const filteredTasks = tasks.filter((t) => {
    const matchDept = filterDept === 'ALL' || t.department === filterDept;
    const matchFreq = filterFreq === 'ALL' || t.frequency === filterFreq;
    const matchSearch =
      t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchFreq && matchSearch;
  });

  const handleAddTask = () => {
    if (!newTask.taskName?.trim()) return;
    const item: TaskItem = {
      id: 'task_' + Date.now(),
      department: newTask.department || 'Tổ Chuyên môn & Giáo viên',
      taskName: newTask.taskName.trim(),
      description: newTask.description?.trim() || '',
      frequency: newTask.frequency || 'THUONG_XUYEN',
      roleType: newTask.roleType || 'CHINH',
      group: newTask.group || 'CHUYEN_MON_NGHIEP_VU',
      assignedTo: newTask.assignedTo?.trim() || 'Giáo viên',
    };
    onUpdateTasks([...tasks, item]);
    setNewTask({
      department: 'Tổ Chuyên môn & Giáo viên',
      taskName: '',
      description: '',
      frequency: 'THUONG_XUYEN',
      roleType: 'CHINH',
      group: 'CHUYEN_MON_NGHIEP_VU',
      assignedTo: 'Giáo viên',
    });
    setIsAdding(false);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  const departments = ['ALL', 'Ban Giám hiệu', 'Tổ Chuyên môn & Giáo viên', 'Đoàn - Đội', 'Bộ phận Văn phòng', 'Hỗ trợ, phục vụ'];

  return (
    <StepWrapper
      stepNumber={1}
      title="Thống kê toàn bộ công việc nhà trường đang thực hiện"
      purpose="Rà soát toàn diện danh mục công việc thực tế phát sinh từ chức năng, nhiệm vụ của nhà trường; phân loại rành mạch theo tính chất thường xuyên, định kỳ, đột xuất, nhiệm vụ chính và nhiệm vụ kiêm nhiệm để làm căn cứ hình thành các vị trí việc làm."
      legalBasis="Điều lệ trường học (TT 28/2020/TT-BGDĐT hoặc TT 32/2020/TT-BGDĐT); Nghị định 232/2026/NĐ-CP"
      inputRequirements={[
        'Kế hoạch năm học của nhà trường và thời khóa biểu',
        'Quy chế làm việc và phân công nhiệm vụ của Ban Giám hiệu',
        'Kế hoạch hoạt động của các tổ chuyên môn và tổ văn phòng',
        'Chương trình giáo dục phổ thông 2018 đang triển khai',
        'Sổ theo dõi công tác bán trú, thư viện, y tế học đường',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ totalTasks: tasks.length, tasks }}
    >
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Tổng số công việc</div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {tasks.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Công việc thường xuyên</div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {tasks.filter((t) => t.frequency === 'THUONG_XUYEN').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Công việc định kỳ</div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {tasks.filter((t) => t.frequency === 'DINH_KY').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Nhiệm vụ kiêm nhiệm</div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {tasks.filter((t) => t.roleType === 'KIEM_NHIEM').length}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc, người phụ trách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm công việc</span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Bộ phận:</span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterDept === dept
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {dept === 'ALL' ? 'Tất cả bộ phận' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Task Form Modal/Card */}
      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 space-y-3">
          <div className="font-semibold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
            Thêm công việc mới vào danh mục thống kê
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bộ phận thực hiện
              </label>
              <select
                value={newTask.department}
                onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                <option value="Tổ Chuyên môn & Giáo viên">Tổ Chuyên môn & Giáo viên</option>
                <option value="Đoàn - Đội">Đoàn - Đội</option>
                <option value="Bộ phận Văn phòng">Bộ phận Văn phòng</option>
                <option value="Hỗ trợ, phục vụ">Hỗ trợ, phục vụ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tần suất thực hiện
              </label>
              <select
                value={newTask.frequency}
                onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value as TaskFrequency })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="THUONG_XUYEN">Thường xuyên (Hàng ngày/tuần)</option>
                <option value="DINH_KY">Định kỳ (Tháng/kỳ/năm học)</option>
                <option value="DOT_XUAT">Đột xuất (Khi có yêu cầu)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tính chất nhiệm vụ
              </label>
              <select
                value={newTask.roleType}
                onChange={(e) => setNewTask({ ...newTask, roleType: e.target.value as TaskRole })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="CHINH">Nhiệm vụ chính</option>
                <option value="KIEM_NHIEM">Nhiệm vụ kiêm nhiệm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vị trí đảm nhiệm
              </label>
              <input
                type="text"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                placeholder="VD: Giáo viên chủ nhiệm..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tên công việc / đầu việc
              </label>
              <input
                type="text"
                value={newTask.taskName}
                onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                placeholder="Tên công việc..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mô tả nội dung công việc
              </label>
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Mô tả cụ thể..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Hủy
            </button>
            <button
              onClick={handleAddTask}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Lưu công việc
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 w-40">Bộ phận</th>
                <th className="py-2.5 px-3 w-56">Tên công việc</th>
                <th className="py-2.5 px-3">Mô tả chi tiết nội dung</th>
                <th className="py-2.5 px-3 w-28 text-center">Tần suất</th>
                <th className="py-2.5 px-3 w-28 text-center">Tính chất</th>
                <th className="py-2.5 px-3 w-36">Vị trí đảm nhiệm</th>
                <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {tasks.length === 0
                          ? 'Chưa có công việc nào trong danh mục thống kê.'
                          : 'Không tìm thấy công việc nào phù hợp điều kiện tìm kiếm.'}
                      </p>
                      {tasks.length === 0 && (
                        <p className="text-[11px] text-slate-400">
                          Nhấn nút <b>"+ Thêm công việc"</b> ở trên để bắt đầu thống kê các nhiệm vụ của nhà trường.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 text-center tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                      {t.department}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {t.taskName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                      {t.description}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {t.frequency === 'THUONG_XUYEN'
                          ? 'Thường xuyên'
                          : t.frequency === 'DINH_KY'
                          ? 'Định kỳ'
                          : 'Đột xuất'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[11px] ${t.roleType === 'KIEM_NHIEM' ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                        {t.roleType === 'CHINH' ? 'Nhiệm vụ chính' : 'Kiêm nhiệm'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400 font-medium">
                      {t.assignedTo}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Xóa công việc này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StepWrapper>
  );
};
