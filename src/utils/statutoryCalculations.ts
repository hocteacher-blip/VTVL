import { ImpactFactors, StaffingQuotaRow } from '../types/scheme';

export interface CalculationResult {
  schoolTier: 'HANG_1' | 'HANG_2' | 'HANG_3';
  schoolTierName: string;
  maxPrincipal: number;
  maxVicePrincipal: number;
  maxTeachersRate: number; // Tỷ lệ GV/lớp (ví dụ 1.5 hoặc 1.9)
  maxTeachersTotal: number; // Tổng số GV tối đa được duyệt
  teachersTeachingLoadNorm: number; // Định mức tiết dạy/tuần (Tiểu học: 23, THCS: 19)
  maxSharedStaff: number; // Chuyên môn dùng chung
  maxSupportStaff: number; // Hỗ trợ phục vụ biên chế
  maxContractStaff111: number; // Hợp đồng NĐ 111 (Bảo vệ, Tạp vụ)
  totalCivilServantQuotas: number; // Tổng số lượng người làm việc hưởng lương NSNN
  legalNotes: string[];
}

export function calculateSchoolTier(info: ImpactFactors): { tier: 'HANG_1' | 'HANG_2' | 'HANG_3'; name: string } {
  const isDifficult = info.regionType === 'KHO_KHAN';
  const c = info.totalClasses;

  if (isDifficult) {
    if (c >= 19) return { tier: 'HANG_1', name: 'Trường Hạng 1 (Vùng khó khăn, từ 19 lớp trở lên)' };
    if (c >= 12) return { tier: 'HANG_2', name: 'Trường Hạng 2 (Vùng khó khăn, từ 12-18 lớp)' };
    return { tier: 'HANG_3', name: 'Trường Hạng 3 (Vùng khó khăn, dưới 12 lớp)' };
  } else {
    if (c >= 28) return { tier: 'HANG_1', name: 'Trường Hạng 1 (Vùng đồng bằng, từ 28 lớp trở lên)' };
    if (c >= 18) return { tier: 'HANG_2', name: 'Trường Hạng 2 (Vùng đồng bằng, từ 18-27 lớp)' };
    return { tier: 'HANG_3', name: 'Trường Hạng 3 (Vùng đồng bằng, dưới 18 lớp)' };
  }
}

