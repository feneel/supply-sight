import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_WAREHOUSES } from './queries'
import type { Status } from './types'

export interface Filters { q: string; wh: string | null; st: Status | 'ALL' }

export default function FiltersRow({ value, onChange }: { value: Filters; onChange: (v: Filters) => void }) {
  const { data } = useQuery(GET_WAREHOUSES)
  const [local, setLocal] = useState(value)

  useEffect(() => setLocal(value), [value])
  useEffect(() => { const t = setTimeout(() => onChange(local), 250); return () => clearTimeout(t) }, [local])

  const warehouses: string[] = useMemo(() => data?.warehouses ?? [], [data])

  return (
    <div className="card card-pad flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        placeholder="Search by name, SKU, or ID"
        className="w-full sm:max-w-sm rounded-md border px-3 py-2"
        value={local.q}
        onChange={e => setLocal({ ...local, q: e.target.value })}
      />
      <div className="flex gap-2">
        <select className="rounded-md border px-3 py-2" value={local.wh ?? ''} onChange={e => setLocal({ ...local, wh: e.target.value || null })}>
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select className="rounded-md border px-3 py-2" value={local.st} onChange={e => setLocal({ ...local, st: e.target.value as any })}>
          <option value="ALL">All Status</option>
          <option value="HEALTHY">Healthy</option>
          <option value="LOW">Low</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>
  )
}
