import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const base =
    'inline-flex items-center justify-center rounded-[8px] px-4 py-2 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 gap-2';

const buttonVariants = cva(base, {
    variants: {
        variant: {
            default:
                'bg-[var(--primary-solid)] text-[var(--primary-contrast)] shadow-[var(--shadow-soft)] hover:brightness-105 active:scale-[0.99]',
            secondary:
                'border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-[var(--shadow-soft)] hover:border-[var(--primary)] hover:text-[var(--primary-contrast)]',
            ghost: 'bg-transparent text-[var(--text)] hover:bg-[var(--surface)]'
        },
        size: {
            default: 'h-11',
            sm: 'h-10 text-xs px-3'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return <Comp className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
    }
);

Button.displayName = 'Button';

export { Button };