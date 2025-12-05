import { Card } from "@/components/ui/card";

export function CustomTemperatureTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const min = payload.find((p) => p.dataKey === "tmin");
  const max = payload.find((p) => p.dataKey === "tmax");

  return (
    <Card className="p-3 shadow-lg border border-slate-200 rounded-lg bg-white/95">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>

      <div className="space-y-1 text-sm">
        <p className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-tmax)" }}
          />
          <span className="text-slate-600">Temp. Máxima:</span>
          <strong className="text-slate-800">{max?.value}°C</strong>
        </p>
        <p className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--color-tmin)" }}
          />
          <span className="text-slate-600">Temp. Mínima:</span>
          <strong className="text-slate-800">{min?.value}°C</strong>
        </p>
      </div>
    </Card>
  );
}
