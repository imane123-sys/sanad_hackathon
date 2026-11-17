import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#541B6B] via-[#6A2586] to-[#8031A0] text-white font-bold shadow-sm hover:brightness-105 active:scale-[0.99]',
        sanad:
          'bg-gradient-to-r from-[#541B6B] via-[#6A2586] to-[#8031A0] text-white font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99]',
        sanadOutline:
          'border-2 border-[#5c1f75] text-[#5c1f75] bg-white hover:bg-[#f4ecf9] font-bold dark:bg-transparent dark:text-[#d8b4e8] dark:border-[#8e45b3]',
        sanadAccent:
          'bg-gradient-to-r from-[#f43f5e] to-[#fb923c] text-white font-bold shadow-md hover:brightness-105',
        sanadSubtle:
          'bg-[#f4ecf9] text-[#5c1f75] hover:bg-[#ebdef3] dark:bg-[#2b1338] dark:text-[#e8d1f5] font-semibold',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm font-semibold',
        outline:
          'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
        ghost:
          'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
        link: 'text-[#5c1f75] underline-offset-4 hover:underline dark:text-[#c48ce0]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base font-bold',
        pill: 'h-11 rounded-full px-7 text-sm font-bold',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
