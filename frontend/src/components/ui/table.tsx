import * as React from 'react';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => <table ref={ref} className={`w-full caption-bottom text-sm ${className ?? ''}`} {...props} />
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <thead ref={ref} className={`[&_tr]:border-b ${className ?? ''}`} {...props} />
    )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className ?? ''}`} {...props} />
    )
);
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr ref={ref} className={`border-b transition-colors hover:bg-[var(--table-row-hover)] ${className ?? ''}`} {...props} />
    )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <th
            ref={ref}
            className={`h-12 px-6 text-left align-middle text-xs font-semibold text-[var(--table-muted)] ${className ?? ''}`}
            {...props}
        />
    )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <td ref={ref} className={`px-6 py-4 align-middle text-[var(--table-text)] ${className ?? ''}`} {...props} />
    )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => (
        <caption ref={ref} className={`mt-4 text-sm text-[var(--muted)] ${className ?? ''}`} {...props} />
    )
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption };