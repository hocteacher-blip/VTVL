import React, { useState, useEffect } from 'react';
import {
  SchoolLevel,
  ImpactFactors,
  TaskItem,
  StaffMember,
  PositionItem,
  JobDescriptionCard,
  StaffingQuotaRow,
  StepStatus,
  SchemeDossier,
} from './types/scheme';
import {
  STEP_DEFINITIONS,
  STANDARDIZED_POSITIONS,
  DEFAULT_TASKS,
  DEFAULT_PRIMARY_STAFF,
  DEFAULT_JOB_DESCRIPTIONS,
  INITIAL_PRIMARY_IMPACT,
  INITIAL_SECONDARY_IMPACT,
} from './data/defaultData';
import { generateInitialQuotas, calculateStatutoryQuotas } from './utils/statutoryCalculations';
import { exportSchemeToWord, exportQuotasToExcel } from './utils/exportUtils';
import { export11SheetsFullExcel } from './utils/export11SheetsExcel';
import { Header } from './components/Header';
import { StepNavigation } from './components/StepNavigation';
import { Step1TaskInventory } from './components/StepContent/Step1TaskInventory';
import { Step2TaskGrouping } from './components/StepContent/Step2TaskGrouping';
import { Step3ImpactFactors } from './components/StepContent/Step3ImpactFactors';
import { Step4StaffAudit } from './components/StepContent/Step4StaffAudit';
import { Step5PositionCatalog } from './components/StepContent/Step5PositionCatalog';
import { Step6JobDescription } from './components/StepContent/Step6JobDescription';
import { Step7StaffingQuotas } from './components/StepContent/Step7StaffingQuotas';
import { Step8FullSchemeDossier } from './components/StepContent/Step8FullSchemeDossier';
import { Step9AppraisalExecution } from './components/StepContent/Step9AppraisalExecution';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { LegalReferencesModal } from './components/LegalReferencesModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { Sparkles, Bot, ArrowRight, ShieldCheck, Download, Calculator, CheckCircle2, UserCheck, LogIn, UserPlus } from 'lucide-react';

