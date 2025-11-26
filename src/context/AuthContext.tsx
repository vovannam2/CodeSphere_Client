import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/apis/auth.api';
import { storage } from '@/utils/storage';
import type { LoginRequest, RegisterRequest, User } from '@/types/auth.types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  googleAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = storage.getUser();
        const token = storage.getToken();
        
        if (storedUser && token) {
          // Đảm bảo user object có đầy đủ properties
          // Lấy id từ nhiều nguồn có thể (id, userId, user_id)
          const userId = storedUser.id ?? (storedUser as any)?.userId ?? (storedUser as any)?.user_id;
          
          if (userId && (typeof userId === 'number' || typeof userId === 'string')) {
            const userData: User = {
              id: Number(userId),
              email: storedUser.email ?? '',
              username: storedUser.username ?? '',
              role: storedUser.role ?? '',
              avatar: storedUser.avatar,
            };
            
            setUser(userData);
            // Cập nhật lại storage với user object đã được normalize (chỉ nếu cần)
            if (!storedUser.id || storedUser.id !== userData.id) {
              storage.setUser(userData);
            }
          } else {
            // Nếu không có id, vẫn set user
            setUser(storedUser as User);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Không clear storage ngay, chỉ log error
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      storage.setToken(response.token);
      storage.setRefreshToken(response.refreshToken);
      
      const userData: User = {
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      };
      
      storage.setUser(userData);
      setUser(userData);
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      storage.setToken(response.token);
      storage.setRefreshToken(response.refreshToken);
      
      const userData: User = {
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      };
      
      storage.setUser(userData);
      setUser(userData);
      toast.success('Đăng ký thành công!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    storage.clear();
    setUser(null);
    toast.success('Đăng xuất thành công!');
  };

  const googleAuth = async () => {
    try {
      // Redirect directly to backend OAuth2 endpoint
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';
      window.location.href = `${backendUrl}/oauth2/authorization/google`;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi xác thực Google';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    googleAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

