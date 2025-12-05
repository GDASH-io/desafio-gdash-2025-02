import { Card } from "@/components/ui/card"

export function CustomSolarRadiationTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null

  const p = payload[0]

  return (
    <Card className="p-3 shadow-lg border border-slate-200 rounded-lg bg-white/95">
      <p className="font-semibold text-slate-700 mb-1">
        {label}
      </p>

      <div className="flex items-center gap-2 text-sm">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: "var(--color-solar_radiation)" }}
        />

        <span className="text-slate-600">Radiação:</span>
        <strong className="text-slate-800">
          {p.value} Wh/m²
        </strong>
      </div>
    </Card>
  )
}
