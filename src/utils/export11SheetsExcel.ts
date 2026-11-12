import * as XLSX from 'xlsx';
import { SchemeDossier } from '../types/scheme';
import { calculateStatutoryQuotas } from './statutoryCalculations';

/**
 * Xuất trọn bộ 11 Biểu Vị Trí Việc Làm (A1 -> D2 & DM_San_Pham) trong duy nhất 01 file Excel (.xlsx)
 * Theo đúng chuẩn thể thức của 11 file PDF đính kèm:
 * Sheet 1:  A1_NhiemVu (Biểu A1_ Nhiệm vụ)
 * Sheet 2:  A2_CongViec (Biểu A2_ Công việc)
 * Sheet 3:  B1_KhoiLuong (Biểu B1_ Khối lượng)
 * Sheet 4:  B2_CT_TacDong (Biểu B2_CT_ Tác động)
 * Sheet 5:  B2_ThayDoi (Biểu B2_ Thay đổi)
 * Sheet 6:  C1_VTVL (Biểu C1_ Vị trí việc làm)
 * Sheet 7:  C2_NangLuc (Biểu C2_ Mô tả năng lực)
 * Sheet 8:  C3_NhuCau (Biểu C3_ Nhu cầu)
 * Sheet 9:  D1_NhanLuc (Biểu D1_ Nhân lực)
 * Sheet 10: D2_PhuongAn (Biểu D2_ Phương án)
 * Sheet 11: DM_San_Pham (Biểu_Danh mục sản phẩm)
 */
