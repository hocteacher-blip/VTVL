import { SchemeDossier } from '../types/scheme';
import { calculateStatutoryQuotas } from './statutoryCalculations';

export function exportSchemeToWord(dossier: SchemeDossier) {
  const { schoolInfo, tasks, staff, positions, quotas } = dossier;
  const calc = calculateStatutoryQuotas(schoolInfo);
  const now = new Date();
  const dateStr = `ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>ĐỀ ÁN VỊ TRÍ VIỆC LÀM - ${schoolInfo.schoolName}</title>
<style>
  @page {
    size: 210mm 297mm;
    margin: 20mm 20mm 20mm 25mm;
  }
  body {
    font-family: 'Times New Roman', serif;
    font-size: 13pt;
    line-height: 1.35;
    color: #000;
  }
  .header-table {
    width: 100%;
    margin-bottom: 20px;
    border-collapse: collapse;
  }
  .header-table td {
    vertical-align: top;
    text-align: center;
    border: none;
    padding: 0;
  }
  .bold { font-weight: bold; }
  .uppercase { text-transform: uppercase; }
  .title {
    text-align: center;
    font-size: 15pt;
    font-weight: bold;
    margin: 20px 0 10px 0;
    text-transform: uppercase;
  }
  .subtitle {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    margin-bottom: 25px;
  }
  h2 {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  h3 {
    font-size: 13pt;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
  }
  p {
    margin: 6px 0;
    text-align: justify;
    text-indent: 1.25cm;
  }
  .no-indent {
    text-indent: 0;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 11pt;
  }
  table.data-table th, table.data-table td {
    border: 1px solid #000;
    padding: 6px 8px;
    vertical-align: middle;
  }
  table.data-table th {
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }
  .sign-table {
    width: 100%;
    margin-top: 35px;
    border-collapse: collapse;
  }
  .sign-table td {
    border: none;
    text-align: center;
    vertical-align: top;
    font-size: 12pt;
  }
</style>
</head>
<body>

<table class="header-table">
  <tr>
    <td style="width: 45%;">
      <span class="uppercase">ỦY BAN NHÂN DÂN CẤP HUYỆN</span><br>
      <span class="bold uppercase">${schoolInfo.schoolName || '[TÊN TRƯỜNG / ĐƠN VỊ]'}</span><br>
      <span>Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ĐA-${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'LC' : schoolInfo.level === 'THCS' ? 'THCS' : 'TH'}</span>
    </td>
    <td style="width: 55%;">
      <span class="bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br>
      <span class="bold">Độc lập - Tự do - Hạnh phúc</span><br>
      <span style="font-style: italic;">..., ${dateStr}</span>
    </td>
  </tr>
</table>

<div class="title">ĐỀ ÁN<br>XÂY DỰNG VỊ TRÍ VIỆC LÀM VÀ SỐ LƯỢNG NGƯỜI LÀM VIỆC</div>
<div class="subtitle">ÁP DỤNG TẠI: ${(schoolInfo.schoolName || 'NHÀ TRƯỜNG').toUpperCase()}</div>

<h2>PHẦN I. CĂN CỨ PHÁP LÝ VÀ SỰ CẦN THIẾT XÂY DỰNG ĐỀ ÁN</h2>

<h3>1. Căn cứ pháp lý</h3>
<p>- Căn cứ Luật Viên chức ngày 15 tháng 11 năm 2010; Luật sửa đổi, bổ sung một số điều của Luật Cán bộ, công chức và Luật Viên chức ngày 25 tháng 11 năm 2019;</p>
<p>- Căn cứ Luật Giáo dục ngày 14 tháng 6 năm 2019;</p>
<p>- Căn cứ Nghị định số 232/2026/NĐ-CP (và Nghị định số 106/2020/NĐ-CP ngày 10/9/2020) của Chính phủ quy định về vị trí việc làm và số lượng người làm việc trong đơn vị sự nghiệp công lập;</p>
<p>- Căn cứ Nghị định số 111/2022/NĐ-CP ngày 30/12/2022 của Chính phủ về hợp đồng đối với một số loại công việc trong cơ quan hành chính và đơn vị sự nghiệp công lập;</p>
<p>- Căn cứ Thông tư số 20/2023/TT-BGDĐT ngày 30/10/2023 của Bộ Giáo dục và Đào tạo hướng dẫn về vị trí việc làm, cơ cấu viên chức theo chức danh nghề nghiệp và định mức số lượng người làm việc trong các cơ sở giáo dục phổ thông và các trường chuyên biệt công lập (đặc biệt là Chương III về trường phổ thông có nhiều cấp học);</p>
<p>- Căn cứ Điều lệ trường ${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'trung học có nhiều cấp học ban hành kèm theo Thông tư số 32/2020/TT-BGDĐT' : schoolInfo.level === 'THCS' ? 'trung học cơ sở ban hành kèm theo Thông tư số 32/2020/TT-BGDĐT' : 'tiểu học ban hành kèm theo Thông tư số 28/2020/TT-BGDĐT'} của Bộ Giáo dục và Đào tạo.</p>

<h3>2. Sự cần thiết xây dựng Đề án</h3>
<p>Xây dựng Đề án vị trí việc làm theo quy trình 9 bước chuẩn hóa là cơ sở pháp lý và khoa học quan trọng nhằm kiện toàn cơ cấu tổ chức bộ máy của ${schoolInfo.schoolName || 'nhà trường'}, xác định chính xác số lượng người làm việc cần thiết, làm căn cứ tuyển dụng, sử dụng, đào tạo, bồi dưỡng, quy hoạch, bổ nhiệm và quản lý đội ngũ viên chức, nhân viên đáp ứng yêu cầu thực hiện Chương trình giáo dục phổ thông 2018.</p>

<h2>PHẦN II. THỰC TRẠNG QUY MÔ, ĐẶC ĐIỂM VÀ ĐỘI NGŨ NHÀ TRƯỜNG</h2>
<h3>1. Quy mô trường lớp và học sinh</h3>
<p>- Cấp học: <b>${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'Trường phổ thông có nhiều cấp học (Tiểu học & THCS)' : schoolInfo.level === 'THCS' ? 'Trung học cơ sở' : 'Tiểu học'}</b>. Phân hạng trường: <b>${calc.schoolTierName}</b>.</p>
<p>- Tổng số lớp học: <b>${schoolInfo.totalClasses} lớp</b> ${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? `(Cấp Tiểu học: ${schoolInfo.primaryClasses || 0} lớp, Cấp THCS: ${schoolInfo.secondaryClasses || 0} lớp)` : ''}. Tổng số học sinh: <b>${schoolInfo.totalStudents} học sinh</b>.</p>
<p>- Số điểm trường: <b>${schoolInfo.satelliteCampuses} điểm trường</b>. Hình thức tổ chức dạy học: <b>${schoolInfo.sessionType === '2_BUOI_NGAY' ? 'Dạy 2 buổi/ngày kèm bán trú' : 'Dạy 1 buổi/ngày'}</b>.</p>
<p>- Học sinh khuyết tật học hòa nhập: <b>${schoolInfo.hasInclusiveStudents ? schoolInfo.inclusiveStudentCount + ' học sinh' : 'Không có'}</b>.</p>
<p>- Mức độ ứng dụng công nghệ thông tin và chuyển đổi số: <b>Mức ${schoolInfo.itLevel}</b>.</p>

<h3>2. Thực trạng đội ngũ cán bộ, giáo viên, nhân viên hiện có</h3>
<p>Tổng số cán bộ, giáo viên, nhân viên hiện có mặt: <b>${staff.length} người</b>.</p>

<table class="data-table">
  <thead>
    <tr>
      <th style="width: 6%;">STT</th>
      <th style="width: 24%;">Họ và tên</th>
      <th style="width: 25%;">Vị trí việc làm / Bộ môn</th>
      <th style="width: 15%;">Trình độ</th>
      <th style="width: 15%;">Hạng CDNN</th>
      <th style="width: 15%;">Đánh giá năng lực</th>
    </tr>
  </thead>
  <tbody>
    ${staff.map((st, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><b>${st.fullName}</b></td>
        <td>${st.positionName}</td>
        <td style="text-align: center;">${st.qualification}</td>
        <td style="text-align: center;">${st.professionalTitle}</td>
        <td style="text-align: center;">${st.competencyRating}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<h2>PHẦN III. XÁC ĐỊNH DANH MỤC VỊ TRÍ VIỆC LÀM VÀ SỐ LƯỢNG NGƯỜI LÀM VIỆC</h2>

<h3>1. Danh mục vị trí việc làm (Phân chia 4 nhóm theo quy định)</h3>
<p>Căn cứ Nghị định 232/2026/NĐ-CP và Thông tư 20/2023/TT-BGDĐT, nhà trường xác định danh mục gồm các nhóm:</p>
<p>- <b>Nhóm 1: Vị trí việc làm Lãnh đạo, quản lý:</b> Hiệu trưởng, Phó Hiệu trưởng.</p>
<p>- <b>Nhóm 2: Vị trí việc làm Chuyên môn nghiệp vụ:</b> Giáo viên bộ môn / Giáo viên tiểu học, Giáo viên Tổng phụ trách Đội TNTP Hồ Chí Minh.</p>
<p>- <b>Nhóm 3: Vị trí việc làm Chuyên môn dùng chung:</b> Thư viện viên, Viên chức Thiết bị thí nghiệm, Kế toán viên, Văn thư viên, Công nghệ thông tin.</p>
<p>- <b>Nhóm 4: Vị trí việc làm Hỗ trợ, phục vụ:</b> Y tế học đường, Hỗ trợ GD người khuyết tật, Nhân viên Bảo vệ, Nhân viên Phục vụ (thực hiện theo NĐ 111/2022/NĐ-CP).</p>

<h3>2. Bảng tổng hợp xác định cơ cấu và số lượng người làm việc đề xuất</h3>
<table class="data-table">
  <thead>
    <tr>
      <th style="width: 5%;">STT</th>
      <th style="width: 28%;">Tên vị trí việc làm</th>
      <th style="width: 15%;">Nhóm vị trí</th>
      <th style="width: 10%;">Hiện có</th>
      <th style="width: 10%;">Định mức đề xuất</th>
      <th style="width: 12%;">Biên chế giao</th>
      <th style="width: 20%;">Phương án bố trí / Ghi chú</th>
    </tr>
  </thead>
  <tbody>
    ${quotas.map((q, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><b>${q.positionName}</b></td>
        <td><small>${q.group}</small></td>
        <td style="text-align: center;">${q.currentCount}</td>
        <td style="text-align: center; font-weight: bold;">${q.calculatedNeed}</td>
        <td style="text-align: center;">${q.allocatedQuota}</td>
        <td><small>${q.concurrentArrangement || q.contractArrangement || q.proposalNote}</small></td>
      </tr>
    `).join('')}
  </tbody>
