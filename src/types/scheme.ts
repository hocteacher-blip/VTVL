export type SchoolLevel = 'TIEU_HOC' | 'THCS' | 'LIEN_CAP_TH_THCS';

export type TaskFrequency = 'THUONG_XUYEN' | 'DINH_KY' | 'DOT_XUAT';
export type TaskRole = 'CHINH' | 'KIEM_NHIEM';

export type PositionGroup = 
  | 'LANH_DAO_QUAN_LY'
  | 'CHUYEN_MON_NGHIEP_VU'
  | 'CHUYEN_MON_DUNG_CHUNG'
  | 'HO_TRO_PHUC_VU';

export interface TaskItem {
  id: string;
  department: string; // Ban giám hiệu, Tổ chuyên môn, Giáo viên, Nhân viên
  taskName: string;
  description: string;
  frequency: TaskFrequency;
  roleType: TaskRole;
  group: PositionGroup;
  assignedTo: string; // Tên vị trí phụ trách
}

export interface ImpactFactors {
  schoolName: string;
  level: SchoolLevel;
  schoolTier: 'HANG_1' | 'HANG_2' | 'HANG_3';
  totalClasses: number;
  totalStudents: number;
  // Specific breakdown for multi-level schools (Trường phổ thông có nhiều cấp học - TH & THCS)
  primaryClasses?: number;
  secondaryClasses?: number;
  primaryStudents?: number;
  secondaryStudents?: number;
  satelliteCampuses: number; // Số điểm trường
  sessionType: '1_BUOI_NGAY' | '2_BUOI_NGAY';
  regionType: 'DONG_BANG' | 'KHO_KHAN'; // Vùng khó khăn có định mức riêng
  itLevel: 'CO_BAN' | 'KHA' | 'CAO'; // Chuyển đổi số & ứng dụng CNTT
  hasInclusiveStudents: boolean; // Có học sinh khuyết tật học hòa nhập không
  inclusiveStudentCount: number;
  curriculumStatus: string; // Thực hiện Chương trình GDPT 2018
  managementScopeNotes: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  positionId: string;
  positionName: string;
  group: PositionGroup;
  qualification: 'THAC_SI' | 'DAI_HOC' | 'CAO_DANG' | 'TRUNG_CAP' | 'KHAC';
  professionalTitle: 'HANG_I' | 'HANG_II' | 'HANG_III' | 'CHUA_BO_NHIEM' | 'HOP_DONG_111'; // CDNN theo TT 02/03/08/2023
  titleCode: string; // Mã số chức danh: V.07.03.29, V.07.04.32, v.v.
  teachingSubject?: string;
  currentTeachingLoadWeekly: number; // Số tiết dạy thực tế/tuần
  concurrentDuty?: string; // Nhiệm vụ kiêm nhiệm (Tổ trưởng, Chủ nhiệm, TPT,...)
  status: 'DANG_CONG_TAC' | 'NGHI_THAI_SAN' | 'DI_HOC' | 'BIET_PHAI';
  competencyRating: 'XUAT_SAC' | 'TOT' | 'HOAN_THANH' | 'CHUA_HOAN_THANH';
}

export interface PositionItem {
  id: string;
  code: string;
  name: string;
  group: PositionGroup;
  levelApplicable: SchoolLevel | 'BOTH';
  functions: string;
  mainDuties: string[];
  responsibilitiesScope: string;
  workRelations: string; // Quan hệ báo cáo & phối hợp
  workProducts: string[];
  isMandatory: boolean;
  legalBasis: string; // TT 20/2023/TT-BGDĐT Điều...
}

export interface CompetencyRequirement {
  name: string;
  level: number; // 1-5
  description: string;
}

export interface JobDescriptionCard {
  positionId: string;
  positionName: string;
  objective: string;
  duties: string[];
  outputs: string[];
  criteria: string[];
  qualification: string;
  experienceReq?: string;
  competencies: CompetencyRequirement[];
}

export interface StaffingQuotaRow {
  positionId: string;
  positionName: string;
  group: PositionGroup;
  currentCount: number; // Số người thực tế hiện có
  allocatedQuota: number; // Số biên chế cấp có thẩm quyền đã giao
  calculatedNeed: number; // Nhu cầu tính theo định mức TT 20/2023/TT-BGDĐT
  concurrentArrangement?: string; // Phương án kiêm nhiệm
  contractArrangement?: string; // Hợp đồng theo NĐ 111/2022
  variance: number; // Thừa (+) / Thiếu (-) = allocatedQuota - calculatedNeed
  proposalNote: string;
}

export interface StepStatus {
  step: number;
  title: string;
  purpose: string;
  isCompleted: boolean;
  isConfirmed: boolean;
  confirmedAt?: string;
  notes?: string;
}

export interface SchemeDossier {
  schoolInfo: ImpactFactors;
  tasks: TaskItem[];
  staff: StaffMember[];
  positions: PositionItem[];
  jobDescriptions: Record<string, JobDescriptionCard>;
  quotas: StaffingQuotaRow[];
  stepProgress: Record<number, StepStatus>;
  legalBasisList: string[];
  implementationPlan: {
    submissionDate: string;
    appraisalAgency: string;
    targetEffectiveDate: string;
    transitionSteps: string[];
  };
}
