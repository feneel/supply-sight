import { useQuery } from '@apollo/client/react'
import { GET_PRODUCTS } from './queries'
import type { Product, Status } from './types'
import StatusPill from '../../components/StatusPill'

export default function ProductsTable({
  search, warehouse, status, page, pageSize, onPage, onRowClick
}: {
  search: string; warehouse: string | null; status: Status | 'ALL';
  page: number; pageSize: number; onPage: (p: number) => void;
  onRowClick: (p: Product) => void;
}) {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { search: search || null, warehouse: warehouse || null, status: status === 'ALL' ? null : status, page, pageSize },
    fetchPolicy: 'cache-and-network'
  })

  if (error) return <div className="card card-pad text-red-600">Error: {error.message}</div>

  const edges: { node: Product }[] = data?.products?.edges ?? []
  const pageInfo = data?.products?.pageInfo ?? { total: 0, page, pageSize }

  return (
    <div className="card card-pad">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Product</th><th>SKU</th><th>Warehouse</th>
              <th className="text-right">Stock</th><th className="text-right">Demand</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-2"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                  <td><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                  <td className="text-right"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                  <td className="text-right"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                  <td><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                </tr>
              ))
            ) : edges.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">No matching products</td></tr>
            ) : (
              edges.map(({ node }) => (
                <tr key={node.id} className={node.status === 'CRITICAL' ? 'bg-red-50 cursor-pointer' : 'cursor-pointer'}
                    onClick={() => onRowClick(node)}>
                  <td className="py-2">
                    <div className="font-medium">{node.name}</div>
                    <div className="text-xs text-gray-500">{node.id}</div>
                  </td>
                  <td>{node.sku}</td>
                  <td>{node.warehouse}</td>
                  <td className="text-right">{node.stock}</td>
                  <td className="text-right">{node.demand}</td>
                  <td><StatusPill status={node.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <div className="text-gray-500 mr-2">
          {pageInfo.total === 0 ? '0' : (pageInfo.page - 1) * pageInfo.pageSize + 1}
          –{Math.min(pageInfo.page * pageInfo.pageSize, pageInfo.total)} of {pageInfo.total}
        </div>
        <button className="rounded-md border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
        <button className="rounded-md border px-3 py-1 disabled:opacity-50"
          disabled={page * pageInfo.pageSize >= pageInfo.total} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  )
}
