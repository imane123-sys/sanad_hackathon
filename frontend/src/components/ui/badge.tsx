import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-[#E8D4F3] bg-[#F4ECF9] text-[#5C1F75] hover:bg-[#EBDEF3] dark:border-[#441C59] dark:bg-[#2B1338] dark:text-[#E8D1F5]',
        sanad:
          'border-transparent bg-gradient-to-r from-[#541B6B] to-[#7B2FA1] text-white shadow-xs',
        sanadSubtle:
          'border-[#E8D4F3] bg-[#F4ECF9] text-[#5C1F75] dark:border-[#441C59] dark:bg-[#2B1338] dark:text-[#E8D1F5]',
        coral:
          'border-[#FFD9D1] bg-[#FFF0ED] text-[#E85943] dark:border-[#521C16] dark:bg-[#2D0F0A] dark:text-[#FFA394]',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
        destructive:
          'border-transparent bg-rose-600 text-white hover:bg-rose-700',
        outline:
          'text-[#5C1F75] dark:text-[#E8D1F5] border-[#EBDCF3] dark:border-[#381B4B]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
