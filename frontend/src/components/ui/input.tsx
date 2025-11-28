import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const inputVariants = cva(
    'w-full rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-[14px] py-3 text-base text-[var(--text)] placeholder-[var(--muted)] shadow-[var(--shadow-soft)] transition focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
    {
        variants: {
            variant: {
                default: ''
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, variant, ...props }, ref) => (
    <input ref={ref} className={inputVariants({ variant, className })} {...props} />
));

Input.displayName = 'Input';

export { Input };