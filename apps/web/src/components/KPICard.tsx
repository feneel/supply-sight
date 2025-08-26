export default function KPICard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card card-pad">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  )
}