</table>

<p><b>Tổng số người làm việc đề xuất hưởng lương ngân sách nhà nước:</b> <b>${calc.totalCivilServantQuotas} người</b> (không bao gồm hợp đồng lao động theo Nghị định 111/2022/NĐ-CP).</p>
<p><b>Tổng số chỉ tiêu hợp đồng theo Nghị định 111/2022/NĐ-CP:</b> <b>${calc.maxContractStaff111} chỉ tiêu</b> (Bảo vệ, Tạp vụ phục vụ).</p>

<h2>PHẦN IV. TỔ CHỨC THỰC HIỆN</h2>
<p>Sau khi Đề án vị trí việc làm được cơ quan có thẩm quyền phê duyệt:</p>
<p>1. Hiệu trưởng ban hành Quyết định phê duyệt bản mô tả công việc và khung năng lực của từng vị trí việc làm.</p>
<p>2. Tổ chức rà soát, bố trí, sắp xếp, bổ nhiệm chức danh nghề nghiệp cho viên chức phù hợp với vị trí việc làm được phê duyệt.</p>
<p>3. Làm căn cứ xây dựng kế hoạch tuyển dụng bổ sung số lượng người làm việc còn thiếu và ký hợp đồng lao động theo Nghị định 111/2022/NĐ-CP.</p>

