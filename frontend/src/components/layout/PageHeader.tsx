interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <header className="space-y-2">
            <h1 className="text-4xl font-bold theme-text">{title}</h1>
            <p className="theme-muted">{description}</p>
        </header>
    );
}