export function calculateStatutoryQuotas(info: ImpactFactors): CalculationResult {
  const { tier, name } = calculateSchoolTier(info);
  const legalNotes: string[] = [];

  // 1. Cán bộ quản lý
  const maxPrincipal = 1;
  let maxVicePrincipal = 1;

  if (info.level === 'LIEN_CAP_TH_THCS') {
    if (info.totalClasses >= 30) {
      maxVicePrincipal = 3;
      legalNotes.push('Trường phổ thông có nhiều cấp học có từ 30 lớp trở lên được bố trí tối đa 03 Phó Hiệu trưởng (Khoản 2 Điều 15 TT 20/2023/TT-BGDĐT).');
    } else if (tier === 'HANG_1' || tier === 'HANG_2' || info.totalClasses >= 12) {
      maxVicePrincipal = 2;
      legalNotes.push('Trường phổ thông có nhiều cấp học có dưới 30 lớp được bố trí tối đa 02 Phó Hiệu trưởng để phụ trách từng cấp học (Khoản 2 Điều 15 TT 20/2023).');
    } else {
      maxVicePrincipal = 1;
    }
  } else if (tier === 'HANG_1') {
    maxVicePrincipal = 2;
  }

  if (info.satelliteCampuses >= 5) {
    maxVicePrincipal += 1;
    legalNotes.push('Trường có từ 05 điểm trường trở lên được bố trí thêm 01 Phó Hiệu trưởng (Khoản 1 Điều 4, 8 & 15 TT 20/2023).');
  }

  // 2. Giáo viên & Định mức tiết dạy
  let maxTeachersRate = 1.5;
  let teachersTeachingLoadNorm = 23;
  let maxTeachersTotal = 0;

  if (info.level === 'LIEN_CAP_TH_THCS') {
    teachersTeachingLoadNorm = 21; // Mức quy chuẩn trung bình (TH: 23 tiết, THCS: 19 tiết)
    const pClasses = info.primaryClasses ?? Math.round(info.totalClasses / 2);
    const sClasses = info.secondaryClasses ?? Math.max(0, info.totalClasses - pClasses);
    const pRate = info.sessionType === '2_BUOI_NGAY' ? 1.5 : 1.2;
    const sRate = 1.9;

    const pTeachers = Math.round(pClasses * pRate * 10) / 10;
    const sTeachers = Math.round(sClasses * sRate * 10) / 10;
    let extraSatellite = 0;
    if (info.satelliteCampuses >= 2) {
      extraSatellite = info.satelliteCampuses;
      legalNotes.push(`Được bố trí thêm tối đa ${extraSatellite} giáo viên cho các điểm trường lẻ.`);
    }
    maxTeachersTotal = Math.ceil(pTeachers + sTeachers + extraSatellite);
    maxTeachersRate = info.totalClasses > 0
      ? Number(((pClasses * pRate + sClasses * sRate) / info.totalClasses).toFixed(2))
      : 1.7;

    legalNotes.push(
      `Trường liên cấp TH & THCS: Định mức giáo viên từng cấp tính riêng theo Điều 15 TT 20/2023 (${pClasses} lớp TH x ${pRate} GV/lớp = ${Math.ceil(pTeachers)} GV; ${sClasses} lớp THCS x ${sRate} GV/lớp = ${Math.ceil(sTeachers)} GV).`
    );
  } else if (info.level === 'TIEU_HOC') {
    teachersTeachingLoadNorm = 23;
    if (info.sessionType === '2_BUOI_NGAY') {
      maxTeachersRate = 1.5;
      legalNotes.push('Tiểu học học 2 buổi/ngày: Định mức tối đa 1.5 giáo viên/lớp (Khoản 1 Điều 5 TT 20/2023/TT-BGDĐT).');
    } else {
      maxTeachersRate = 1.2;
      legalNotes.push('Tiểu học học 1 buổi/ngày: Định mức tối đa 1.2 giáo viên/lớp (Khoản 1 Điều 5 TT 20/2023/TT-BGDĐT).');
    }
    // Base calculation
    const baseTeachers = Math.round(info.totalClasses * maxTeachersRate * 10) / 10;
    let extraSatellite = 0;
    if (info.satelliteCampuses >= 2) {
      extraSatellite = info.satelliteCampuses;
      legalNotes.push(`Được bố trí thêm tối đa ${extraSatellite} giáo viên cho ${extraSatellite} điểm trường (Khoản 1 Điều 5 TT 20/2023).`);
    }
    maxTeachersTotal = Math.ceil(baseTeachers + extraSatellite);
  } else {
    // THCS
    teachersTeachingLoadNorm = 19;
    maxTeachersRate = 1.9;
    legalNotes.push('Cấp THCS: Định mức tối đa 1.9 giáo viên/lớp (Khoản 1 Điều 9 TT 20/2023/TT-BGDĐT).');

    const baseTeachers = Math.round(info.totalClasses * maxTeachersRate * 10) / 10;
    let extraSatellite = 0;
    if (info.satelliteCampuses >= 2) {
      extraSatellite = info.satelliteCampuses;
      legalNotes.push(`Được bố trí thêm tối đa ${extraSatellite} giáo viên cho các điểm trường lẻ.`);
    }
    maxTeachersTotal = Math.ceil(baseTeachers + extraSatellite);
  }

  // 3. Nhân viên chuyên môn dùng chung
  // Thư viện: 1, Thiết bị: 1 (hoặc 2 nếu THCS hạng 1 lớn), Kế toán: 1, Văn thư: 1, CNTT: 1 (hạng 1) hoặc 0 (kiêm nhiệm)
  let maxSharedStaff = 4; // Thư viện, Thiết bị, Kế toán, Văn thư
  if ((info.level === 'THCS' || info.level === 'LIEN_CAP_TH_THCS') && tier === 'HANG_1' && info.totalClasses >= 40) {
    maxSharedStaff += 1; // 02 thiết bị
    legalNotes.push('Trường có cấp THCS hạng 1 có từ 40 lớp trở lên được bố trí tối đa 02 người làm Thiết bị thí nghiệm.');
  }
  if (tier === 'HANG_1' && info.itLevel === 'CAO') {
    maxSharedStaff += 1; // 01 CNTT chuyên trách
    legalNotes.push('Trường hạng 1 đẩy mạnh chuyển đổi số được xem xét bố trí 01 nhân viên Công nghệ thông tin chuyên trách.');
  }

  // 4. Hỗ trợ phục vụ biên chế viên chức
  let maxSupportStaff = 1; // Y tế học đường
  if (info.hasInclusiveStudents && info.inclusiveStudentCount >= 5) {
    maxSupportStaff += 1; // Hỗ trợ GD người khuyết tật
    legalNotes.push(`Có ${info.inclusiveStudentCount} học sinh khuyết tật học hòa nhập (>= 5 HS): Được bố trí 01 người Hỗ trợ GD người khuyết tật (Điều 4 & 8 TT 20/2023).`);
  }

  // 5. Hợp đồng lao động Nghị định 111/2022/NĐ-CP (Bảo vệ, Tạp vụ)
  let maxContractStaff111 = tier === 'HANG_1' ? 6 : 4; // 3 bảo vệ (3 ca 24/24) + 3 phục vụ (hoặc 2+2)
  legalNotes.push('Vị trí Bảo vệ và Phục vụ thực hiện theo hình thức Hợp đồng lao động theo Nghị định 111/2022/NĐ-CP, không tính vào chỉ tiêu biên chế viên chức nhà nước.');

  const totalCivilServantQuotas = maxPrincipal + maxVicePrincipal + maxTeachersTotal + maxSharedStaff + maxSupportStaff;

  return {
    schoolTier: tier,
    schoolTierName: name,
    maxPrincipal,
    maxVicePrincipal,
    maxTeachersRate,
    maxTeachersTotal,
    teachersTeachingLoadNorm,
    maxSharedStaff,
    maxSupportStaff,
    maxContractStaff111,
    totalCivilServantQuotas,
    legalNotes,
  };
}

