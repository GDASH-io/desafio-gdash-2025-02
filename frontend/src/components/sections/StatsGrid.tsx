import { Card } from '../ui/card';

type StatsGridProps = {
    items: { label: string; value: string }[];
};

export function StatsGrid({ items }: StatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {items.map((card) => (
                <Card key={card.label}>
                    <p className="text-xs uppercase tracking-[0.3em] theme-muted">{card.label}</p>
                    <p className="mt-2 capitalize text-2xl font-semibold text-[var(--text)]">{card.value}</p>
                </Card>
            ))}
        </div>
    );
}