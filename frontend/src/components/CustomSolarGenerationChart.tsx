import { Card } from "@/components/ui/card";

export function CustomSolarGenerationChart({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];

  return (
    <Card className="p-3 shadow-lg border border-slate-200 rounded-lg bg-white/95">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>

      <p className="flex items-center gap-2 text-sm">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: "var(--color-estimated_generation_kwh)" }}
        />
        <span className="text-slate-600">Geração Estimada:</span>
        <strong className="text-slate-800">{item.value} kWh</strong>
      </p>
    </Card>
  );
}
