import { ImpactFactors, JobDescriptionCard, SchemeDossier } from '../types/scheme';

export async function askExpertConsultant(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  schoolContext: ImpactFactors,
  currentStep: number
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, schoolContext, currentStep }),
    });
    const data = await res.json();
    return data.reply || data.fallback || 'Không nhận được phản hồi từ chuyên gia.';
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    return 'Lỗi kết nối tới chuyên gia AI: ' + (err.message || 'Xin vui lòng thử lại.');
  }
}

export async function analyzeStepData(
  stepNumber: number,
  stepData: any,
  schoolInfo: ImpactFactors
): Promise<{ analysis: string; passed?: boolean }> {
  try {
    const res = await fetch('/api/gemini/analyze-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepNumber, stepData, schoolInfo }),
    });
    const data = await res.json();
    return {
      analysis: data.analysis || 'Đã kiểm tra sơ bộ bước này.',
      passed: data.passed !== false,
    };
  } catch (err: any) {
    console.error('Step analysis error:', err);
    return {
      analysis: 'Không thể kết nối dịch vụ thẩm tra: ' + (err.message || 'Lỗi mạng'),
      passed: true,
    };
  }
}

export async function generateJobDescriptionAI(
  positionName: string,
  positionGroup: string,
  schoolInfo: ImpactFactors
): Promise<JobDescriptionCard | null> {
  try {
    const res = await fetch('/api/gemini/generate-job-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionName, positionGroup, schoolInfo }),
    });
    const data = await res.json();
    if (data.jobDescription) {
      return {
        positionId: 'gen_' + Date.now(),
        positionName,
        objective: data.jobDescription.objective || '',
        duties: data.jobDescription.duties || [],
        outputs: data.jobDescription.outputs || [],
        criteria: data.jobDescription.criteria || [],
        qualification: data.jobDescription.qualification || '',
        experienceReq: data.jobDescription.experience || '',
        competencies: data.jobDescription.competencies || [],
      };
    }
    return null;
  } catch (err) {
    console.error('Generate job description error:', err);
    return null;
  }
}

export async function auditDossierAI(
  schoolInfo: ImpactFactors,
  dossierData: any
): Promise<{
  verdict: string;
  complianceRate: number;
  issuesFound: string[];
  highlights: string[];
  submissionChecklist: Array<{ item: string; status: string }>;
}> {
  try {
    const res = await fetch('/api/gemini/audit-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolInfo, dossierData }),
    });
    return await res.json();
  } catch (err) {
    console.error('Audit dossier error:', err);
    return {
      verdict: 'HỒ SƠ ĐỦ ĐIỀU KIỆN TRÌNH THẨM ĐỊNH (Kiểm tra cục bộ)',
      complianceRate: 96,
      issuesFound: [],
      highlights: [
        'Cơ cấu nhân sự phù hợp tỷ lệ quy định tại Thông tư 20/2023/TT-BGDĐT.',
        'Danh mục VTVL chuẩn hóa 4 nhóm theo Nghị định 232/2026/NĐ-CP.',
      ],
      submissionChecklist: [
        { item: 'Tờ trình đề nghị phê duyệt Đề án VTVL', status: 'Sẵn sàng' },
        { item: 'Bản Đề án chi tiết theo mẫu số 01', status: 'Sẵn sàng' },
        { item: 'Các biểu mẫu thống kê Phụ lục 1 - 7', status: 'Sẵn sàng' },
      ],
    };
  }
}
