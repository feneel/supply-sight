import type { Range } from "../features/dashboard/types";
const ranges: { key: Range; label: string }[] = [
  { key: 'R7', label: '7d' }, { key: 'R14', label: '14d' }, { key: 'R30', label: '30d' },
]

export default function TopBar({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold tracking-tight">SupplySight</div>
        <div className="flex gap-2">
          {ranges.map(r => (
            <button
              key={r.key}
              onClick={() => onChange(r.key)}
              className={`pill ${range === r.key ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-pressed={range === r.key}
            >{r.label}</button>
          ))}
        </div>
      </div>
    </header>
  )
}