<table class="sign-table">
  <tr>
    <td style="width: 45%; text-align: left;">
      <b><i>Nơi nhận:</i></b><br>
      - Phòng GD&ĐT (để thẩm định);<br>
      - Phòng Nội vụ (để thẩm định);<br>
      - UBND cấp huyện (để phê duyệt);<br>
      - Lưu: VT, BGH.
    </td>
    <td style="width: 55%;">
      <b>HIỆU TRƯỞNG</b><br>
      <i>(Ký tên, ghi rõ họ tên và đóng dấu)</i><br><br><br><br><br>
      <b>${staff.find(s => s.positionId === 'pos_hieutruong')?.fullName || '(Ký và ghi rõ họ tên)'}</b>
    </td>
  </tr>
</table>

</body>
</html>
`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (schoolInfo.schoolName || 'De_an_VTVL').replace(/\s+/g, '_');
  a.download = `De_an_VTVL_${safeName}_2026.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportQuotasToExcel(dossier: SchemeDossier) {
  const { schoolInfo, quotas, staff } = dossier;

  let csvContent = 'BẢNG TỔNG HỢP SỐ LƯỢNG NGƯỜI LÀM VIỆC VÀ VỊ TRÍ VIỆC LÀM\n';
  csvContent += `Đơn vị: ${schoolInfo.schoolName || '[Chưa nhập tên trường]'}\n`;
  csvContent += `Cấp học: ${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'Liên cấp TH & THCS' : schoolInfo.level === 'THCS' ? 'THCS' : 'Tiểu học'} - Quy mô: ${schoolInfo.totalClasses} lớp, ${schoolInfo.totalStudents} học sinh\n\n`;

  csvContent += 'STT,Tên vị trí việc làm,Nhóm vị trí,Hiện có,Biên chế đã giao,Nhu cầu tính theo định mức TT 20/2023,Chênh lệch (Thừa/Thiếu),Phương án kiêm nhiệm / Hợp đồng 111,Ghi chú đề xuất\n';

  quotas.forEach((q, idx) => {
    const row = [
      idx + 1,
      `"${q.positionName}"`,
      `"${q.group}"`,
      q.currentCount,
      q.allocatedQuota,
      q.calculatedNeed,
      q.allocatedQuota - q.calculatedNeed,
      `"${q.concurrentArrangement || q.contractArrangement || 'Không'}"`,
      `"${q.proposalNote}"`,
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\nDANH SÁCH THỰC TRẠNG ĐỘI NGŨ NHÂN SỰ HIỆN CÓ\n';
  csvContent += 'STT,Họ và tên,Vị trí việc làm,Nhóm vị trí,Trình độ chuyên môn,Chức danh nghề nghiệp,Mã số chức danh,Số tiết dạy/tuần,Nhiệm vụ kiêm nhiệm,Đánh giá năng lực\n';

  staff.forEach((st, idx) => {
    const row = [
      idx + 1,
      `"${st.fullName}"`,
      `"${st.positionName}"`,
      `"${st.group}"`,
      st.qualification,
      st.professionalTitle,
      `"${st.titleCode}"`,
      st.currentTeachingLoadWeekly,
      `"${st.concurrentDuty || 'Không'}"`,
      st.competencyRating,
    ];
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob(['\ufeff', csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (schoolInfo.schoolName || 'So_lieu_VTVL').replace(/\s+/g, '_');
  a.download = `Bang_so_lieu_VTVL_${safeName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSubmissionLetterWord(dossier: SchemeDossier) {
  const { schoolInfo } = dossier;
  const now = new Date();
  const dateStr = `ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  const displayName = schoolInfo.schoolName || '[TÊN TRƯỜNG / ĐƠN VỊ]';

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>TỜ TRÌNH PHÊ DUYỆT ĐỀ ÁN VTVL - ${displayName}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; }
  .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .header-table td { border: none; text-align: center; vertical-align: top; }
  .bold { font-weight: bold; }
  .uppercase { text-transform: uppercase; }
  p { text-align: justify; text-indent: 1.25cm; margin: 6px 0; }
  .center { text-align: center; }
</style>
</head>
<body>

<table class="header-table">
  <tr>
    <td style="width: 45%;">
      <span class="uppercase">ỦY BAN NHÂN DÂN CẤP HUYỆN</span><br>
      <span class="bold uppercase">${displayName}</span><br>
      <span>Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/TTr-${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'LC' : schoolInfo.level === 'THCS' ? 'THCS' : 'TH'}</span>
    </td>
    <td style="width: 55%;">
      <span class="bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br>
      <span class="bold">Độc lập - Tự do - Hạnh phúc</span><br>
      <span style="font-style: italic;">..., ${dateStr}</span>
    </td>
  </tr>
</table>

<div class="center bold uppercase" style="font-size: 14pt; margin: 25px 0 15px 0;">
  TỜ TRÌNH<br>
  Về việc đề nghị phê duyệt Đề án vị trí việc làm và số lượng người làm việc<br>
  tại ${displayName}
</div>

<p class="center bold" style="text-indent: 0;">Kính gửi: Ủy ban nhân dân cấp huyện / thị xã / thành phố<br>Đồng kính gửi: Phòng Giáo dục và Đào tạo, Phòng Nội vụ</p>

<p>Căn cứ Nghị định số 232/2026/NĐ-CP (và Nghị định số 106/2020/NĐ-CP ngày 10/9/2020) của Chính phủ quy định về vị trí việc làm và số lượng người làm việc trong đơn vị sự nghiệp công lập;</p>
<p>Căn cứ Thông tư số 20/2023/TT-BGDĐT ngày 30/10/2023 của Bộ Giáo dục và Đào tạo hướng dẫn về vị trí việc làm, cơ cấu viên chức theo chức danh nghề nghiệp và định mức số lượng người làm việc trong các cơ sở giáo dục phổ thông và các trường chuyên biệt công lập;</p>
<p>${displayName} đã tiến hành xây dựng Đề án vị trí việc làm theo đầy đủ quy trình 9 bước quy định. Hồ sơ đã được Hội đồng trường họp thông qua và rà soát tính chuẩn xác số liệu.</p>
<p>Kính trình UBND cấp huyện, Phòng Giáo dục và Đào tạo, Phòng Nội vụ xem xét, thẩm định và phê duyệt Đề án vị trí việc làm của nhà trường.</p>

<p class="bold" style="text-indent: 0; margin-top: 15px;">Hồ sơ gửi kèm bao gồm:</p>
<p style="text-indent: 0.5cm;">1. Bản Đề án vị trí việc làm và số lượng người làm việc chi tiết;</p>
<p style="text-indent: 0.5cm;">2. Các Phụ lục bảng biểu thống kê từ Bước 1 đến Bước 7;</p>
<p style="text-indent: 0.5cm;">3. Bản mô tả công việc và khung năng lực của từng vị trí việc làm;</p>
<p style="text-indent: 0.5cm;">4. Biên bản họp Hội đồng trường thông qua Đề án.</p>

<table style="width: 100%; margin-top: 35px; border-collapse: collapse;">
  <tr>
    <td style="width: 45%; border: none;">
      <b><i>Nơi nhận:</i></b><br>
      - Như trên;<br>
      - Lưu: VT.
    </td>
    <td style="width: 55%; border: none; text-align: center;">
      <b>HIỆU TRƯỞNG</b><br>
      <i>(Ký, ghi rõ họ tên và đóng dấu)</i>
    </td>
  </tr>
</table>

</body>
</html>
`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (schoolInfo.schoolName || 'To_trinh_VTVL').replace(/\s+/g, '_');
  a.download = `To_trinh_VTVL_${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
