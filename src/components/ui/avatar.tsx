import { cn } from '@/lib/utils';
import { generateInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm:  'w-7 h-7 text-xs',
  md:  'w-9 h-9 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = generateInitials(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        'bg-gradient-to-br from-violet-500/30 to-violet-700/30 border border-violet-500/20 text-violet-300',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover rounded-full" />
      ) : (
        initials
      )}
    </div>
  );
}
