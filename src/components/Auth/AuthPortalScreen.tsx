import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SchoolLevel } from '../../types/scheme';
import {
  Mail,
  Lock,
  User,
  Building,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Phone,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

export const AuthPortalScreen: React.FC = () => {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('TIEU_HOC');
  const [role, setRole] = useState('Hiệu trưởng');
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await login({ email: email.trim(), password });
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi kết nối tới máy chủ đăng nhập.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Register - Đăng ký là đăng nhập được tài khoản ngay lập tức
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Vui lòng nhập địa chỉ Email/Gmail hợp lệ (ví dụ: gv.nguyenvana@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu bảo mật phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        schoolName: schoolName.trim(),
        schoolLevel,
        role,
        phoneNumber: phoneNumber.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi trong quá trình đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top National Header Bar */}
      <div className="border-b border-indigo-900/50 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs">
              GD
            </span>
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-200">
                BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỆ THỐNG QUẢN LÝ VTVL
              </div>
              <div className="text-[11px] text-indigo-300">
                Nghị định 232/2026/NĐ-CP & Thông tư số 20/2023/TT-BGDĐT
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cổng đăng nhập cán bộ quản lý trường học</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left Side: System Introduction & Legal Compliance */}
        <div className="w-full lg:w-1/2 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quy trình chuẩn hóa 9 bước ngành Giáo dục & Đào tạo</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Phần Mềm Xây Dựng & Thẩm Định Đề Án Vị Trí Việc Làm
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Hỗ trợ đầy đủ các trường <b>Tiểu học</b>, <b>Trung học cơ sở (THCS)</b> và <b>Trường liên cấp TH & THCS</b> công lập thực hiện chuẩn hóa danh mục vị trí việc làm, xác định định mức biên chế và xuất trọn bộ hồ sơ thẩm định.
            </p>
          </div>

          {/* 3 Key Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Nghị định 232/2026</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Phân loại chuẩn 4 nhóm vị trí việc làm và cơ cấu viên chức theo chức danh nghề nghiệp.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Trọn bộ 11 Biểu Excel</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tự động kết xuất trọn bộ 11 sheet (A1 đến D2 & DM sản phẩm) trong 1 file Excel duy nhất.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Layers className="w-4 h-4" />
                <span>Trường Liên cấp</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tính toán chính xác tỷ lệ phân định giáo viên Tiểu học (1.5) và THCS (1.9 GV/lớp).
              </p>
            </div>
          </div>

          {/* Fast Access Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-3 text-xs text-indigo-200">
            <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong>Đăng ký tài khoản nhanh chóng:</strong> Thầy/Cô chỉ cần đăng ký tài khoản là có thể đăng nhập ngay để xây dựng, quản lý và kết xuất Đề án Vị trí việc làm của nhà trường.
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-slate-900/90 rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden backdrop-blur-xl">
            {/* Box Header Tabs */}
            <div className="p-5 pb-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm uppercase tracking-wider text-slate-200">
                    Cổng Đăng Nhập & Đăng Ký
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Đăng ký dùng ngay
                </span>
              </div>

              {/* Toggle Tabs */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'LOGIN'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đăng nhập hệ thống
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('REGISTER');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'REGISTER'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đăng ký tài khoản mới
                </button>
              </div>
            </div>

            {/* Form Container */}
            <div className="p-6">
              {/* Alert Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="flex-1">{successMessage}</div>
                </div>
              )}

              {/* TAB 1: LOGIN */}
              {activeTab === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Địa chỉ Email / Gmail</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nhap.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Mật khẩu</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{isSubmitting ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('REGISTER');
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Chưa có tài khoản? Bấm vào đây để đăng ký tài khoản mới
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: REGISTER */}
              {activeTab === 'REGISTER' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Họ và tên cán bộ quản lý / giáo viên <span className="text-rose-400">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Nguyễn Văn Tuấn"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Địa chỉ Email / Gmail <span className="text-rose-400">*</span></span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="gv.nguyenvana@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Trường học</span>
                      </label>
                      <input
                        type="text"
                        placeholder="THCS Chu Văn An"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Cấp học</span>
                      </label>
                      <select
                        value={schoolLevel}
                        onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="TIEU_HOC">Tiểu học</option>
                        <option value="THCS">THCS</option>
                        <option value="LIEN_CAP_TH_THCS">Liên cấp TH & THCS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Chức vụ
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Hiệu trưởng">Hiệu trưởng</option>
                        <option value="Phó Hiệu trưởng">Phó Hiệu trưởng</option>
                        <option value="Tổ trưởng chuyên môn">Tổ trưởng chuyên môn</option>
                        <option value="Giáo viên">Giáo viên phụ trách Đề án</option>
                        <option value="Văn thư - Nhân sự">Văn thư / Kế toán</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Điện thoại</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="09xx xxx xxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Mật khẩu (≥ 6 ký tự) <span className="text-rose-400">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                          title={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Nhập lại mật khẩu <span className="text-rose-400">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegisterConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Xác nhận mật khẩu"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                          title={showRegisterConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ VÀ VÀO HỆ THỐNG NGAY'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('LOGIN');
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Đã có tài khoản? Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Copyright */}
      <footer className="border-t border-indigo-950/80 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>
            Phần mềm Hướng dẫn & Xây dựng Vị trí việc làm 9 bước — Đơn vị sự nghiệp GD&ĐT công lập
          </div>
          <div className="text-slate-300 font-medium flex items-center justify-center gap-1.5 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>
              Bản quyền do thầy <strong className="text-indigo-400 font-bold">Lê Thái Học</strong> — Trường Tiểu học Trần Quốc Toản — Phường Hạ Long — Thành phố Quảng Ninh phát triển
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
