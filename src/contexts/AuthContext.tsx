import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginPayload, RegisterPayload, VerifyOtpPayload, AuthApiResponse } from '../types/auth';
import { apiLogin, apiRegister, apiVerifyOtp, apiResendOtp, apiGetMe } from '../services/authService';

interface AuthModalState {
  isOpen: boolean;
  defaultTab: 'LOGIN' | 'REGISTER' | 'VERIFY';
  prefillEmail?: string;
  testOtp?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalState: AuthModalState;
  login: (payload: LoginPayload) => Promise<AuthApiResponse>;
  register: (payload: RegisterPayload) => Promise<AuthApiResponse>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<AuthApiResponse>;
  resendOtp: (email: string) => Promise<AuthApiResponse>;
  logout: () => void;
  openAuthModal: (defaultTab?: 'LOGIN' | 'REGISTER' | 'VERIFY', prefillEmail?: string, testOtp?: string) => void;
  closeAuthModal: () => void;
}

const LOCAL_STORAGE_KEY = 'vtvl_authenticated_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalState, setAuthModalState] = useState<AuthModalState>({
    isOpen: false,
    defaultTab: 'LOGIN',
  });

  // Khởi tạo từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        if (parsed?.isVerified) {
          setUser(parsed);
          // Đồng bộ lại với server
          apiGetMe(parsed.email)
            .then((res) => {
              if (res.success && res.user) {
                setUser(res.user);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.user));
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error('Error reading auth from localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (defaultTab: 'LOGIN' | 'REGISTER' | 'VERIFY' = 'LOGIN', prefillEmail?: string, testOtp?: string) => {
    setAuthModalState({
      isOpen: true,
      defaultTab,
      prefillEmail,
      testOtp,
    });
  };

  const closeAuthModal = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const login = async (payload: LoginPayload): Promise<AuthApiResponse> => {
    const res = await apiLogin(payload);
    if (res.success && res.user && res.user.isVerified) {
      setUser(res.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.user));
      closeAuthModal();
    }
    return res;
  };

  const register = async (payload: RegisterPayload): Promise<AuthApiResponse> => {
    const res = await apiRegister(payload);
    if (res.success) {
      // Chuyển sang bước xác nhận OTP từ Gmail
      openAuthModal('VERIFY', payload.email, res.testOtp);
    }
    return res;
  };

  const verifyOtp = async (payload: VerifyOtpPayload): Promise<AuthApiResponse> => {
    const res = await apiVerifyOtp(payload);
    if (res.success && res.user && res.user.isVerified) {
      setUser(res.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.user));
      closeAuthModal();
    }
    return res;
  };

  const resendOtp = async (email: string): Promise<AuthApiResponse> => {
    const res = await apiResendOtp(email);
    if (res.success && res.testOtp) {
      setAuthModalState((prev) => ({
        ...prev,
        testOtp: res.testOtp,
      }));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.isVerified,
        isLoading,
        authModalState,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