export function generateInitialQuotas(info: ImpactFactors): StaffingQuotaRow[] {
  if (!info.totalClasses || info.totalClasses <= 0) {
    return [];
  }

  const calc = calculateStatutoryQuotas(info);

  if (info.level === 'LIEN_CAP_TH_THCS') {
    const pClasses = info.primaryClasses ?? Math.round(info.totalClasses / 2);
    const sClasses = info.secondaryClasses ?? Math.max(0, info.totalClasses - pClasses);
    return [
      {
        positionId: 'pos_hieutruong',
        positionName: 'Hiệu trưởng',
        group: 'LANH_DAO_QUAN_LY',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 người đứng đầu đơn vị trường liên cấp.',
      },
      {
        positionId: 'pos_phohieutruong',
        positionName: 'Phó Hiệu trưởng',
        group: 'LANH_DAO_QUAN_LY',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.maxVicePrincipal,
        variance: 0,
        proposalNote: `Định mức ${calc.maxVicePrincipal} Phó Hiệu trưởng (bố trí phụ trách từng cấp học TH và THCS).`,
      },
      // Giáo viên Tiểu học
      {
        positionId: 'pos_gv_tieuhoc',
        positionName: 'Giáo viên tiểu học (dạy nhiều môn / Chủ nhiệm)',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: pClasses,
        variance: 0,
        proposalNote: `Đảm bảo mỗi lớp tiểu học (${pClasses} lớp) có 01 GV chủ nhiệm và dạy các môn chung.`,
      },
      {
        positionId: 'pos_gv_tienganh_th',
        positionName: 'Giáo viên Tiếng Anh tiểu học',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(pClasses * 0.15)),
        variance: 0,
        proposalNote: 'Dạy Tiếng Anh cấp tiểu học theo CT GDPT 2018.',
      },
      {
        positionId: 'pos_gv_tinhoc_th',
        positionName: 'Giáo viên Tin học & Công nghệ tiểu học',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(pClasses * 0.1)),
        variance: 0,
        proposalNote: 'Dạy Tin học & Công nghệ cấp tiểu học.',
      },
      {
        positionId: 'pos_gv_nghethuat_th',
        positionName: 'Giáo viên Mĩ thuật - Âm nhạc tiểu học',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(pClasses * 0.15)),
        variance: 0,
        proposalNote: 'Dạy Âm nhạc và Mĩ thuật cấp tiểu học.',
      },
      {
        positionId: 'pos_gv_thechat_th',
        positionName: 'Giáo viên Giáo dục thể chất tiểu học',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(pClasses * 0.15)),
        variance: 0,
        proposalNote: 'Dạy Giáo dục thể chất cấp tiểu học.',
      },
      // Giáo viên THCS
      {
        positionId: 'pos_gv_toan_thcs',
        positionName: 'Giáo viên môn Toán THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(sClasses * 0.35)),
        variance: 0,
        proposalNote: `Dạy môn Toán cấp THCS (${sClasses} lớp THCS).`,
      },
      {
        positionId: 'pos_gv_van_thcs',
        positionName: 'Giáo viên môn Ngữ văn THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(sClasses * 0.35)),
        variance: 0,
        proposalNote: `Dạy môn Ngữ văn cấp THCS (${sClasses} lớp THCS).`,
      },
      {
        positionId: 'pos_gv_khtn_thcs',
        positionName: 'Giáo viên môn Khoa học tự nhiên THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(sClasses * 0.4)),
        variance: 0,
        proposalNote: 'Dạy KHTN (Vật lí, Hóa học, Sinh học) kèm thí nghiệm.',
      },
      {
        positionId: 'pos_gv_lsdl_thcs',
        positionName: 'Giáo viên môn Lịch sử và Địa lí THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(sClasses * 0.25)),
        variance: 0,
        proposalNote: 'Dạy phân môn Lịch sử và Địa lí THCS.',
      },
      {
        positionId: 'pos_gv_tienganh_thcs',
        positionName: 'Giáo viên môn Ngoại ngữ (Tiếng Anh) THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(sClasses * 0.3)),
        variance: 0,
        proposalNote: 'Dạy Tiếng Anh THCS 3 tiết/tuần/lớp.',
      },
      {
        positionId: 'pos_gv_thechat_thcs',
        positionName: 'Giáo viên Giáo dục thể chất THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(sClasses * 0.15)),
        variance: 0,
        proposalNote: 'Dạy GDTC cấp THCS.',
      },
      {
        positionId: 'pos_gv_tongphutrach',
        positionName: 'Giáo viên Tổng phụ trách Đội',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Phụ trách Liên đội chung toàn trường (Tiểu học & THCS).',
      },
      // Chuyên môn dùng chung
      {
        positionId: 'pos_thuvien',
        positionName: 'Thư viện viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 biên chế phục vụ thư viện cả 2 cấp.',
      },
      {
        positionId: 'pos_thietbi',
        positionName: 'Viên chức Thiết bị, thí nghiệm',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: (calc.schoolTier === 'HANG_1' && info.totalClasses >= 40) ? 2 : 1,
        variance: 0,
        proposalNote: 'Quản lý đồ dùng dạy học TH và phòng thí nghiệm THCS.',
      },
      {
        positionId: 'pos_ketoan',
        positionName: 'Kế toán viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 biên chế kế toán tài chính đơn vị.',
      },
      {
        positionId: 'pos_vanthu',
        positionName: 'Văn thư viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        concurrentArrangement: 'Kiêm nhiệm Thủ quỹ',
        variance: 0,
        proposalNote: '01 biên chế văn thư, kiêm nhiệm công tác thủ quỹ.',
      },
      {
        positionId: 'pos_yte',
        positionName: 'Nhân viên Y tế học đường',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Chăm sóc sức khỏe học đường toàn trường.',
      },
      {
        positionId: 'pos_khuyettat',
        positionName: 'Nhân viên Hỗ trợ GD người khuyết tật',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: info.inclusiveStudentCount >= 5 ? 1 : 0,
        variance: 0,
        proposalNote: info.inclusiveStudentCount >= 5 ? 'Bố trí 01 người hỗ trợ HS khuyết tật.' : 'Chưa bố trí.',
      },
      {
        positionId: 'pos_baove',
        positionName: 'Nhân viên Bảo vệ',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.schoolTier === 'HANG_1' ? 3 : 2,
        contractArrangement: 'Hợp đồng lao động NĐ 111/2022/NĐ-CP',
        variance: 0,
        proposalNote: 'Hợp đồng bảo vệ an ninh trật tự trường liên cấp.',
      },
      {
        positionId: 'pos_tapvu',
        positionName: 'Nhân viên Phục vụ / Tạp vụ',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.schoolTier === 'HANG_1' ? 3 : 2,
        contractArrangement: 'Hợp đồng lao động NĐ 111/2022/NĐ-CP',
        variance: 0,
        proposalNote: 'Hợp đồng phục vụ vệ sinh khuôn viên trường.',
      },
    ];
  }

  if (info.level === 'TIEU_HOC') {
    return [
      {
        positionId: 'pos_hieutruong',
        positionName: 'Hiệu trưởng',
        group: 'LANH_DAO_QUAN_LY',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.maxPrincipal,
        variance: 0,
        proposalNote: 'Bố trí 01 người đứng đầu đơn vị.',
      },
      {
        positionId: 'pos_phohieutruong',
        positionName: 'Phó Hiệu trưởng',
        group: 'LANH_DAO_QUAN_LY',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.maxVicePrincipal,
        variance: 0,
        proposalNote: `Định mức tối đa ${calc.maxVicePrincipal} Phó Hiệu trưởng theo hạng trường.`,
      },
      {
        positionId: 'pos_gv_tieuhoc',
        positionName: 'Giáo viên tiểu học (dạy các môn chung / CN)',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: info.totalClasses,
        variance: 0,
        proposalNote: 'Đảm bảo mỗi lớp có 01 giáo viên chủ nhiệm và dạy các môn chung.',
      },
      {
        positionId: 'pos_gv_tienganh_th',
        positionName: 'Giáo viên Tiếng Anh tiểu học',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.15)),
        variance: 0,
        proposalNote: 'Dạy Tiếng Anh bắt buộc từ lớp 3-5 và làm quen lớp 1-2.',
      },
      {
        positionId: 'pos_gv_tinhoc_th',
        positionName: 'Giáo viên Tin học & Công nghệ',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.1)),
        variance: 0,
        proposalNote: 'Dạy Tin học & Công nghệ bắt buộc từ lớp 3.',
      },
      {
        positionId: 'pos_gv_nghethuat_th',
        positionName: 'Giáo viên Mĩ thuật - Âm nhạc',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.15)),
        variance: 0,
        proposalNote: 'Bố trí giáo viên dạy môn Âm nhạc và Mĩ thuật.',
      },
      {
        positionId: 'pos_gv_thechat_th',
        positionName: 'Giáo viên Giáo dục thể chất',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.15)),
        variance: 0,
        proposalNote: 'Dạy thể chất và thể thao học đường.',
      },
      {
        positionId: 'pos_gv_tongphutrach',
        positionName: 'Giáo viên Tổng phụ trách Đội',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Bố trí 01 người phụ trách công tác Đội TNTP.',
      },
      {
        positionId: 'pos_thuvien',
        positionName: 'Thư viện viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 biên chế viên chức theo TT 20/2023.',
      },
      {
        positionId: 'pos_thietbi',
        positionName: 'Viên chức Thiết bị, thí nghiệm',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 biên chế viên chức quản lý đồ dùng dạy học.',
      },
      {
        positionId: 'pos_ketoan',
        positionName: 'Kế toán viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 biên chế viên chức kế toán.',
      },
      {
        positionId: 'pos_vanthu',
        positionName: 'Văn thư viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        concurrentArrangement: 'Kiêm nhiệm công tác Thủ quỹ đơn vị',
        variance: 0,
        proposalNote: '01 biên chế viên chức; kiêm nhiệm thủ quỹ cơ quan.',
      },
      {
        positionId: 'pos_yte',
        positionName: 'Nhân viên Y tế học đường',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 người đảm bảo chăm sóc sức khỏe học đường.',
      },
      {
        positionId: 'pos_khuyettat',
        positionName: 'Nhân viên Hỗ trợ GD người khuyết tật',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: info.inclusiveStudentCount >= 5 ? 1 : 0,
        variance: 0,
        proposalNote: info.inclusiveStudentCount >= 5 ? 'Được bố trí 01 người do có từ 05 HS khuyết tật trở lên.' : 'Chưa bố trí (dưới 5 HS khuyết tật).',
      },
      {
        positionId: 'pos_baove',
        positionName: 'Nhân viên Bảo vệ',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.schoolTier === 'HANG_1' ? 3 : 2,
        contractArrangement: 'Hợp đồng lao động theo Nghị định 111/2022/NĐ-CP',
        variance: 0,
        proposalNote: 'Hợp đồng lao động NĐ 111/2022/NĐ-CP, không tính vào biên chế viên chức.',
      },
      {
        positionId: 'pos_tapvu',
        positionName: 'Nhân viên Phục vụ / Tạp vụ',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.schoolTier === 'HANG_1' ? 3 : 2,
        contractArrangement: 'Hợp đồng lao động theo Nghị định 111/2022/NĐ-CP',
        variance: 0,
        proposalNote: 'Hợp đồng lao động NĐ 111/2022/NĐ-CP, phục vụ vệ sinh trường học.',
      },
    ];
  } else {
    // THCS
    return [
      {
        positionId: 'pos_hieutruong',
        positionName: 'Hiệu trưởng',
        group: 'LANH_DAO_QUAN_LY',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: '01 người đứng đầu đơn vị.',
      },
      {
        positionId: 'pos_phohieutruong',
        positionName: 'Phó Hiệu trưởng',
        group: 'LANH_DAO_QUAN_LY',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.maxVicePrincipal,
        variance: 0,
        proposalNote: `Định mức tối đa ${calc.maxVicePrincipal} Phó Hiệu trưởng theo hạng trường.`,
      },
      {
        positionId: 'pos_gv_toan_thcs',
        positionName: 'Giáo viên môn Toán THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.35)),
        variance: 0,
        proposalNote: 'Môn Toán 4 tiết/tuần/lớp.',
      },
      {
        positionId: 'pos_gv_van_thcs',
        positionName: 'Giáo viên môn Ngữ văn THCS',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.35)),
        variance: 0,
        proposalNote: 'Môn Ngữ văn 4 tiết/tuần/lớp.',
      },
      {
        positionId: 'pos_gv_khtn_thcs',
        positionName: 'Giáo viên môn Khoa học tự nhiên',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.4)),
        variance: 0,
        proposalNote: 'KHTN (Lý - Hóa - Sinh) kèm thực hành thí nghiệm.',
      },
      {
        positionId: 'pos_gv_lsdl_thcs',
        positionName: 'Giáo viên môn Lịch sử và Địa lí',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.25)),
        variance: 0,
        proposalNote: 'Phân môn Lịch sử và Địa lí.',
      },
      {
        positionId: 'pos_gv_tienganh_thcs',
        positionName: 'Giáo viên môn Ngoại ngữ (Tiếng Anh)',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: Math.max(1, Math.round(info.totalClasses * 0.3)),
        variance: 0,
        proposalNote: 'Ngoại ngữ 1 (Tiếng Anh) 3 tiết/tuần/lớp.',
      },
      {
        positionId: 'pos_gv_tongphutrach',
        positionName: 'Giáo viên Tổng phụ trách Đội',
        group: 'CHUYEN_MON_NGHIEP_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Chuyên trách công tác Đội TNTP Hồ Chí Minh.',
      },
      {
        positionId: 'pos_thietbi',
        positionName: 'Viên chức Thiết bị, thí nghiệm',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Quản lý phòng thực hành thí nghiệm KHTN.',
      },
      {
        positionId: 'pos_thuvien',
        positionName: 'Thư viện viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Quản lý thư viện trường học.',
      },
      {
        positionId: 'pos_ketoan',
        positionName: 'Kế toán viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Phụ trách tài chính kế toán ngân sách nhà nước.',
      },
      {
        positionId: 'pos_vanthu',
        positionName: 'Văn thư viên',
        group: 'CHUYEN_MON_DUNG_CHUNG',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        concurrentArrangement: 'Kiêm nhiệm Thủ quỹ',
        variance: 0,
        proposalNote: 'Quản lý công văn, con dấu và kiêm nhiệm thủ quỹ.',
      },
      {
        positionId: 'pos_yte',
        positionName: 'Nhân viên Y tế học đường',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: 1,
        variance: 0,
        proposalNote: 'Chăm sóc sức khỏe học đường theo quy định.',
      },
      {
        positionId: 'pos_baove',
        positionName: 'Nhân viên Bảo vệ',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.schoolTier === 'HANG_1' ? 3 : 2,
        contractArrangement: 'Hợp đồng lao động NĐ 111/2022/NĐ-CP',
        variance: 0,
        proposalNote: 'Hợp đồng bảo vệ an ninh trật tự 24/24.',
      },
      {
        positionId: 'pos_tapvu',
        positionName: 'Nhân viên Phục vụ / Tạp vụ',
        group: 'HO_TRO_PHUC_VU',
        currentCount: 0,
        allocatedQuota: 0,
        calculatedNeed: calc.schoolTier === 'HANG_1' ? 3 : 2,
        contractArrangement: 'Hợp đồng lao động NĐ 111/2022/NĐ-CP',
        variance: 0,
        proposalNote: 'Hợp đồng phục vụ vệ sinh trường học.',
      },
    ];
  }
}
