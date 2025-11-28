import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const cardVariants = cva('rounded-[8px] border theme-border theme-card p-6 shadow-[var(--shadow-soft)]');

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
    <div ref={ref} className={cardVariants({ className })} {...props} />
));

Card.displayName = 'Card';

export { Card };