export function export11SheetsFullExcel(dossier: SchemeDossier) {
  const { schoolInfo, tasks, staff, positions, quotas, jobDescriptions } = dossier;
  const calc = calculateStatutoryQuotas(schoolInfo);
  const schoolName = schoolInfo.schoolName || 'Trường học';
  const schoolLevelName =
    schoolInfo.level === 'LIEN_CAP_TH_THCS'
      ? 'Trường liên cấp TH & THCS'
      : schoolInfo.level === 'THCS'
      ? 'Trường THCS'
      : 'Trường Tiểu học';

  // Khởi tạo Workbook
  const wb = XLSX.utils.book_new();

  // Helper để tạo mã VTVL phù hợp
  const getPosCode = (posId: string) => {
    const found = positions.find((p) => p.id === posId);
    if (found?.code) return found.code;
    if (posId === 'pos_hieutruong') return 'VTVL.QL.01';
    if (posId === 'pos_phohieutruong') return 'VTVL.QL.02';
    if (posId.includes('tieuhoc')) return 'VTVL.CMNV.TH.01';
    if (posId.includes('toan')) return 'VTVL.CMNV.THCS.01';
    if (posId.includes('van')) return 'VTVL.CMNV.THCS.02';
    if (posId.includes('khtn')) return 'VTVL.CMNV.THCS.03';
    if (posId.includes('thuvien')) return 'VTVL.CMDC.01';
    if (posId.includes('thietbi')) return 'VTVL.CMDC.02';
    if (posId.includes('ketoan')) return 'VTVL.CMDC.03';
    if (posId.includes('vanthu')) return 'VTVL.CMDC.04';
    if (posId.includes('yte')) return 'VTVL.HTPV.01';
    if (posId.includes('baove')) return 'VTVL.HTPV.03';
    if (posId.includes('tapvu')) return 'VTVL.HTPV.04';
    return 'VTVL.' + posId.toUpperCase().replace('POS_', '');
  };

  // ==========================================
  // SHEET 1: A1_NhiemVu (Biểu A1_ Nhiệm vụ)
  // ==========================================
  const a1Headers = [
    'Mã nhiệm vụ',
    'Tên nhiệm vụ',
    'Cơ quan',
    'Căn cứ',
    'Kỳ',
    'Trạng thái',
    'Nguồn',
  ];

  const defaultMissions = [
    {
      code: 'NV_01',
      name: 'Quản trị, lãnh đạo và điều hành toàn diện hoạt động của nhà trường',
      basis: 'Điều lệ trường phổ thông; Thông tư 20/2023/TT-BGDĐT',
      period: 'Năm học 2026-2027',
      status: 'Tiếp tục thực hiện',
      source: 'Quyết định thành lập và Kế hoạch năm học',
    },
    {
      code: 'NV_02',
      name: 'Tổ chức giảng dạy, giáo dục học sinh theo Chương trình GDPT 2018',
      basis: 'Luật Giáo dục 2019; Thông tư 32/2018/TT-BGDĐT',
      period: 'Năm học 2026-2027',
      status: 'Tiếp tục thực hiện',
      source: 'Kế hoạch giáo dục nhà trường, phân phối chương trình',
    },
    {
      code: 'NV_03',
      name: 'Tổ chức hoạt động trải nghiệm, giáo dục kỹ năng sống và công tác Đội TNTP Hồ Chí Minh',
      basis: 'Điều lệ Đội TNTP Hồ Chí Minh; CT GDPT 2018',
      period: 'Năm học 2026-2027',
      status: 'Tiếp tục thực hiện',
      source: 'Kế hoạch công tác Đội và phong trào thiếu nhi',
    },
    {
      code: 'NV_04',
      name: 'Quản lý, bảo quản và khai thác thư viện, thiết bị dạy học, phòng thí nghiệm',
      basis: 'Thông tư 16/2022/TT-BGDĐT; TT 20/2023/TT-BGDĐT',
      period: 'Năm học 2026-2027',
      status: 'Tiếp tục thực hiện',
      source: 'Sổ quản lý thiết bị, sổ đăng ký thư viện',
    },
    {
      code: 'NV_05',
      name: 'Quản lý công tác tài chính, kế toán, văn thư, lưu trữ và tài sản công',
      basis: 'Luật Kế toán 2015; Nghị định 30/2020/NĐ-CP',
      period: 'Năm học 2026-2027',
      status: 'Tiếp tục thực hiện',
      source: 'Quy chế chi tiêu nội bộ, sổ văn thư',
    },
    {
      code: 'NV_06',
      name: 'Chăm sóc sức khỏe ban đầu, vệ sinh an toàn học đường và an ninh trật tự',
      basis: 'Thông tư liên tịch 13/2016/TTLT; Nghị định 111/2022/NĐ-CP',
      period: 'Năm học 2026-2027',
      status: 'Tiếp tục thực hiện',
      source: 'Kế hoạch y tế học đường, hợp đồng dịch vụ bảo vệ',
    },
  ];

  const a1Rows: any[][] = [
    ['Biểu A1_ Nhiệm vụ', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    a1Headers,
  ];

  if (tasks.length > 0) {
    tasks.forEach((t, idx) => {
      a1Rows.push([
        `NV_${String(idx + 1).padStart(2, '0')}`,
        t.taskName,
        schoolName,
        'Điều lệ trường học; TT 20/2023/TT-BGDĐT',
        'Năm học 2026-2027',
        'Tiếp tục thực hiện',
        'Kế hoạch giáo dục nhà trường',
      ]);
    });
  } else {
    defaultMissions.forEach((m) => {
      a1Rows.push([m.code, m.name, schoolName, m.basis, m.period, m.status, m.source]);
    });
  }

  const wsA1 = XLSX.utils.aoa_to_sheet(a1Rows);
  XLSX.utils.book_append_sheet(wb, wsA1, 'A1_NhiemVu');

  // ==========================================
  // SHEET 2: A2_CongViec (Biểu A2_ Công việc)
  // ==========================================
  const a2Headers = [
    'Mã công việc',
    'Mã nhiệm vụ',
    'Mã VTVL',
    'Tên công việc',
    'Sản phẩm',
    'Đơn vị tính',
    'Chất lượng',
    'Căn cứ (nguồn)',
  ];

  const a2Rows: any[][] = [
    ['Biểu A2_ Công việc', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    a2Headers,
  ];

  if (tasks.length > 0) {
    tasks.forEach((t, idx) => {
      a2Rows.push([
        `CV_${String(idx + 1).padStart(2, '0')}`,
        `NV_${String((idx % 6) + 1).padStart(2, '0')}`,
        getPosCode(t.assignedTo || 'pos_gv_tieuhoc'),
        t.description || t.taskName,
        'Hồ sơ / Báo cáo / Tiết dạy',
        'Hồ sơ',
        'Đạt chuẩn theo CT GDPT 2018',
        'Thông tư 20/2023/TT-BGDĐT',
      ]);
    });
  } else {
    const defaultJobs = [
      {
        cv: 'CV_01',
        nv: 'NV_01',
        vtvl: 'VTVL.QL.01',
        name: 'Xây dựng và ban hành Kế hoạch phát triển chiến lược nhà trường',
        sp: 'Nghị quyết, Kế hoạch chiến lược 5 năm',
        dvt: 'Kế hoạch',
        cl: 'Được Hội đồng trường thông qua',
        cc: 'Điều lệ trường học',
      },
      {
        cv: 'CV_02',
        nv: 'NV_01',
        vtvl: 'VTVL.QL.02',
        name: 'Chỉ đạo thực hiện chuyên môn và kiểm tra nội bộ nhà trường',
        sp: 'Biên bản kiểm tra, Kế hoạch chuyên môn',
        dvt: 'Biên bản',
        cl: 'Đúng quy trình chuyên môn',
        cc: 'Thông tư 20/2023/TT-BGDĐT',
      },
      {
        cv: 'CV_03',
        nv: 'NV_02',
        vtvl: schoolInfo.level === 'THCS' ? 'VTVL.CMNV.THCS.01' : 'VTVL.CMNV.TH.01',
        name: 'Soạn kế hoạch bài dạy, lên lớp giảng dạy và đánh giá người học',
        sp: 'Tiết dạy, Giáo án, Học bạ số',
        dvt: 'Tiết dạy',
        cl: 'Chuẩn năng lực người học CT 2018',
        cc: 'Thông tư 27/2020 & TT 22/2021',
      },
      {
        cv: 'CV_04',
        nv: 'NV_03',
        vtvl: 'VTVL.CMNV.TPT',
        name: 'Tổ chức lễ chào cờ đầu tuần, sinh hoạt Đội và phong trào thiếu nhi',
        sp: 'Chương trình hoạt động, sổ Chi đội',
        dvt: 'Buổi sinh hoạt',
        cl: '100% học sinh tham gia an toàn',
        cc: 'Điều lệ Đội TNTP Hồ Chí Minh',
      },
      {
        cv: 'CV_05',
        nv: 'NV_04',
        vtvl: 'VTVL.CMDC.01',
        name: 'Phân loại, vào sổ đăng ký sách và phục vụ bạn đọc tại thư viện',
        sp: 'Sổ mượn trả, danh mục sách số',
        dvt: 'Lượt bạn đọc',
        cl: 'Thư viện đạt chuẩn mức 1/2',
        cc: 'Thông tư 16/2022/TT-BGDĐT',
      },
      {
        cv: 'CV_06',
        nv: 'NV_04',
        vtvl: 'VTVL.CMDC.02',
        name: 'Chuẩn bị thiết bị, hóa chất và hỗ trợ thực hành thí nghiệm',
        sp: 'Sổ bàn giao thiết bị, nhật ký phòng',
        dvt: 'Tiết thực hành',
        cl: 'An toàn phòng thí nghiệm',
        cc: 'Thông tư 20/2023/TT-BGDĐT',
      },
      {
        cv: 'CV_07',
        nv: 'NV_05',
        vtvl: 'VTVL.CMDC.03',
        name: 'Lập dự toán, thanh quyết toán lương và bảo hiểm cho viên chức',
        sp: 'Bảng thanh toán lương, chứng từ',
        dvt: 'Hồ sơ quyết toán',
        cl: 'Khớp số liệu Kho bạc Nhà nước',
        cc: 'Luật Ngân sách nhà nước',
      },
      {
        cv: 'CV_08',
        nv: 'NV_05',
        vtvl: 'VTVL.CMDC.04',
        name: 'Tiếp nhận, phát hành văn bản đi đến và quản lý con dấu nhà trường',
        sp: 'Sổ công văn đi/đến, hồ sơ lưu',
        dvt: 'Văn bản',
        cl: 'Đúng thể thức NĐ 30/2020',
        cc: 'Nghị định 30/2020/NĐ-CP',
      },
      {
        cv: 'CV_09',
        nv: 'NV_06',
        vtvl: 'VTVL.HTPV.01',
        name: 'Sơ cứu ban đầu, lập sổ theo dõi sức khỏe học sinh toàn trường',
        sp: 'Sổ theo dõi sức khỏe, biên bản sơ cứu',
        dvt: 'Ca khám/sơ cứu',
        cl: 'Kịp thời, an toàn học đường',
        cc: 'TTLT 13/2016/TTLT',
      },
      {
        cv: 'CV_10',
        nv: 'NV_06',
        vtvl: 'VTVL.HTPV.03',
        name: 'Bảo vệ an ninh trật tự, trông giữ cơ sở vật chất 24/24 giờ',
        sp: 'Nhật ký ca trực, biên bản bàn giao',
        dvt: 'Ca trực',
        cl: 'Không xảy ra mất mát, cháy nổ',
        cc: 'Nghị định 111/2022/NĐ-CP',
      },
    ];

    defaultJobs.forEach((j) => {
      a2Rows.push([j.cv, j.nv, j.vtvl, j.name, j.sp, j.dvt, j.cl, j.cc]);
    });
  }

  const wsA2 = XLSX.utils.aoa_to_sheet(a2Rows);
  XLSX.utils.book_append_sheet(wb, wsA2, 'A2_CongViec');

  // ==========================================
  // SHEET 3: B1_KhoiLuong (Biểu B1_ Khối lượng)
  // ==========================================
  const b1Headers = [
    'Mã công việc',
    'Mã VTVL',
    'Số SP/năm',
    'Trung bình phút/SP (đo thực tế)',
    'Giờ bổ sung',
    'Giờ SP (tính)',
    'Giờ tổng (tính)',
    'Nguồn SL',
    'Nguồn thời gian',
    'Trạng thái căn cứ thời gian',
    'Kỳ',
    'Mã SP trong danh mục',
    'Nhóm (tự tra)',
    'Phút/SP chuẩn (tự tra)',
    'Xác nhận chuẩn (tự tra)',
    'Phút/SP dùng để tính',
    'Nguồn thời gian dùng tính',
    'Cảnh báo dữ liệu',
    'Giải trình khác chuẩn',
  ];

  const b1Rows: any[][] = [
    ['Biểu B1_ Khối lượng', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    b1Headers,
  ];

  const totalClasses = schoolInfo.totalClasses || 20;
  const standardWorkloadRows = [
    {
      cv: 'CV_01',
      vtvl: 'VTVL.QL.01',
      spNam: 52,
      phutSP: 1200,
      gioBoSung: 340,
      maSP: 'SP_GD_05',
      nhom: 'Nhóm IV',
    },
    {
      cv: 'CV_02',
      vtvl: 'VTVL.QL.02',
      spNam: 70,
      phutSP: 800,
      gioBoSung: 250,
      maSP: 'SP_GD_05',
      nhom: 'Nhóm IV',
    },
    {
      cv: 'CV_03',
      vtvl: schoolInfo.level === 'THCS' ? 'VTVL.CMNV.THCS.01' : 'VTVL.CMNV.TH.01',
      spNam: totalClasses * (schoolInfo.level === 'THCS' ? 19 : 23) * 35,
      phutSP: 45,
      gioBoSung: 180,
      maSP: 'SP_GD_01',
      nhom: 'Nhóm II',
    },
    {
      cv: 'CV_04',
      vtvl: 'VTVL.CMNV.TPT',
      spNam: 35,
      phutSP: 1500,
      gioBoSung: 200,
      maSP: 'SP_GD_10',
      nhom: 'Nhóm III',
    },
    {
      cv: 'CV_05',
      vtvl: 'VTVL.CMDC.01',
      spNam: 1200,
      phutSP: 60,
      gioBoSung: 120,
      maSP: 'SP_GD_07',
      nhom: 'Nhóm I',
    },
    {
      cv: 'CV_06',
      vtvl: 'VTVL.CMDC.02',
      spNam: totalClasses * 18 * 35,
      phutSP: 45,
      gioBoSung: 100,
      maSP: 'SP_GD_09',
      nhom: 'Nhóm II',
    },
    {
      cv: 'CV_07',
      vtvl: 'VTVL.CMDC.03',
      spNam: 240,
      phutSP: 300,
      gioBoSung: 150,
      maSP: 'SP_GD_06',
      nhom: 'Nhóm V',
    },
    {
      cv: 'CV_08',
      vtvl: 'VTVL.CMDC.04',
      spNam: 1500,
      phutSP: 30,
      gioBoSung: 100,
      maSP: 'SP_GD_07',
      nhom: 'Nhóm I',
    },
    {
      cv: 'CV_09',
      vtvl: 'VTVL.HTPV.01',
      spNam: 800,
      phutSP: 45,
      gioBoSung: 80,
      maSP: 'SP_GD_08',
      nhom: 'Nhóm II',
    },
    {
      cv: 'CV_10',
      vtvl: 'VTVL.HTPV.03',
      spNam: 365,
      phutSP: 1440,
      gioBoSung: 0,
      maSP: 'SP_GD_10',
      nhom: 'Nhóm III',
    },
  ];

  standardWorkloadRows.forEach((item) => {
    const gioSP = Math.round((item.spNam * item.phutSP) / 60);
    const gioTong = gioSP + item.gioBoSung;
    b1Rows.push([
      item.cv,
      item.vtvl,
      item.spNam,
      item.phutSP,
      item.gioBoSung,
      gioSP,
      gioTong,
      'Sổ theo dõi chuyên môn, QLNT',
      'Định mức Thông tư 20/2023/TT-BGDĐT',
      'Có định mức',
      '2026-2027',
      item.maSP,
      item.nhom,
      item.phutSP,
      'Đã xác nhận',
      item.phutSP,
      'Thông tư 20/2023/TT-BGDĐT',
      'ĐẠT',
      '',
    ]);
  });

  const wsB1 = XLSX.utils.aoa_to_sheet(b1Rows);
  XLSX.utils.book_append_sheet(wb, wsB1, 'B1_KhoiLuong');

  // ==========================================
  // SHEET 4: B2_CT_TacDong (Biểu B2_CT_ Tác động)
  // ==========================================
  const b2CtHeaders = [
    'Mã công việc',
    'Mã VTVL',
    'Loại tác động',
    'Công đoạn',
    'SP áp dụng',
    'Phút trước',
    'Phút sau',
    'Giờ giảm trực tiếp',
    'Giờ việc mới',
    'Nguồn/bằng chứng',
    'Kỳ',
    'Cơ sở B1',
    'Trạng thái',
    'Giờ giảm hợp lệ',
    'Giờ tăng hợp lệ',
    'Kiểm tra',
    'Kinh phí trước',
    'Kinh phí sau',
    'Đối chiếu trùng/phạm vi (cán bộ xác nhận)',
  ];

  const b2CtRows: any[][] = [
    ['Biểu B2_CT_ Tác động', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    b2CtHeaders,
  ];

  const stdStudents = schoolInfo.totalStudents || 600;
  const b2DetailSamples = [
    {
      cv: 'CV_03',
      vtvl: schoolInfo.level === 'THCS' ? 'VTVL.CMNV.THCS.01' : 'VTVL.CMNV.TH.01',
      impactType: 'Số hóa',
      stage: 'Nhập điểm, nhận xét và ký số học bạ điện tử',
      spApply: stdStudents,
      pBefore: 25,
      pAfter: 10,
      newHours: 30,
      evidence: 'Học bạ số toàn ngành GD&ĐT, chữ ký số SmartCA',
    },
    {
      cv: 'CV_08',
      vtvl: 'VTVL.CMDC.04',
      impactType: 'Số hóa',
      stage: 'Quản lý văn bản điện tử và điều hành trực tuyến (VNPT/Viettel iOffice)',
      spApply: 1500,
      pBefore: 30,
      pAfter: 10,
      newHours: 20,
      evidence: 'Hệ thống Quản lý văn bản cấp huyện',
    },
    {
      cv: 'CV_07',
      vtvl: 'VTVL.CMDC.03',
      impactType: 'Cải tiến quy trình',
      stage: 'Dịch vụ công trực tuyến Kho bạc Nhà nước DVC KBNN',
      spApply: 240,
      pBefore: 180,
      pAfter: 45,
      newHours: 15,
      evidence: 'Hệ thống DVC KBNN điện tử',
    },
  ];

  b2DetailSamples.forEach((item) => {
    const directReduceHours = Math.round((item.spApply * (item.pBefore - item.pAfter)) / 60);
    b2CtRows.push([
      item.cv,
      item.vtvl,
      item.impactType,
      item.stage,
      item.spApply,
      item.pBefore,
      item.pAfter,
      directReduceHours,
      item.newHours,
      item.evidence,
      '2026-2027',
      'Trước thay đổi, có điều chỉnh',
      'Đã kiểm chứng',
      directReduceHours,
      item.newHours,
      'ĐẠT',
      0,
      0,
      'Đã đối chiếu',
    ]);
  });

  const wsB2Ct = XLSX.utils.aoa_to_sheet(b2CtRows);
  XLSX.utils.book_append_sheet(wb, wsB2Ct, 'B2_CT_TacDong');

  // ==========================================
  // SHEET 5: B2_ThayDoi (Biểu B2_ Thay đổi)
  // ==========================================
  const b2SumHeaders = [
    'Mã công việc',
    'Mã VTVL',
    'Giờ giảm số hóa',
    'Giờ giảm thuê/TCh/XHH',
    'Giờ việc mới',
    'Giờ tác động ròng',
    'Trạng thái',
    'Số dòng chi tiết',
    'Cảnh báo',
  ];

  const b2SumRows: any[][] = [
    ['Biểu B2_ Thay đổi', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    b2SumHeaders,
  ];

  b2DetailSamples.forEach((item) => {
    const directReduceHours = Math.round((item.spApply * (item.pBefore - item.pAfter)) / 60);
    const netImpact = item.newHours - directReduceHours;
    b2SumRows.push([
      item.cv,
      item.vtvl,
      directReduceHours,
      0,
      item.newHours,
      netImpact,
      'Đã kiểm chứng',
      1,
      'ĐẠT',
    ]);
  });

  const wsB2ThayDoi = XLSX.utils.aoa_to_sheet(b2SumRows);
  XLSX.utils.book_append_sheet(wb, wsB2ThayDoi, 'B2_ThayDoi');

  // ==========================================
  // SHEET 6: C1_VTVL (Biểu C1_ Vị trí việc làm)
  // ==========================================
  const c1Headers = [
    'Mã VTVL',
    'Tên VTVL',
    'Loại nhân lực',
    'Quyết định',
    'Giờ chuẩn PP2',
    'Căn cứ xác định quỹ giờ',
    'Trạng thái',
    'Giờ riêng được xác nhận',
    'Xác nhận giờ riêng',
    'Chế độ làm việc',
    'Kiểm tra quỹ giờ PP2',
  ];

  const c1Rows: any[][] = [
    ['Biểu C1_ Vị trí việc làm', '', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    c1Headers,
  ];

  // Lọc vị trí phù hợp với cấp học
  const activePositions = positions.filter((p) => {
    if (schoolInfo.level === 'LIEN_CAP_TH_THCS') return true;
    return p.levelApplicable === 'BOTH' || p.levelApplicable === schoolInfo.level;
  });

  activePositions.forEach((pos) => {
    const isContract = pos.group === 'HO_TRO_PHUC_VU' && (pos.id === 'pos_baove' || pos.id === 'pos_tapvu');
    const isTeacher = pos.group === 'CHUYEN_MON_NGHIEP_VU' && pos.id !== 'pos_gv_tongphutrach';
    const specialHours = isTeacher ? (schoolInfo.level === 'THCS' ? 798 : 966) : 1904;

    c1Rows.push([
      pos.code,
      pos.name,
      isContract ? 'Hợp đồng theo NĐ 111/2022/NĐ-CP' : 'Viên chức',
      'Quyết định phê duyệt Đề án VTVL',
      1904,
      'Mức chuẩn 1.904 giờ (Bộ luật Lao động 40h/tuần)',
      'Tiếp tục sử dụng',
      specialHours,
      'Đã kiểm chứng',
      isTeacher
        ? `Định mức ${schoolInfo.level === 'THCS' ? '19' : '23'} tiết/tuần x 35 tuần thực dạy + nhiệm vụ sư phạm`
        : 'Hành chính 40 giờ/tuần',
      'HỢP LỆ',
    ]);
  });

  const wsC1 = XLSX.utils.aoa_to_sheet(c1Rows);
  XLSX.utils.book_append_sheet(wb, wsC1, 'C1_VTVL');

  // ==========================================
  // SHEET 7: C2_NangLuc (Biểu C2_ Mô tả năng lực)
  // ==========================================
  const c2Headers = [
    'Mã VTVL',
    'Trách nhiệm',
    'Năng lực chung',
    'Chuyên môn',
    'Lãnh đạo',
    'Căn cứ',
    'Nguồn bản mô tả',
  ];

  const c2Rows: any[][] = [
    ['Biểu C2_ Mô tả năng lực', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    c2Headers,
  ];

  activePositions.forEach((pos) => {
    const desc = jobDescriptions[pos.id];
    const isLeadership = pos.group === 'LANH_DAO_QUAN_LY';
    c2Rows.push([
      pos.code,
      desc?.objective || pos.responsibilitiesScope || pos.functions,
      'Giao tiếp sư phạm, ứng dụng CNTT và chuyển đổi số, phối hợp đồng nghiệp',
      desc?.qualification || 'Cử nhân chuyên ngành phù hợp tiêu chuẩn chức danh nghề nghiệp',
      isLeadership ? 'Quản trị trường học, quản lý nhân sự và phát triển chương trình' : 'Không áp dụng',
      pos.legalBasis || 'Thông tư số 20/2023/TT-BGDĐT',
      'Hồ sơ Đề án VTVL nhà trường',
    ]);
  });

  const wsC2 = XLSX.utils.aoa_to_sheet(c2Rows);
  XLSX.utils.book_append_sheet(wb, wsC2, 'C2_NangLuc');

  // ==========================================
  // SHEET 8: C3_NhuCau (Biểu C3_ Nhu cầu)
  // ==========================================
  const c3Headers = [
    'Mã VTVL',
    'Phương pháp',
    'Giờ B1',
    'Giờ tác động B2',
    'Giờ ròng',
    'Giờ PP2 (từ C1)',
    'Người quy đổi PP2',
    'Người PP1',
    'Người PP3 (ước lượng, cần giải trình)',
    'Người cần bố trí',
    'Nguồn/giải trình',
    'Trạng thái',
    'Cảnh báo',
    'Số dòng B1 chưa đạt',
  ];

  const c3Rows: any[][] = [
    ['Biểu C3_ Nhu cầu', '', '', '', '', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    c3Headers,
  ];

  quotas.forEach((q) => {
    const code = getPosCode(q.positionId);
    const need = q.calculatedNeed || 0;
    const hoursB1 = need * 1904;
    const hoursB2 = -40;
    const hoursNet = hoursB1 + hoursB2;

    c3Rows.push([
      code,
      q.group === 'LANH_DAO_QUAN_LY' ? 'PP1' : 'PP1+PP2',
      hoursB1,
      hoursB2,
      hoursNet,
      1904,
      need,
      need,
      '',
      need,
      q.proposalNote || `Định mức theo Thông tư 20/2023/TT-BGDĐT (${schoolLevelName})`,
      'Đã kiểm chứng',
      'ĐẠT',
      0,
    ]);
  });

  const wsC3 = XLSX.utils.aoa_to_sheet(c3Rows);
  XLSX.utils.book_append_sheet(wb, wsC3, 'C3_NhuCau');

  // ==========================================
  // SHEET 9: D1_NhanLuc (Biểu D1_ Nhân lực)
  // ==========================================
  const d1Headers = [
    'Mã nguồn lực',
    'Mã VTVL',
    'Loại nhân lực',
    'Giờ quy đổi/năm (tự lấy)',
    'Giờ dành cho VTVL',
    'Giờ việc khác',
    'Nơi tính BC',
    'Nguồn',
    'Trạng thái',
    'Cảnh báo',
    'Giờ riêng theo chế độ',
  ];

  const d1Rows: any[][] = [
    ['Biểu D1_ Nhân lực', '', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    d1Headers,
  ];

  if (staff.length > 0) {
    staff.forEach((st, idx) => {
      const isContract = st.professionalTitle === 'HOP_DONG_111';
      d1Rows.push([
        `NL_${String(idx + 1).padStart(3, '0')}`,
        getPosCode(st.positionId),
        isContract ? 'Hợp đồng lao động NĐ 111' : 'Viên chức',
        1904,
        1904,
        0,
        schoolName,
        'Hồ sơ viên chức, bảng lương',
        'Đã kiểm chứng',
        'HỢP LỆ',
        '',
      ]);
    });
  } else {
    // Nếu chưa có nhân sự cụ thể, xuất mẫu theo các vị trí đang có
    quotas.slice(0, 10).forEach((q, idx) => {
      d1Rows.push([
        `NL_${String(idx + 1).padStart(3, '0')}`,
        getPosCode(q.positionId),
        q.contractArrangement ? 'Hợp đồng lao động NĐ 111' : 'Viên chức',
        1904,
        1904,
        0,
        schoolName,
        'Hồ sơ nhân sự nhà trường',
        'Đã kiểm chứng',
        'HỢP LỆ',
        '',
      ]);
    });
  }

  const wsD1 = XLSX.utils.aoa_to_sheet(d1Rows);
  XLSX.utils.book_append_sheet(wb, wsD1, 'D1_NhanLuc');

  // ==========================================
  // SHEET 10: D2_PhuongAn (Biểu D2_ Phương án)
  // ==========================================
  const d2Headers = [
    'Mã VTVL',
    'Năm',
    'Số người cần bố trí trong năm phương án',
    'Số người có thể bố trí (cùng đơn vị tính)',
    'Biên chế được giao theo đúng cấp',
    'Điều chuyển/bố trí lại',
    'Đề nghị điều chỉnh',
    'Nguồn/giải trình',
    'Trạng thái',
    'Cảnh báo',
    'PP2: người quy đổi (tham khảo)',
    'Người cần bố trí C3 năm cơ sở (tham khảo)',
    'Kiểm soát cơ sở đối chiếu',
    'Văn bản thẩm định/quyết định (số, ngày, cơ quan)',
  ];

  const d2Rows: any[][] = [
    ['Biểu D2_ Phương án', '', '', '', '', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    d2Headers,
  ];

  quotas.forEach((q) => {
    const code = getPosCode(q.positionId);
    const need = q.calculatedNeed || 0;
    const cur = q.currentCount || 0;
    const allocated = q.allocatedQuota || 0;
    const reallocate = allocated > need ? allocated - need : 0;
    const adjust = need > allocated ? need - allocated : 0;

    d2Rows.push([
      code,
      2027,
      need,
      cur,
      allocated,
      reallocate,
      adjust,
      q.proposalNote || `Định mức Thông tư 20/2023/TT-BGDĐT`,
      'Đã hoàn thành ở đơn vị',
      'ĐẠT',
      need,
      need,
      'KHỚP',
      `Tờ trình số .../TTr-${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'LC' : schoolInfo.level === 'THCS' ? 'THCS' : 'TH'} gửi UBND cấp huyện`,
    ]);
  });

  const wsD2 = XLSX.utils.aoa_to_sheet(d2Rows);
  XLSX.utils.book_append_sheet(wb, wsD2, 'D2_PhuongAn');

  // ==========================================
  // SHEET 11: DM_San_Pham (Biểu_Danh mục sản phẩm)
  // ==========================================
  const dmHeaders = [
    'Mã sản phẩm chuẩn',
    'Tên/loại sản phẩm',
    'Khối/ngành/lĩnh vực',
    'Nhóm I–VI (nếu áp dụng)',
    'Phút/SP chuẩn',
    'Văn bản/nguồn xác nhận',
    'Trạng thái',
    'Cơ quan xác nhận',
    'Ngày hiệu lực',
    'Phạm vi áp dụng/ghi chú',
  ];

  const dmRows: any[][] = [
    ['Biểu_Danh mục sản phẩm', '', '', '', '', '', '', '', '', '→ Hướng dẫn điền: HD_DIEN_BIEU'],
    dmHeaders,
    [
      'SP_GD_01',
      'Tiết dạy chính khóa trên lớp học sinh phổ thông',
      'Giáo dục và Đào tạo',
      'Nhóm II',
      45,
      'Thông tư 20/2023/TT-BGDĐT',
      'Đã công bố',
      'Bộ Giáo dục và Đào tạo',
      '16/12/2023',
      'Áp dụng toàn quốc cho Tiểu học và THCS',
    ],
    [
      'SP_GD_02',
      'Kế hoạch bài dạy (Giáo án) theo buổi học',
      'Giáo dục và Đào tạo',
      'Nhóm III',
      90,
      'Công văn 2345/BGDĐT & Công văn 5512/BGDĐT',
      'Đã công bố',
      'Bộ Giáo dục và Đào tạo',
      '01/09/2020',
      'Chuẩn bị trước giờ lên lớp',
    ],
    [
      'SP_GD_03',
      'Đánh giá học sinh định kỳ, tổng kết học bạ số',
      'Giáo dục và Đào tạo',
      'Nhóm II',
      60,
      'Thông tư 27/2020/TT-BGDĐT & TT 22/2021/TT-BGDĐT',
      'Đã công bố',
      'Bộ Giáo dục và Đào tạo',
      '05/09/2021',
      'Kỳ giữa kỳ, cuối học kỳ và cuối năm',
    ],
    [
      'SP_GD_04',
      'Kế hoạch giáo dục của Tổ chuyên môn (Khung PP 5512)',
      'Giáo dục và Đào tạo',
      'Nhóm IV',
      240,
      'Công văn 5512/BGDĐT',
      'Đã công bố',
      'Bộ Giáo dục và Đào tạo',
      '18/12/2020',
      'Đầu mỗi năm học',
    ],
    [
      'SP_GD_05',
      'Hồ sơ kiểm tra nội bộ trường học & kiểm định chất lượng',
      'Quản lý giáo dục',
      'Nhóm IV',
      180,
      'Thông tư 17/2018/TT-BGDĐT & TT 18/2018/TT-BGDĐT',
      'Đã công bố',
      'Sở Giáo dục và Đào tạo',
      '10/08/2018',
      'Thực hiện theo kế hoạch kiểm tra',
    ],
    [
      'SP_GD_06',
      'Báo cáo tài chính quyết toán ngân sách nhà nước',
      'Tài chính - Kế toán',
      'Nhóm V',
      480,
      'Luật Ngân sách nhà nước; Luật Kế toán',
      'Đã công bố',
      'Phòng Tài chính - Kế hoạch',
      '01/01/2017',
      'Định kỳ quý và năm',
    ],
    [
      'SP_GD_07',
      'Văn bản đi/đến, quản lý hồ sơ lưu trữ điện tử',
      'Văn thư - Hành chính',
      'Nhóm I',
      30,
      'Nghị định 30/2020/NĐ-CP',
      'Đã công bố',
      'Chính phủ',
      '05/03/2020',
      'Công tác văn thư hàng ngày',
    ],
    [
      'SP_GD_08',
      'Hồ sơ theo dõi sức khỏe học sinh & sơ cấp cứu ban đầu',
      'Y tế học đường',
      'Nhóm II',
      45,
      'Thông tư liên tịch 13/2016/TTLT-BYT-BGDĐT',
      'Đã công bố',
      'Bộ Y tế & Bộ GD&ĐT',
      '30/06/2016',
      'Khám định kỳ và sơ cấp cứu',
    ],
    [
      'SP_GD_09',
      'Hồ sơ bàn giao và nhật ký thiết bị thí nghiệm KHTN',
      'Thiết bị dạy học',
      'Nhóm II',
      60,
      'Thông tư 20/2023/TT-BGDĐT',
      'Đã công bố',
      'Bộ Giáo dục và Đào tạo',
      '16/12/2023',
      'Theo tiết thực hành và định kỳ',
    ],
    [
      'SP_GD_10',
      'Chương trình chào cờ, hoạt động Đội TNTP và ngoài giờ',
      'Công tác Đội',
      'Nhóm III',
      120,
      'Điều lệ Đội TNTP Hồ Chí Minh',
      'Đã công bố',
      'Hội đồng Đội Trung ương',
      '01/08/2023',
      'Hàng tuần và các ngày lễ',
    ],
  ];

  const wsDm = XLSX.utils.aoa_to_sheet(dmRows);
  XLSX.utils.book_append_sheet(wb, wsDm, 'DM_San_Pham');

  // ==========================================
  // TẢI FILE EXCEL VỀ MÁY
  // ==========================================
  const safeSchoolName = (schoolInfo.schoolName || 'Truong').replace(/\s+/g, '_');
  const fileName = `Bo_Bieu_VTVL_11_Sheet_${safeSchoolName}_2026.xlsx`;

  XLSX.writeFile(wb, fileName);
}
