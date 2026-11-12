import React, { useState, useEffect, useRef } from 'react';
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
  Inbox,
  Copy,
  Check,
  BookOpen,
  FileSpreadsheet,
  Layers,
  FileText,
} from 'lucide-react';

export const AuthPortalScreen: React.FC = () => {
  const { login, register, verifyOtp, resendOtp, authModalState } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'VERIFY'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('TIEU_HOC');
  const [role, setRole] = useState('Hiệu trưởng');
  const [phoneNumber, setPhoneNumber] = useState('');

  // OTP inputs: 6 digits
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [currentTestOtp, setCurrentTestOtp] = useState<string | undefined>(authModalState.testOtp);

  // Countdown timer for OTP
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (activeTab === 'VERIFY' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const clean = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFillTestOtp = () => {
    if (currentTestOtp && currentTestOtp.length === 6) {
      setOtpDigits(currentTestOtp.split(''));
      setSuccessMessage('Đã tự động điền mã xác nhận từ hòm thư Gmail!');
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await login({ email: email.trim(), password });
      if (!res.success) {
        if (res.needsVerification) {
          setCurrentTestOtp(res.testOtp);
          setActiveTab('VERIFY');
          setErrorMessage(res.message);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi kết nối tới máy chủ đăng nhập.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: gv.nguyenvana@gmail.com).');
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

      if (res.success) {
        setCurrentTestOtp(res.testOtp);
        setActiveTab('VERIFY');
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi trong quá trình đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Verify OTP
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác nhận gửi về Gmail.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp({
        email: email.trim(),
        otp: otpCode,
      });

      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi xác thực mã OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!email) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await resendOtp(email.trim());
      if (res.success) {
        setCurrentTestOtp(res.testOtp);
        setTimeLeft(900);
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể gửi lại mã xác nhận.');
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
            <span>Cổng xác thực an toàn cán bộ quản lý trường học</span>
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

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-3 text-xs text-indigo-200">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Quy định bảo mật tài khoản:</strong> Tài khoản phải được đăng ký trước. Hệ thống sẽ gửi mã xác nhận 6 số về Gmail đã đăng ký. Sau khi điền mã từ Gmail tài khoản mới có hiệu lực để quản lý dữ liệu đề án của trường.
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Xác thực Gmail OTP
                </span>
              </div>

              {/* Toggle Tabs if not in OTP verification */}
              {activeTab !== 'VERIFY' && (
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
              )}
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
                      <span>Địa chỉ Gmail đăng ký</span>
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
                    <span>{isSubmitting ? 'Đang xác thực tài khoản...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
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
                      Chưa có tài khoản? Bấm vào đây để đăng ký nhận mã qua Gmail
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
                      <span>Địa chỉ Gmail nhận mã xác thực <span className="text-rose-400">*</span></span>
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
                        <span>Mật khẩu <span className="text-rose-400">*</span></span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Nhập lại mật khẩu <span className="text-rose-400">*</span></span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      Hệ thống sẽ gửi mã xác nhận 6 số đến Gmail này. Cần điền mã để kích hoạt tài khoản.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    <span>{isSubmitting ? 'Đang gửi mã xác nhận...' : 'ĐĂNG KÝ & GỬI MÃ VỀ GMAIL'}</span>
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

              {/* TAB 3: VERIFY OTP (ĐIỀN MÃ TỪ GMAIL ĐỂ TÀI KHOẢN CÓ HIỆU LỰC) */}
              {activeTab === 'VERIFY' && (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 mb-1">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Xác Nhận Mã Kích Hoạt Từ Gmail
                    </h3>
                    <p className="text-xs text-slate-400">
                      Mã xác thực 6 số đã được gửi tới: <br />
                      <strong className="text-indigo-400 font-mono text-sm">{email || 'Gmail của bạn'}</strong>
                    </p>
                  </div>

                  {/* Simulated / Direct Gmail Inbox Banner */}
                  {currentTestOtp && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-indigo-950/70 border border-emerald-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <Inbox className="w-4 h-4 text-emerald-400" />
                          <span>Hộp thư Gmail nhận được:</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Vừa nhận</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <p>Tiêu đề: <strong>[VTVL GD&ĐT] Mã xác thực kích hoạt tài khoản</strong></p>
                        <p className="mt-1">
                          Mã xác nhận là:{' '}
                          <span className="font-mono font-bold text-base text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40">
                            {currentTestOtp}
                          </span>
                        </p>
                      </div>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleFillTestOtp}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Điền nhanh mã này</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentTestOtp);
                            setCopiedOtp(true);
                            setTimeout(() => setCopiedOtp(false), 2000);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 flex items-center gap-1"
                        >
                          {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedOtp ? 'Đã sao chép' : 'Sao chép mã'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6 Digit Inputs */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 text-center block">
                      Nhập mã 6 chữ số từ email:
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border border-slate-700 bg-slate-800 text-amber-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Countdown & Resend */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      Thời hạn mã: <strong className="text-slate-200 font-mono">{formatTimer(timeLeft)}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Gửi lại mã qua Gmail</span>
                    </button>
                  </div>

                  {/* Submit Activation */}
                  <button
                    type="submit"
                    disabled={isSubmitting || otpDigits.join('').length !== 6}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{isSubmitting ? 'Đang xác thực...' : 'XÁC THỰC & KÍCH HOẠT TÀI KHOẢN'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('LOGIN');
                        setErrorMessage('');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Quay lại màn hình đăng nhập
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
