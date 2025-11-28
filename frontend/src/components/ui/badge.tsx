import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary';
}

const variantClasses: Record<'default' | 'secondary', string> = {
    default: 'bg-[var(--primary-solid)] text-[var(--primary-contrast)]',
    secondary: 'border border-[var(--border)] bg-[var(--card)] text-[var(--text)]'
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => {
    const resolved = variant ?? 'default';
    return (
        <span
            ref={ref}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${variantClasses[resolved]} ${className ?? ''}`}
            {...props}
        />
    );
});

Badge.displayName = 'Badge';

export { Badge };
