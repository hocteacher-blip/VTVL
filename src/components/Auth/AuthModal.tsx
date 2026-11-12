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
  X,
  Sparkles,
  Phone,
  Inbox,
  Copy,
  Check,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalState, closeAuthModal, login, register, verifyOtp, resendOtp } = useAuth();
  const { isOpen, defaultTab, prefillEmail, testOtp } = authModalState;

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
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [currentTestOtp, setCurrentTestOtp] = useState<string | undefined>(testOtp);

  // Countdown timer for OTP
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins = 900s

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      if (prefillEmail) {
        setEmail(prefillEmail);
      }
      if (testOtp) {
        setCurrentTestOtp(testOtp);
      }
      setErrorMessage('');
      setSuccessMessage('');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeLeft(900);
    }
  }, [isOpen, defaultTab, prefillEmail, testOtp]);

  // Timer countdown
  useEffect(() => {
    if (activeTab === 'VERIFY' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, timeLeft]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
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
          // Account exists but not verified yet!
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide">
            Cổng Xác Thực & Quản Lý Đề Án VTVL
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Quy trình 9 bước xây dựng Vị trí việc làm — Bộ Giáo dục & Đào tạo
          </p>

          {/* Navigation Tabs (if not currently in VERIFY mode) */}
          {activeTab !== 'VERIFY' && (
            <div className="flex bg-indigo-950/60 p-1 rounded-xl mt-5 border border-indigo-700/50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LOGIN');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'LOGIN'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-indigo-200 hover:text-white'
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
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Đăng ký tài khoản mới
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Địa chỉ Gmail đăng ký</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ví dụ: gv.nguyenvana@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Quy định bảo mật tài khoản:</span>
                </div>
                <p>Tài khoản phải được đăng ký trước và kích hoạt bằng mã xác nhận gửi về Gmail thì mới có hiệu lực đăng nhập.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{isSubmitting ? 'Đang kiểm tra...' : 'Đăng nhập vào Hệ thống'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('REGISTER');
                    setErrorMessage('');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Chưa có tài khoản? Đăng ký ngay để nhận mã qua Gmail
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Họ và tên cán bộ <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Nguyễn Văn Tuấn"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Địa chỉ Gmail nhận mã <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nhap.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đơn vị trường công tác</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ví dụ: Trường THCS Chu Văn An"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cấp học quản lý</span>
                  </label>
                  <select
                    value={schoolLevel}
                    onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TIEU_HOC">Trường Tiểu học</option>
                    <option value="THCS">Trường Trung học cơ sở (THCS)</option>
                    <option value="LIEN_CAP_TH_THCS">Trường Liên cấp TH & THCS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chức vụ / Vị trí đảm nhiệm
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Hiệu trưởng">Hiệu trưởng / Chủ tịch Hội đồng</option>
                    <option value="Phó Hiệu trưởng">Phó Hiệu trưởng</option>
                    <option value="Tổ trưởng chuyên môn">Tổ trưởng chuyên môn</option>
                    <option value="Giáo viên">Giáo viên phụ trách Đề án</option>
                    <option value="Văn thư - Nhân sự">Nhân viên Văn thư / Kế toán</option>
                    <option value="Chuyên viên PGD">Chuyên viên Phòng GD&ĐT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Số điện thoại (tùy chọn)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mật khẩu (≥ 6 ký tự) <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nhập lại mật khẩu <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Xác nhận mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showRegisterConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bước kế tiếp:</strong> Hệ thống sẽ gửi mã xác nhận 6 số đến Gmail của bạn. Bạn cần nhập mã này để tài khoản được kích hoạt và có hiệu lực.
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>{isSubmitting ? 'Đang gửi mã xác nhận...' : 'Đăng ký & Gửi mã xác nhận về Gmail'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setErrorMessage('');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Đã có tài khoản? Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: VERIFY OTP (BƯỚC ĐIỀN MÃ XÁC NHẬN TỪ GMAIL ĐỂ TÀI KHOẢN CÓ HIỆU LỰC) */}
          {activeTab === 'VERIFY' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-1">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xác nhận mã kích hoạt từ Gmail
                </h3>
                <p className="text-xs text-slate-500">
                  Mã 6 chữ số đã được gửi tới: <br />
                  <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{email || 'Gmail của bạn'}</strong>
                </p>
              </div>

              {/* Simulated / Direct Gmail Inbox Banner */}
              {currentTestOtp && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/50 dark:to-indigo-950/50 border border-emerald-300 dark:border-emerald-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Inbox className="w-4 h-4 text-emerald-600" />
                      <span>Thông báo Hộp thư Gmail đến</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">Vừa xong</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <p>Tiêu đề: <strong>[VTVL GD&ĐT] Mã xác thực kích hoạt tài khoản</strong></p>
                    <p className="mt-1">
                      Mã xác nhận gửi về là:{' '}
                      <span className="font-mono font-bold text-base text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700">
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
                      <Sparkles className="w-3 h-3" />
                      <span>Điền nhanh mã này</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(currentTestOtp);
                        setCopiedOtp(true);
                        setTimeout(() => setCopiedOtp(false), 2000);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                    >
                      {copiedOtp ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOtp ? 'Đã sao chép' : 'Sao chép mã'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center block">
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
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Countdown & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Thời gian hiệu lực: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatTimer(timeLeft)}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Gửi lại mã qua Gmail</span>
                </button>
              </div>

              {/* Submit Activation */}
              <button
                type="submit"
                disabled={isSubmitting || otpDigits.join('').length !== 6}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isSubmitting ? 'Đang xác thực...' : 'Xác thực & Kích hoạt tài khoản ngay'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                >
                  Quay lại màn hình đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
