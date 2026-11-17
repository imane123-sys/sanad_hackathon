import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-2xl border border-[#E4D2EE] bg-[#FDFBFE] px-4 py-2.5 text-sm text-[#22102E] transition-all duration-200 placeholder:text-[#9F8CAD] focus-visible:outline-none focus-visible:border-[#6A2586] focus-visible:ring-4 focus-visible:ring-[#6A2586]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#381B4B] dark:bg-[#1A0E24] dark:text-slate-100 dark:placeholder:text-[#78618B]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
