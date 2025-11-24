import type { User } from '@/types/auth.types';

interface AvatarProps {
  user?: User | null;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar = ({ user, src, alt, size = 'md', className = '' }: AvatarProps) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const imageSrc = src || user?.avatar;
  const displayName = alt || user?.username || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`
        ${sizes[size]} rounded-full bg-gray-300 flex items-center justify-center
        font-medium text-gray-700 overflow-hidden ${className}
      `}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={displayName} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;

