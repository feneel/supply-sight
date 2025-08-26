import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import type { TrendPoint } from './types'

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const d = useMemo(() => data ?? [], [data])
  return (
    <div className="card card-pad h-72">
      <div className="mb-2 text-sm text-gray-500">Stock vs Demand</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={d}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="stock" dot={false} />
          <Line type="monotone" dataKey="demand" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
