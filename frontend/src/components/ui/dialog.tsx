import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
    ({ className, ...props }, ref) => (
        <DialogPrimitive.Overlay
            ref={ref}
            className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity',
                className
            )}
            {...props}
        />
    )
);
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
    ({ className, children, ...props }, ref) => (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_20px_45px_rgba(15,15,15,0.25)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
                    className
                )}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1', className)} {...props} />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-wrap items-center justify-end gap-2 pt-4', className)} {...props} />
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <DialogPrimitive.Title
            ref={ref}
            className={cn('text-lg font-semibold text-[var(--text)]', className)}
            {...props}
        />
    )
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <DialogPrimitive.Description
            ref={ref}
            className={cn('text-sm text-[var(--muted)]', className)}
            {...props}
        />
    )
);
DialogDescription.displayName = 'DialogDescription';

const DialogClose = DialogPrimitive.Close;

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose
};
