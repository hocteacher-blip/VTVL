import React, { useState } from 'react';
import { SchemeDossier } from '../../types/scheme';
import { StepWrapper } from './StepWrapper';
import { exportSchemeToWord, exportQuotasToExcel, exportSubmissionLetterWord } from '../../utils/exportUtils';
import { export11SheetsFullExcel } from '../../utils/export11SheetsExcel';
import { FileText, Download, Printer, CheckCircle2, Building, ShieldCheck, FileSpreadsheet, Layers } from 'lucide-react';
import { calculateStatutoryQuotas } from '../../utils/statutoryCalculations';

interface Step8Props {
  dossier: SchemeDossier;
  isConfirmed: boolean;
  onConfirm: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step8FullSchemeDossier: React.FC<Step8Props> = ({
  dossier,
  isConfirmed,
  onConfirm,
  onNextStep,
  onPrevStep,
}) => {
  const { schoolInfo, tasks, staff, positions, quotas, jobDescriptions } = dossier;
  const calc = calculateStatutoryQuotas(schoolInfo);
  const [activeTab, setActiveTab] = useState<'DOSS_FULL' | 'APPENDIX_QUOTAS' | 'APPENDIX_STAFF' | 'APPENDIX_11_SHEETS'>('DOSS_FULL');

  const now = new Date();
  const dateStr = `ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

  const sheetList = [
    { id: '1', code: 'A1_NhiemVu', name: 'Biểu A1_ Nhiệm vụ', desc: 'Thống kê nhiệm vụ theo chức năng, căn cứ pháp lý và chu kỳ' },
    { id: '2', code: 'A2_CongViec', name: 'Biểu A2_ Công việc', desc: 'Danh mục công việc gắn với mã VTVL, đơn vị tính và tiêu chuẩn chất lượng' },
    { id: '3', code: 'B1_KhoiLuong', name: 'Biểu B1_ Khối lượng', desc: 'Khối lượng SP/năm, định mức phút/SP và tổng quỹ giờ làm việc' },
    { id: '4', code: 'B2_CT_TacDong', name: 'Biểu B2_CT_ Tác động', desc: 'Chi tiết tác động từ chuyển đổi số, số hóa, tinh giản và kinh phí' },
    { id: '5', code: 'B2_ThayDoi', name: 'Biểu B2_ Thay đổi', desc: 'Tổng hợp giờ giảm số hóa, thuê dịch vụ và giờ tác động ròng' },
    { id: '6', code: 'C1_VTVL', name: 'Biểu C1_ Vị trí việc làm', desc: 'Danh mục vị trí, loại nhân lực, quỹ giờ chuẩn PP2 (1.904 giờ/người)' },
    { id: '7', code: 'C2_NangLuc', name: 'Biểu C2_ Mô tả năng lực', desc: 'Khung năng lực cốt lõi, chuyên môn, lãnh đạo và trách nhiệm VTVL' },
    { id: '8', code: 'C3_NhuCau', name: 'Biểu C3_ Nhu cầu', desc: 'Tổng hợp nhu cầu người làm việc theo cả 3 phương pháp (PP1, PP2, PP3)' },
    { id: '9', code: 'D1_NhanLuc', name: 'Biểu D1_ Nhân lực', desc: 'Thực trạng bố trí nhân sự, quỹ giờ dành cho VTVL và kiêm nhiệm' },
    { id: '10', code: 'D2_PhuongAn', name: 'Biểu D2_ Phương án', desc: 'Phương án điều chuyển, tuyển dụng, đào tạo và đề nghị điều chỉnh biên chế' },
    { id: '11', code: 'DM_San_Pham', name: 'Biểu_Danh mục sản phẩm', desc: 'Danh mục sản phẩm đầu ra chuẩn ngành giáo dục và định mức thời gian' },
  ];

  return (
    <StepWrapper
      stepNumber={8}
      title="Xây dựng và hoàn thiện toàn bộ Hồ sơ Đề án Vị trí việc làm"
      purpose="Tổng hợp kết quả toàn diện từ 7 bước trước đó thành bộ hồ sơ Đề án Vị trí việc làm hoàn chỉnh theo đúng thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP), sẵn sàng để Hội đồng trường thông qua và trình cấp có thẩm quyền thẩm định, phê duyệt."
      legalBasis="Điều 8 Nghị định 106/2020/NĐ-CP & Nghị định 232/2026/NĐ-CP; Thông tư 20/2023/TT-BGDĐT"
      inputRequirements={[
        'Toàn bộ kết quả đã được xác nhận từ Bước 1 đến Bước 7',
        'Biên bản họp lấy ý kiến của tập thể cán bộ, giáo viên, nhân viên',
        'Biên bản họp Hội đồng trường thông qua Đề án',
        'Bộ 11 biểu mẫu chuẩn từ Sheet 1 đến Sheet 11 (A1 -> D2 & DM sản phẩm)',
      ]}
      isConfirmed={isConfirmed}
      onConfirm={onConfirm}
      onNextStep={onNextStep}
      onPrevStep={onPrevStep}
      schoolInfo={schoolInfo}
      stepData={{ schoolName: schoolInfo.schoolName, totalCivilServants: calc.totalCivilServantQuotas }}
    >
      {/* Export Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('DOSS_FULL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'DOSS_FULL'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Đề cương Đề án chi tiết
          </button>
          <button
            onClick={() => setActiveTab('APPENDIX_11_SHEETS')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'APPENDIX_11_SHEETS'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bộ 11 Biểu Excel chuẩn</span>
          </button>
          <button
            onClick={() => setActiveTab('APPENDIX_QUOTAS')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'APPENDIX_QUOTAS'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Phụ lục số lượng & Định mức
          </button>
          <button
            onClick={() => setActiveTab('APPENDIX_STAFF')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'APPENDIX_STAFF'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Phụ lục thực trạng đội ngũ
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => export11SheetsFullExcel(dossier)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            title="Xuất trọn bộ 11 sheet (từ Biểu 1 đến Biểu 11) trong 1 file Excel .xlsx chuẩn cơ quan quản lý"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất 11 Sheet Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportSchemeToWord(dossier)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file Word (.doc)</span>
          </button>
        </div>
      </div>

      {/* 11 Sheets Overview Banner when in APPENDIX_11_SHEETS tab */}
      {activeTab === 'APPENDIX_11_SHEETS' && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Danh mục 11 Sheet biểu mẫu theo đúng mẫu hồ sơ cơ quan quản lý (Đầy đủ từ Sheet 1 đến 11)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Toàn bộ dữ liệu của 9 bước đã được ánh xạ tự động vào cấu trúc chuẩn 11 biểu tính toán theo quy định (Nghị định 232/2026/NĐ-CP & Thông tư 20/2023/TT-BGDĐT).
              </p>
            </div>
            <button
              onClick={() => export11SheetsFullExcel(dossier)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Tải file Excel 11 Sheet ngay (.xlsx)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sheetList.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Sheet {item.id}: {item.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">Chuẩn 100%</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Government Form Document Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-10 font-serif shadow-xs max-w-4xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
        {/* National Header */}
        <div className="grid grid-cols-2 text-center text-xs leading-normal">
          <div className="space-y-0.5">
            <div className="uppercase">ỦY BAN NHÂN DÂN CẤP HUYỆN</div>
            <div className="font-bold uppercase">{schoolInfo.schoolName || '[TÊN TRƯỜNG / ĐƠN VỊ]'}</div>
            <div className="font-mono text-[11px] text-slate-500">Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ĐA-VTVL</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="font-bold border-b border-slate-300 dark:border-slate-700 pb-1 inline-block">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="italic text-slate-500 text-[11px]">..., {dateStr}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pt-4">
          <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide">
            ĐỀ ÁN VỊ TRÍ VIỆC LÀM VÀ SỐ LƯỢNG NGƯỜI LÀM VIỆC
          </h1>
          <div className="text-xs sm:text-sm font-bold uppercase text-indigo-700 dark:text-indigo-400">
            {schoolInfo.schoolName || '[CHƯA NHẬP TÊN TRƯỜNG]'}
          </div>
        </div>

        {/* Outline Content */}
        <div className="text-xs leading-relaxed space-y-4 font-sans text-slate-700 dark:text-slate-300">
          {/* PHẦN I */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs mb-1">
              PHẦN I. CĂN CỨ PHÁP LÝ VÀ SỰ CẦN THIẾT XÂY DỰNG ĐỀ ÁN
            </h3>
            <p className="text-justify indent-6">
              1. Căn cứ Luật Viên chức 2010; Luật sửa đổi bổ sung năm 2019; Luật Giáo dục năm 2019.
            </p>
            <p className="text-justify indent-6">
              2. Căn cứ Nghị định số 232/2026/NĐ-CP (và Nghị định 106/2020/NĐ-CP) của Chính phủ về vị trí việc làm và số lượng người làm việc trong đơn vị sự nghiệp công lập.
            </p>
            <p className="text-justify indent-6">
              3. Căn cứ Thông tư số 20/2023/TT-BGDĐT của Bộ GD&ĐT hướng dẫn vị trí việc làm, cơ cấu viên chức và định mức số lượng người làm việc trong các cơ sở giáo dục phổ thông công lập.
            </p>
            <p className="text-justify indent-6">
              4. Căn cứ Nghị định số 111/2022/NĐ-CP của Chính phủ về hợp đồng thực hiện công việc hỗ trợ phục vụ.
            </p>
          </div>

          {/* PHẦN II */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs mb-1">
              PHẦN II. THỰC TRẠNG QUY MÔ, ĐẶC ĐIỂM VÀ ĐỘI NGŨ
            </h3>
            <p className="text-justify indent-6">
              - Cấp học: <b>{schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'Trường phổ thông có nhiều cấp học (Tiểu học & THCS)' : schoolInfo.level === 'THCS' ? 'Trung học cơ sở' : 'Tiểu học'}</b>. Phân hạng trường:{' '}
              <b>{calc.schoolTierName}</b>.
            </p>
            <p className="text-justify indent-6">
              - Quy mô lớp và học sinh: <b>{schoolInfo.totalClasses} lớp</b> {schoolInfo.level === 'LIEN_CAP_TH_THCS' && `(Cấp Tiểu học: ${schoolInfo.primaryClasses || 0} lớp, Cấp THCS: ${schoolInfo.secondaryClasses || 0} lớp)`} với <b>{schoolInfo.totalStudents} học sinh</b>.
              Số điểm trường lẻ: <b>{schoolInfo.satelliteCampuses} điểm</b>. Hình thức tổ chức: <b>{schoolInfo.sessionType === '2_BUOI_NGAY' ? 'Dạy học 2 buổi/ngày kèm bán trú' : 'Dạy học 1 buổi/ngày'}</b>.
            </p>
            <p className="text-justify indent-6">
              - Tổng số cán bộ, giáo viên, nhân viên hiện có mặt: <b>{staff.length} người</b> (Trong đó Thạc sĩ: {staff.filter(s => s.qualification === 'THAC_SI').length}, Đại học: {staff.filter(s => s.qualification === 'DAI_HOC').length}; CDNN Hạng I + II: {staff.filter(s => s.professionalTitle === 'HANG_I' || s.professionalTitle === 'HANG_II').length} người).
            </p>
          </div>

          {/* PHẦN III */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs mb-1">
              PHẦN III. XÁC ĐỊNH DANH MỤC VTVL VÀ SỐ LƯỢNG NGƯỜI LÀM VIỆC ĐỀ XUẤT
            </h3>
            <p className="text-justify indent-6">
              Căn cứ chức năng, nhiệm vụ và định mức Thông tư 20/2023/TT-BGDĐT, nhà trường xác định:
            </p>
            <div className="pl-6 space-y-1 text-slate-800 dark:text-slate-200">
              <p>• <b>Tổng số vị trí việc làm:</b> <b>{quotas.length} vị trí</b> (phân thành 4 nhóm theo quy định).</p>
              <p>• <b>Tổng số người làm việc đề xuất hưởng lương NSNN:</b> <b>{calc.totalCivilServantQuotas} người</b> (BGH: {1 + calc.maxVicePrincipal}; GV: {calc.maxTeachersTotal}; Nhân viên dùng chung: {calc.maxSharedStaff}; Y tế & hỗ trợ: {calc.maxSupportStaff}).</p>
              <p>• <b>Số chỉ tiêu hợp đồng lao động theo NĐ 111/2022/NĐ-CP:</b> <b>{calc.maxContractStaff111} người</b> (Bảo vệ: 03 người trực 24/24; Phục vụ: 02-03 người).</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div className="text-left">
              <div className="font-bold italic">Nơi nhận:</div>
              <div>- UBND cấp huyện (báo cáo);</div>
              <div>- Phòng GD&ĐT, Phòng Nội vụ (thẩm định);</div>
              <div>- Lưu: VT, BGH.</div>
            </div>
            <div>
              <div className="font-bold uppercase">HIỆU TRƯỞNG</div>
              <div className="italic text-[11px] text-slate-400 pb-12">(Ký, ghi rõ họ tên và đóng dấu)</div>
              <div className="font-bold">
                {staff.find(s => s.positionId === 'pos_hieutruong')?.fullName || '(Chưa có thông tin Hiệu trưởng)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};
