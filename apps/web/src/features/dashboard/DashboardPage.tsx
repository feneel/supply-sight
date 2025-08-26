import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import TopBar from '../../components/TopBar'
import KPICard from '../../components/KPICard'
import FiltersRow,  {  type Filters } from './FiltersRow'
import ProductsTable from './ProductsTable'
import TrendChart from './TrendChart'
import RightDrawer from './RightDrawer'
import { GET_KPIS } from './queries'
import type { Range, Product } from './types'

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('R7')
  const [filters, setFilters] = useState<Filters>({ q: '', wh: null, st: 'ALL' })
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, loading, error } = useQuery(GET_KPIS, { variables: { range } })
  const kpi = data?.kpis?.kpi
  const trend = data?.kpis?.trend ?? []

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)

  function onOpenRow(p: Product) { setSelected(p); setDrawerOpen(true) }
  function onFiltersChange(v: Filters) { setFilters(v); setPage(1) }

  return (
    <div className="min-h-screen">
      <TopBar range={range} onChange={setRange} />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard label="Total Stock" value={loading ? '…' : kpi?.totalStock ?? 0} />
          <KPICard label="Total Demand" value={loading ? '…' : kpi?.totalDemand ?? 0} />
          <KPICard label="Fill Rate" value={loading ? '…' : `${(kpi?.fillRatePct ?? 0).toFixed(1)}%`} hint="sum(min(stock, demand)) / sum(demand)" />
        </div>

        <TrendChart data={trend} />

        <FiltersRow value={filters} onChange={onFiltersChange} />

        <ProductsTable
          search={filters.q}
          warehouse={filters.wh}
          status={filters.st}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          onRowClick={onOpenRow}
        />

        {error && <div className="text-red-600">Error loading KPIs: {error.message}</div>}
      </main>

      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} product={selected} />
    </div>
  )
}