function MainAppContent() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [level, setLevel] = useState<SchoolLevel>('TIEU_HOC');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('workflow');

  // School Profile & Factor data
  const [schoolInfo, setSchoolInfo] = useState<ImpactFactors>(INITIAL_PRIMARY_IMPACT);

  // 9-Step Steps progress
  const [steps, setSteps] = useState<StepStatus[]>(STEP_DEFINITIONS);

  // Core Data
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_PRIMARY_STAFF);
  const [positions, setPositions] = useState<PositionItem[]>(STANDARDIZED_POSITIONS);
  const [jobDescriptions, setJobDescriptions] = useState<Record<string, JobDescriptionCard>>(DEFAULT_JOB_DESCRIPTIONS);
  const [quotas, setQuotas] = useState<StaffingQuotaRow[]>(() => generateInitialQuotas(INITIAL_PRIMARY_IMPACT));

  // Modals & Drawers
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Synchronize school profile when user logs in
  useEffect(() => {
    if (user && user.isVerified) {
      if (user.schoolName && user.schoolName !== 'Trường phổ thông công lập') {
        setSchoolInfo((prev) => ({
          ...prev,
          schoolName: user.schoolName,
          level: user.schoolLevel || prev.level,
        }));
        if (user.schoolLevel) {
          setLevel(user.schoolLevel);
        }
      }
    }
  }, [user]);

  // Switch between Primary, Secondary, and Multi-Level without injecting mock data
  const handleSelectLevel = (newLevel: SchoolLevel) => {
    if (newLevel === level) return;
    setLevel(newLevel);
    setSchoolInfo((prev) => {
      const updated: ImpactFactors = {
        ...prev,
        level: newLevel,
        primaryClasses: newLevel === 'LIEN_CAP_TH_THCS' ? (prev.primaryClasses ?? Math.round(prev.totalClasses / 2)) : prev.primaryClasses,
        secondaryClasses: newLevel === 'LIEN_CAP_TH_THCS' ? (prev.secondaryClasses ?? Math.max(0, prev.totalClasses - (prev.primaryClasses ?? Math.round(prev.totalClasses / 2)))) : prev.secondaryClasses,
      };
      if (updated.totalClasses > 0) {
        setQuotas(generateInitialQuotas(updated));
      }
      return updated;
    });
  };

  // Re-generate quotas when totalClasses or sessionType changes
  const handleUpdateSchoolInfo = (info: ImpactFactors) => {
    setSchoolInfo(info);
    if (info.level !== level) {
      setLevel(info.level);
    }
    setQuotas(generateInitialQuotas(info));
  };

  // Step Confirmation Gate
  const handleConfirmStep = (stepNumber: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.step === stepNumber
          ? { ...s, isConfirmed: true, confirmedAt: new Date().toISOString().split('T')[0] }
          : s
      )
    );
  };

  // Build full dossier object
  const fullDossier: SchemeDossier = {
    schoolInfo,
    tasks,
    staff,
    positions,
    jobDescriptions,
    quotas,
    stepProgress: steps.reduce((acc, cur) => ({ ...acc, [cur.step]: cur }), {}),
    legalBasisList: [
      'Nghị định số 232/2026/NĐ-CP của Chính phủ',
      'Nghị định số 106/2020/NĐ-CP của Chính phủ',
      'Thông tư số 20/2023/TT-BGDĐT của Bộ GD&ĐT',
      'Nghị định số 111/2022/NĐ-CP của Chính phủ',
    ],
    implementationPlan: {
      submissionDate: '2026-11-20',
      appraisalAgency: 'Phòng GD&ĐT và Phòng Nội vụ cấp huyện',
      targetEffectiveDate: '2026-12-01',
      transitionSteps: [
        'Hội đồng trường tổ chức họp biểu quyết thông qua Đề án',
        'Hoàn tất Tờ trình và gửi hồ sơ đề nghị thẩm định',
        'Tiếp thu, giải trình ý kiến thẩm định của cơ quan chuyên môn',
        'UBND cấp huyện ban hành Quyết định phê duyệt Đề án VTVL',
        'Tổ chức sắp xếp, bố trí nhân sự và tuyển dụng bổ sung theo định mức',
      ],
    },
  };

  const calc = calculateStatutoryQuotas(schoolInfo);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* 1. Header (Strict Top Bar Contract) */}
      <Header
        currentLevel={level}
        schoolName={schoolInfo.schoolName}
        onSelectLevel={handleSelectLevel}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        onExportWord={() => exportSchemeToWord(fullDossier)}
        onExportExcel11Sheets={() => export11SheetsFullExcel(fullDossier)}
        onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Sub-Header: School Banner & Metrics Overview */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                {schoolInfo.level === 'LIEN_CAP_TH_THCS'
                  ? 'Trường Liên cấp TH & THCS'
                  : schoolInfo.level === 'THCS'
                  ? 'Trường THCS'
                  : 'Trường Tiểu học'}
              </span>
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {schoolInfo.schoolName || 'Chưa nhập tên trường'}
              </h1>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 font-medium">
                {schoolInfo.totalClasses > 0 ? calc.schoolTierName : 'Chưa nhập quy mô'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Quy mô:</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {schoolInfo.totalClasses > 0
                    ? schoolInfo.level === 'LIEN_CAP_TH_THCS'
                      ? `${schoolInfo.totalClasses} lớp (TH: ${schoolInfo.primaryClasses || 0}, THCS: ${schoolInfo.secondaryClasses || 0})`
                      : `${schoolInfo.totalClasses} lớp (${schoolInfo.totalStudents} HS)`
                    : '0 lớp (0 HS)'}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-200 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Định mức GV:</span>
                <span className="font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {schoolInfo.totalClasses > 0
                    ? schoolInfo.level === 'LIEN_CAP_TH_THCS'
                      ? `${calc.maxTeachersTotal} GV (TH: 1.5, THCS: 1.9)`
                      : `${calc.maxTeachersRate} GV/lớp (${calc.maxTeachersTotal} GV)`
                    : schoolInfo.level === 'LIEN_CAP_TH_THCS'
                    ? 'TH: 1.5 / THCS: 1.9 GV/lớp'
                    : `${calc.maxTeachersRate} GV/lớp`}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-200 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Biên chế đề xuất:</span>
                <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {calc.totalCivilServantQuotas} người
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Authentication & Gmail Activation Notice Banner (if not authenticated) */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-emerald-950/40 border-b border-indigo-200 dark:border-indigo-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Quy định truy cập:</span>{' '}
                <span>Tài khoản phải được đăng ký trước. Hệ thống sẽ gửi mã xác nhận về Gmail, sau khi điền mã từ Gmail tài khoản mới có hiệu lực.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => openAuthModal('LOGIN')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => openAuthModal('REGISTER')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Đăng ký nhận mã qua Gmail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Workflow 9-Step Stepper (Visible when in workflow mode) */}
      {activeTab === 'workflow' && (
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onSelectStep={(s) => setCurrentStep(s)}
        />
      )}

      {/* 4. Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workflow' && (
          <div>
            {currentStep === 1 && (
              <Step1TaskInventory
                tasks={tasks}
                onUpdateTasks={setTasks}
                isConfirmed={steps[0].isConfirmed}
                onConfirm={() => handleConfirmStep(1)}
                onNextStep={() => setCurrentStep(2)}
                schoolInfo={schoolInfo}
              />
            )}

            {currentStep === 2 && (
              <Step2TaskGrouping
                tasks={tasks}
                onUpdateTasks={setTasks}
                isConfirmed={steps[1].isConfirmed}
                onConfirm={() => handleConfirmStep(2)}
                onNextStep={() => setCurrentStep(3)}
                onPrevStep={() => setCurrentStep(1)}
                schoolInfo={schoolInfo}
              />
            )}

            {currentStep === 3 && (
              <Step3ImpactFactors
                schoolInfo={schoolInfo}
                onUpdateSchoolInfo={handleUpdateSchoolInfo}
                isConfirmed={steps[2].isConfirmed}
                onConfirm={() => handleConfirmStep(3)}
                onNextStep={() => setCurrentStep(4)}
                onPrevStep={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <Step4StaffAudit
                staff={staff}
                onUpdateStaff={setStaff}
                isConfirmed={steps[3].isConfirmed}
                onConfirm={() => handleConfirmStep(4)}
                onNextStep={() => setCurrentStep(5)}
                onPrevStep={() => setCurrentStep(3)}
                schoolInfo={schoolInfo}
              />
            )}

            {currentStep === 5 && (
              <Step5PositionCatalog
                positions={positions}
                onUpdatePositions={setPositions}
                isConfirmed={steps[4].isConfirmed}
                onConfirm={() => handleConfirmStep(5)}
                onNextStep={() => setCurrentStep(6)}
                onPrevStep={() => setCurrentStep(4)}
                schoolInfo={schoolInfo}
              />
            )}

            {currentStep === 6 && (
              <Step6JobDescription
                positions={positions}
                jobDescriptions={jobDescriptions}
                onUpdateJobDescriptions={setJobDescriptions}
                isConfirmed={steps[5].isConfirmed}
                onConfirm={() => handleConfirmStep(6)}
                onNextStep={() => setCurrentStep(7)}
                onPrevStep={() => setCurrentStep(5)}
                schoolInfo={schoolInfo}
              />
            )}

            {currentStep === 7 && (
              <Step7StaffingQuotas
                quotas={quotas}
                onUpdateQuotas={setQuotas}
                isConfirmed={steps[6].isConfirmed}
                onConfirm={() => handleConfirmStep(7)}
                onNextStep={() => setCurrentStep(8)}
                onPrevStep={() => setCurrentStep(6)}
                schoolInfo={schoolInfo}
              />
            )}

            {currentStep === 8 && (
              <Step8FullSchemeDossier
                dossier={fullDossier}
                isConfirmed={steps[7].isConfirmed}
                onConfirm={() => handleConfirmStep(8)}
                onNextStep={() => setCurrentStep(9)}
                onPrevStep={() => setCurrentStep(7)}
              />
            )}

            {currentStep === 9 && (
              <Step9AppraisalExecution
                dossier={fullDossier}
                isConfirmed={steps[8].isConfirmed}
                onConfirm={() => handleConfirmStep(9)}
                onPrevStep={() => setCurrentStep(8)}
              />
            )}
          </div>
        )}

        {activeTab === 'dossier' && (
          <Step8FullSchemeDossier
            dossier={fullDossier}
            isConfirmed={steps[7].isConfirmed}
            onConfirm={() => handleConfirmStep(8)}
            onNextStep={() => {
              setActiveTab('workflow');
              setCurrentStep(9);
            }}
            onPrevStep={() => {
              setActiveTab('workflow');
              setCurrentStep(7);
            }}
          />
        )}

        {activeTab === 'quotas' && (
          <Step7StaffingQuotas
            quotas={quotas}
            onUpdateQuotas={setQuotas}
            isConfirmed={steps[6].isConfirmed}
            onConfirm={() => handleConfirmStep(7)}
            onNextStep={() => {
              setActiveTab('workflow');
              setCurrentStep(8);
            }}
            onPrevStep={() => {
              setActiveTab('workflow');
              setCurrentStep(6);
            }}
            schoolInfo={schoolInfo}
          />
        )}
      </main>

      {/* Floating Action Button for AI Consultant */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAIDrawerOpen(true)}
          className="inline-flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-medium text-xs border border-indigo-500"
          title="Mở trợ lý Chuyên gia cao cấp về Đề án Vị trí việc làm"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">Chuyên gia AI Tư vấn VTVL</span>
        </button>
      </div>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        schoolInfo={schoolInfo}
        currentStep={currentStep}
      />

      {/* Legal References Modal */}
      <LegalReferencesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Account Login, Register & Gmail OTP Verification Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
