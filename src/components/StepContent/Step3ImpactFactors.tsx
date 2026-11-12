import React from 'react';
import { ImpactFactors, SchoolLevel } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { calculateSchoolTier, calculateStatutoryQuotas } from '../../utils/statutoryCalculations';
import { School, Users, Building, Monitor, Award, HeartHandshake } from 'lucide-react';

interface Step3Props {
  schoolInfo: ImpactFactors;
  onUpdateSchoolInfo: (info: ImpactFactors) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step3ImpactFactors: React.FC<Step3Props> = ({
  schoolInfo,
  onUpdateSchoolInfo,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
}) => {
  const tierResult = calculateSchoolTier(schoolInfo);
  const quotasResult = calculateStatutoryQuotas(schoolInfo);

  const handleChange = (field: keyof ImpactFactors, value: any) => {
    onUpdateSchoolInfo({
      ...schoolInfo,
      [field]: value,
    });
  };

  return (
    <StepWrapper
      stepNumber={3}
      title="Xác định các yếu tố ảnh hưởng đến vị trí việc làm và định mức"
      purpose="Đánh giá toàn diện các yếu tố tác động trực tiếp đến số lượng và cơ cấu nhân lực: Cấp học (Tiểu học vs THCS), quy mô lớp, số học sinh, số điểm trường lẻ, hình thức tổ chức dạy học (2 buổi/ngày hay 1 buổi/ngày), mức độ chuyển đổi số và học sinh khuyết tật học hòa nhập."
      legalBasis="Điều 3, Điều 5, Điều 9 Thông tư 20/2023/TT-BGDĐT; Nghị định 232/2026/NĐ-CP"
      inputRequirements={[
        'Số liệu thống kê số lớp, số học sinh chính thức đầu năm học (trên CSDL ngành)',
        'Quyết định thành lập trường và quy định số lượng điểm trường lẻ (nếu có)',
        'Đề án/Kế hoạch dạy học 2 buổi/ngày và tổ chức bán trú được cấp có thẩm quyền phê duyệt',
        'Hồ sơ học sinh khuyết tật học hòa nhập (nếu có)',
        'Báo cáo chỉ số chuyển đổi số trường học (DTI) của đơn vị',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ schoolInfo, tierResult, quotasResult }}
    >
      {/* Tier & Quota Impact Summary Banner */}
      <div className="bg-indigo-900 text-white rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Kết quả xác định phân hạng trường theo quy định Thông tư 20/2023
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{tierResult.name}</span>
            </h3>
            <p className="text-xs text-indigo-200">
              {schoolInfo.level === 'LIEN_CAP_TH_THCS'
                ? `Trường liên cấp TH & THCS (Phân hạng theo cấp cao nhất - THCS) với quy mô tổng ${schoolInfo.totalClasses} lớp (Tiểu học: ${schoolInfo.primaryClasses || 0} lớp, THCS: ${schoolInfo.secondaryClasses || 0} lớp) tại ${schoolInfo.regionType === 'KHO_KHAN' ? 'vùng đặc biệt khó khăn' : 'vùng đồng bằng'}.`
                : `Căn cứ cấp học ${schoolInfo.level === 'THCS' ? 'THCS' : 'Tiểu học'} với quy mô ${schoolInfo.totalClasses} lớp tại địa bàn ${schoolInfo.regionType === 'KHO_KHAN' ? 'vùng đặc biệt khó khăn' : 'vùng đồng bằng/đô thị'}.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 text-center">
            <div className="bg-indigo-950/60 rounded-lg p-2.5 border border-indigo-700/50">
              <div className="text-[11px] text-indigo-300">
                {schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'Tổng GV định mức' : 'Tỷ lệ GV/lớp tối đa'}
              </div>
              <div className="text-base font-bold tabular-nums text-white mt-0.5">
                {schoolInfo.level === 'LIEN_CAP_TH_THCS'
                  ? `${quotasResult.maxTeachersTotal} GV`
                  : `${quotasResult.maxTeachersRate} GV/lớp`}
              </div>
            </div>
            <div className="bg-indigo-950/60 rounded-lg p-2.5 border border-indigo-700/50">
              <div className="text-[11px] text-indigo-300">Định mức tiết dạy</div>
              <div className="text-base font-bold tabular-nums text-white mt-0.5">
                {schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'TH: 23 / THCS: 19' : `${quotasResult.teachersTeachingLoadNorm} tiết/tuần`}
              </div>
            </div>
            <div className="bg-indigo-950/60 rounded-lg p-2.5 border border-indigo-700/50 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-indigo-300">Tối đa Phó HT</div>
              <div className="text-base font-bold tabular-nums text-white mt-0.5">
                {quotasResult.maxVicePrincipal} người
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Factor Input Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Thông số quy mô và các điều kiện tổ chức giáo dục
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tên trường */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên trường học
            </label>
            <input
              type="text"
              value={schoolInfo.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="Nhập tên trường học..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Cấp học */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cấp học (Bắt buộc phân biệt định mức)
            </label>
            <select
              value={schoolInfo.level}
              onChange={(e) => handleChange('level', e.target.value as SchoolLevel)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
            >
              <option value="TIEU_HOC">Trường Tiểu học (1.5 hoặc 1.2 GV/lớp)</option>
              <option value="THCS">Trường Trung học cơ sở (THCS - 1.9 GV/lớp)</option>
              <option value="LIEN_CAP_TH_THCS">Trường Liên cấp TH & THCS (Điều 14, 15 TT 20/2023)</option>
            </select>
          </div>

          {/* Địa bàn vùng miền */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa bàn hoạt động
            </label>
            <select
              value={schoolInfo.regionType}
              onChange={(e) => handleChange('regionType', e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="DONG_BANG">Vùng đồng bằng, phát triển bình thường</option>
              <option value="KHO_KHAN">Xã vùng đặc biệt khó khăn, hải đảo</option>
            </select>
          </div>

          {/* Breakdown for Multi-Level School */}
          {schoolInfo.level === 'LIEN_CAP_TH_THCS' ? (
            <>
              {/* Lớp Tiểu học */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                  Số lớp cấp Tiểu học (x 1.5 GV/lớp)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={schoolInfo.primaryClasses ?? 0}
                  onChange={(e) => {
                    const p = Math.max(0, parseInt(e.target.value) || 0);
                    const s = schoolInfo.secondaryClasses ?? 0;
                    onUpdateSchoolInfo({
                      ...schoolInfo,
                      primaryClasses: p,
                      totalClasses: p + s,
                    });
                  }}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-md tabular-nums font-semibold"
                />
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 block">
                  Định mức: {schoolInfo.sessionType === '2_BUOI_NGAY' ? '1.5' : '1.2'} GV/lớp ({Math.ceil((schoolInfo.primaryClasses ?? 0) * (schoolInfo.sessionType === '2_BUOI_NGAY' ? 1.5 : 1.2))} GV).
                </span>
              </div>

              {/* Lớp THCS */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                  Số lớp cấp THCS (x 1.9 GV/lớp)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={schoolInfo.secondaryClasses ?? 0}
                  onChange={(e) => {
                    const s = Math.max(0, parseInt(e.target.value) || 0);
                    const p = schoolInfo.primaryClasses ?? 0;
                    onUpdateSchoolInfo({
                      ...schoolInfo,
                      secondaryClasses: s,
                      totalClasses: p + s,
                    });
                  }}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-md tabular-nums font-semibold"
                />
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 block">
                  Định mức: 1.9 GV/lớp ({Math.ceil((schoolInfo.secondaryClasses ?? 0) * 1.9)} GV).
                </span>
              </div>

              {/* Tổng số lớp tính phân hạng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổng số lớp toàn trường (TH + THCS)
                </label>
                <input
                  type="number"
                  readOnly
                  value={schoolInfo.totalClasses}
                  className="w-full text-xs p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums font-bold text-indigo-600 dark:text-indigo-400 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Tự động cộng dồn từ 2 cấp học để tính phân hạng trường.
                </span>
              </div>

              {/* Học sinh Tiểu học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số học sinh Tiểu học
                </label>
                <input
                  type="number"
                  min={0}
                  value={schoolInfo.primaryStudents ?? 0}
                  onChange={(e) => {
                    const p = Math.max(0, parseInt(e.target.value) || 0);
                    const s = schoolInfo.secondaryStudents ?? 0;
                    onUpdateSchoolInfo({
                      ...schoolInfo,
                      primaryStudents: p,
                      totalStudents: p + s,
                    });
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums"
                />
              </div>

              {/* Học sinh THCS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số học sinh THCS
                </label>
                <input
                  type="number"
                  min={0}
                  value={schoolInfo.secondaryStudents ?? 0}
                  onChange={(e) => {
                    const s = Math.max(0, parseInt(e.target.value) || 0);
                    const p = schoolInfo.primaryStudents ?? 0;
                    onUpdateSchoolInfo({
                      ...schoolInfo,
                      secondaryStudents: s,
                      totalStudents: p + s,
                    });
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums"
                />
              </div>

              {/* Tổng số học sinh */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổng số học sinh toàn trường
                </label>
                <input
                  type="number"
                  readOnly
                  value={schoolInfo.totalStudents}
                  className="w-full text-xs p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums font-bold cursor-not-allowed"
                />
              </div>
            </>
          ) : (
            <>
              {/* Số lớp đơn cấp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổng số lớp học
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={schoolInfo.totalClasses}
                  onChange={(e) => handleChange('totalClasses', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Trường hạng 1 khi đạt từ 28 lớp trở lên (hoặc 19 lớp ở vùng khó khăn).
                </span>
              </div>

              {/* Số học sinh đơn cấp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổng số học sinh
                </label>
                <input
                  type="number"
                  min={0}
                  value={schoolInfo.totalStudents}
                  onChange={(e) => handleChange('totalStudents', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Bình quân ~{schoolInfo.totalClasses > 0 ? Math.round(schoolInfo.totalStudents / schoolInfo.totalClasses) : 0} HS/lớp.
                </span>
              </div>
            </>
          )}

          {/* Số điểm trường lẻ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số điểm trường lẻ
            </label>
            <input
              type="number"
              min={0}
              value={schoolInfo.satelliteCampuses}
              onChange={(e) => handleChange('satelliteCampuses', parseInt(e.target.value) || 0)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Nếu có từ 02 điểm trường trở lên được bổ sung thêm GV theo TT 20/2023.
            </span>
          </div>

          {/* Hình thức tổ chức dạy học */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hình thức tổ chức buổi học
            </label>
            <select
              value={schoolInfo.sessionType}
              onChange={(e) => handleChange('sessionType', e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="2_BUOI_NGAY">Dạy học 2 buổi/ngày (Định mức 1.5 GV/lớp đối với Tiểu học)</option>
              <option value="1_BUOI_NGAY">Dạy học 1 buổi/ngày (Định mức 1.2 GV/lớp đối với Tiểu học)</option>
            </select>
          </div>

          {/* Ứng dụng CNTT & CĐS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mức độ ứng dụng CNTT & Chuyển đổi số
            </label>
            <select
              value={schoolInfo.itLevel}
              onChange={(e) => handleChange('itLevel', e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="CAO">Mức cao (Trường số hóa, CSDL trực tuyến, Lab hiện đại)</option>
              <option value="KHA">Mức khá (Đầy đủ phần mềm SMAS, vnEdu, bài giảng số)</option>
              <option value="CO_BAN">Mức cơ bản (Đang từng bước triển khai)</option>
            </select>
          </div>

          {/* Học sinh khuyết tật hòa nhập */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số học sinh khuyết tật học hòa nhập
            </label>
            <input
              type="number"
              min={0}
              value={schoolInfo.inclusiveStudentCount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onUpdateSchoolInfo({
                  ...schoolInfo,
                  inclusiveStudentCount: val,
                  hasInclusiveStudents: val > 0,
                });
              }}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Từ 05 học sinh trở lên được bố trí 01 nhân viên Hỗ trợ GD người khuyết tật.
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tình hình thực hiện Chương trình GDPT 2018
            </label>
            <textarea
              rows={3}
              value={schoolInfo.curriculumStatus}
              onChange={(e) => handleChange('curriculumStatus', e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú về yêu cầu quản lý và phục vụ (bán trú, phòng bộ môn...)
            </label>
            <textarea
              rows={3}
              value={schoolInfo.managementScopeNotes}
              onChange={(e) => handleChange('managementScopeNotes', e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};
