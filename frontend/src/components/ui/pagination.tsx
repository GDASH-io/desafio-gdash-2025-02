import * as React from 'react';

function Pagination({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            className={`flex w-full justify-end ${className ?? ''}`}
            {...props}
        />
    );
}

function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
    return <ul className={`flex flex-wrap items-center gap-2 ${className ?? ''}`} {...props} />;
}

function PaginationItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
    return <li className={`${className ?? ''}`} {...props} />;
}

interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    isActive?: boolean;
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
    return (
        <a
            className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-md border border-[var(--border)] px-3 text-sm font-medium transition hover:bg-[var(--table-row-hover)] ${
                isActive ? 'bg-[var(--table-header)] text-[var(--text)]' : 'text-[var(--text)]'
            } ${className ?? ''}`}
            {...props}
        />
    );
}

function PaginationPrevious(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <PaginationLink aria-label="Previous page" {...props}>
            Anterior
        </PaginationLink>
    );
}

function PaginationNext(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <PaginationLink aria-label="Next page" {...props}>
            Próximo
        </PaginationLink>
    );
}

function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={`inline-flex h-9 w-9 items-center justify-center text-[var(--muted)] ${className ?? ''}`}
            {...props}
        >
            ...
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
};