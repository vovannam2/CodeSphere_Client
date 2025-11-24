import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/Input';
import Button from '@/components/Button';
import GoogleAuthButton from './GoogleAuthButton';
import { ROUTES } from '@/utils/constants';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
      });
      navigate(ROUTES.HOME);
    } catch (error) {
      // Error đã được xử lý trong AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Tên người dùng"
        type="text"
        {...register('username')}
        error={errors.username?.message}
        placeholder="johndoe"
        required
      />

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="your.email@example.com"
        required
      />

      <Input
        label="Mật khẩu"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="••••••••"
        helperText="Tối thiểu 6 ký tự"
        required
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
        placeholder="••••••••"
        required
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Đăng ký
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc</span>
        </div>
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-medium">
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;

