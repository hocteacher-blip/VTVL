import React, { useState } from 'react';
import { StaffMember, ImpactFactors, PositionGroup } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { Plus, Trash2, Search, Users, Award, GraduationCap, CheckCircle } from 'lucide-react';

interface Step4Props {
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  schoolInfo: ImpactFactors;
}

export const Step4StaffAudit: React.FC<Step4Props> = ({
  staff,
  onUpdateStaff,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
  schoolInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    fullName: '',
    positionName: schoolInfo.level === 'THCS' ? 'Giáo viên môn Toán' : 'Giáo viên tiểu học',
    positionId: 'pos_custom_' + Date.now(),
    group: 'CHUYEN_MON_NGHIEP_VU',
    qualification: 'DAI_HOC',
    professionalTitle: 'HANG_III',
    titleCode: schoolInfo.level === 'THCS' ? 'V.07.04.32' : 'V.07.03.29',
    currentTeachingLoadWeekly: schoolInfo.level === 'THCS' ? 19 : 23,
    concurrentDuty: '',
    status: 'DANG_CONG_TAC',
    competencyRating: 'TOT',
  });

  const filteredStaff = staff.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.concurrentDuty && s.concurrentDuty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchGroup = filterGroup === 'ALL' || s.group === filterGroup;
    return matchSearch && matchGroup;
  });

  const handleAddStaff = () => {
    if (!newStaff.fullName?.trim()) return;
    const member: StaffMember = {
      id: 'st_' + Date.now(),
      fullName: newStaff.fullName.trim(),
      positionName: newStaff.positionName || 'Giáo viên',
      positionId: newStaff.positionId || 'pos_custom',
      group: newStaff.group || 'CHUYEN_MON_NGHIEP_VU',
      qualification: newStaff.qualification || 'DAI_HOC',
      professionalTitle: newStaff.professionalTitle || 'HANG_III',
      titleCode: newStaff.titleCode || 'V.07.03.29',
      currentTeachingLoadWeekly: Number(newStaff.currentTeachingLoadWeekly) || 0,
      concurrentDuty: newStaff.concurrentDuty?.trim() || '',
      status: newStaff.status || 'DANG_CONG_TAC',
      competencyRating: newStaff.competencyRating || 'TOT',
    };
    onUpdateStaff([...staff, member]);
    setNewStaff({
      fullName: '',
      positionName: schoolInfo.level === 'THCS' ? 'Giáo viên môn Toán' : 'Giáo viên tiểu học',
      positionId: 'pos_custom_' + Date.now(),
      group: 'CHUYEN_MON_NGHIEP_VU',
      qualification: 'DAI_HOC',
      professionalTitle: 'HANG_III',
      titleCode: schoolInfo.level === 'THCS' ? 'V.07.04.32' : 'V.07.03.29',
      currentTeachingLoadWeekly: schoolInfo.level === 'THCS' ? 19 : 23,
      concurrentDuty: '',
      status: 'DANG_CONG_TAC',
      competencyRating: 'TOT',
    });
    setIsAdding(false);
  };

  const handleDeleteStaff = (id: string) => {
    onUpdateStaff(staff.filter((s) => s.id !== id));
  };

  // Metric aggregates
  const thacSiCount = staff.filter((s) => s.qualification === 'THAC_SI').length;
  const daiHocCount = staff.filter((s) => s.qualification === 'DAI_HOC').length;
  const hangICount = staff.filter((s) => s.professionalTitle === 'HANG_I').length;
  const hangIICount = staff.filter((s) => s.professionalTitle === 'HANG_II').length;
  const xuatSacCount = staff.filter((s) => s.competencyRating === 'XUAT_SAC').length;

  return (
    <StepWrapper
      stepNumber={4}
      title="Thống kê và đánh giá thực trạng đội ngũ cán bộ, giáo viên, nhân viên"
      purpose="Lập danh sách chi tiết thực trạng đội ngũ hiện có: số lượng, trình độ chuyên môn đào tạo, hạng chức danh nghề nghiệp (Hạng I, Hạng II, Hạng III theo TT 02/03/08/2023), nhiệm vụ kiêm nhiệm, định mức số tiết dạy và kết quả đánh giá năng lực công tác để làm căn cứ bố trí, sắp xếp theo Đề án."
      legalBasis="Nghị định 106/2020/NĐ-CP; Thông tư 02, 03, 08/2023/TT-BGDĐT; Thông tư 20/2023/TT-BGDĐT"
      inputRequirements={[
        'Hồ sơ viên chức, hợp đồng lao động và danh sách đóng BHXH của trường',
        'Văn bằng chuyên môn, chứng chỉ bồi dưỡng tiêu chuẩn CDNN của từng nhân sự',
        'Quyết định bổ nhiệm chức danh nghề nghiệp và xếp lương hiện hưởng',
        'Phân công giảng dạy, thời khóa biểu và sổ theo dõi giảm trừ tiết dạy kiêm nhiệm',
        'Kết quả đánh giá, xếp loại chất lượng viên chức năm học liền kề trước đó',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ totalStaff: staff.length, staffSummary: { thacSiCount, daiHocCount, hangICount, hangIICount, xuatSacCount } }}
    >
      {/* Real Statistical Quality Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Tổng nhân sự hiện có</div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {staff.length} người
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Trình độ Thạc sĩ</div>
          <div className="text-xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {thacSiCount} <span className="text-xs text-slate-400 font-normal">({Math.round((thacSiCount / Math.max(1, staff.length)) * 100)}%)</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">Trình độ Đại học</div>
          <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {daiHocCount} <span className="text-xs text-slate-400 font-normal">({Math.round((daiHocCount / Math.max(1, staff.length)) * 100)}%)</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-500">CDNN Hạng I + Hạng II</div>
          <div className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {hangICount + hangIICount} người
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500">Đánh giá Xuất sắc</div>
          <div className="text-xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {xuatSacCount} người
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
              placeholder="Tìm theo họ tên, bộ môn, kiêm nhiệm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhân sự</span>
            </button>
          </div>
        </div>

        {/* Group filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-medium whitespace-nowrap">Nhóm:</span>
          {['ALL', 'LANH_DAO_QUAN_LY', 'CHUYEN_MON_NGHIEP_VU', 'CHUYEN_MON_DUNG_CHUNG', 'HO_TRO_PHUC_VU'].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGroup(g)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterGroup === g
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {g === 'ALL'
                ? 'Tất cả'
                : g === 'LANH_DAO_QUAN_LY'
                ? '1. Lãnh đạo'
                : g === 'CHUYEN_MON_NGHIEP_VU'
                ? '2. Chuyên môn GD'
                : g === 'CHUYEN_MON_DUNG_CHUNG'
                ? '3. Dùng chung'
                : '4. Hỗ trợ phục vụ'}
            </button>
          ))}
        </div>
      </div>

      {/* Add Staff Inline Form */}
      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 space-y-3">
          <div className="font-semibold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
            Thêm cán bộ, giáo viên, nhân viên vào danh sách thực trạng
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={newStaff.fullName}
                onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                placeholder="Nhập họ và tên..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vị trí việc làm / Bộ môn
              </label>
              <input
                type="text"
                value={newStaff.positionName}
                onChange={(e) => setNewStaff({ ...newStaff, positionName: e.target.value })}
                placeholder="VD: Giáo viên Tiếng Anh..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Trình độ chuyên môn
              </label>
              <select
                value={newStaff.qualification}
                onChange={(e) => setNewStaff({ ...newStaff, qualification: e.target.value as any })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="THAC_SI">Thạc sĩ</option>
                <option value="DAI_HOC">Đại học sư phạm / Cử nhân</option>
                <option value="CAO_DANG">Cao đẳng</option>
                <option value="TRUNG_CAP">Trung cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hạng chức danh nghề nghiệp (CDNN)
              </label>
              <select
                value={newStaff.professionalTitle}
                onChange={(e) => setNewStaff({ ...newStaff, professionalTitle: e.target.value as any })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="HANG_I">Hạng I (Cao cấp)</option>
                <option value="HANG_II">Hạng II (Chính)</option>
                <option value="HANG_III">Hạng III</option>
                <option value="CHUA_BO_NHIEM">Chưa bổ nhiệm CDNN</option>
                <option value="HOP_DONG_111">Hợp đồng lao động NĐ 111</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Số tiết dạy thực tế/tuần
              </label>
              <input
                type="number"
                value={newStaff.currentTeachingLoadWeekly}
                onChange={(e) => setNewStaff({ ...newStaff, currentTeachingLoadWeekly: Number(e.target.value) || 0 })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nhiệm vụ kiêm nhiệm (nếu có)
              </label>
              <input
                type="text"
                value={newStaff.concurrentDuty}
                onChange={(e) => setNewStaff({ ...newStaff, concurrentDuty: e.target.value })}
                placeholder="VD: Chủ nhiệm lớp 6A, Tổ trưởng..."
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Đánh giá chất lượng năng lực
              </label>
              <select
                value={newStaff.competencyRating}
                onChange={(e) => setNewStaff({ ...newStaff, competencyRating: e.target.value as any })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="XUAT_SAC">Hoàn thành xuất sắc nhiệm vụ</option>
                <option value="TOT">Hoàn thành tốt nhiệm vụ</option>
                <option value="HOAN_THANH">Hoàn thành nhiệm vụ</option>
                <option value="CHUA_HOAN_THANH">Không hoàn thành</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nhóm vị trí
              </label>
              <select
                value={newStaff.group}
                onChange={(e) => setNewStaff({ ...newStaff, group: e.target.value as PositionGroup })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="LANH_DAO_QUAN_LY">1. Lãnh đạo quản lý</option>
                <option value="CHUYEN_MON_NGHIEP_VU">2. Chuyên môn nghiệp vụ GD</option>
                <option value="CHUYEN_MON_DUNG_CHUNG">3. Chuyên môn dùng chung</option>
                <option value="HO_TRO_PHUC_VU">4. Hỗ trợ phục vụ</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Hủy
            </button>
            <button
              onClick={handleAddStaff}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Lưu nhân sự
            </button>
          </div>
        </div>
      )}

      {/* Staff Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 w-48">Họ và tên</th>
                <th className="py-2.5 px-3 w-56">Vị trí đảm nhiệm</th>
                <th className="py-2.5 px-3 w-32 text-center">Trình độ</th>
                <th className="py-2.5 px-3 w-36 text-center">Hạng CDNN / Mã</th>
                <th className="py-2.5 px-3 w-24 text-center">Tiết dạy/tuần</th>
                <th className="py-2.5 px-3">Nhiệm vụ kiêm nhiệm</th>
                <th className="py-2.5 px-3 w-32 text-center">Đánh giá năng lực</th>
                <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {staff.length === 0
                          ? 'Chưa có nhân sự nào trong danh sách thực trạng.'
                          : 'Không tìm thấy nhân sự phù hợp điều kiện lọc.'}
                      </p>
                      {staff.length === 0 && (
                        <p className="text-[11px] text-slate-400">
                          Nhấn nút <b>"+ Thêm nhân sự"</b> để lập danh sách CBQL, giáo viên, nhân viên thực tế của trường.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 text-center tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {st.fullName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">
                    {st.positionName}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">
                      {st.qualification === 'THAC_SI'
                        ? 'Thạc sĩ'
                        : st.qualification === 'DAI_HOC'
                        ? 'Đại học'
                        : st.qualification === 'CAO_DANG'
                        ? 'Cao đẳng'
                        : 'Trung cấp'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded ${
                      st.professionalTitle === 'HANG_I'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : st.professionalTitle === 'HANG_II'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {st.professionalTitle === 'HANG_I' ? 'Hạng I' : st.professionalTitle === 'HANG_II' ? 'Hạng II' : st.professionalTitle === 'HANG_III' ? 'Hạng III' : st.professionalTitle}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums font-medium">
                    {st.currentTeachingLoadWeekly > 0 ? `${st.currentTeachingLoadWeekly} tiết` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                    {st.concurrentDuty || 'Không kiêm nhiệm'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-[11px] font-medium ${
                      st.competencyRating === 'XUAT_SAC'
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                        : st.competencyRating === 'TOT'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {st.competencyRating === 'XUAT_SAC' ? 'Xuất sắc' : st.competencyRating === 'TOT' ? 'Tốt' : 'Hoàn thành'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDeleteStaff(st.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Xóa nhân sự này"
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
