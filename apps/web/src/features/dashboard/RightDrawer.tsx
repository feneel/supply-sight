import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client/react';
import type { Product } from './types'
import { UPDATE_DEMAND, TRANSFER_STOCK, GET_PRODUCTS, GET_KPIS } from './queries'

export default function RightDrawer({
  open, onClose, product,
}: { open: boolean; onClose: () => void; product: Product | null }) {
  const [demand, setDemand] = useState<number>(0)
  const [qty, setQty] = useState<number>(0)

  useEffect(() => {
    setDemand(product?.demand ?? 0)
    setQty(0)
  }, [product?.id, product?.demand])

  const [updateDemand, { loading: udLoading }] = useMutation(UPDATE_DEMAND, {
    refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_KPIS }],
  })
  const [transferStock, { loading: tsLoading }] = useMutation(TRANSFER_STOCK, {
    refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_KPIS }],
  })

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-white border-l shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Product Details</h2>
          <button className="rounded-md border px-3 py-1" onClick={onClose}>Close</button>
        </div>

        {!product ? (
          <div className="mt-6">No product selected.</div>
        ) : (
          <>
            <div className="mt-4 space-y-1 text-sm">
              <div className="font-medium">{product.name}</div>
              <div className="text-gray-500">{product.id} • {product.sku}</div>
              <div className="text-gray-500">Warehouse: {product.warehouse}</div>
              <div>Stock: <b>{product.stock}</b> | Demand: <b>{product.demand}</b> | Status: <b>{product.status}</b></div>
            </div>

            <div className="mt-6 card card-pad">
              <div className="font-medium">Update Demand</div>
              <div className="mt-2 flex gap-2">
                <input
                  type="number" min={0} className="rounded-md border px-3 py-2 w-32"
                  value={demand} onChange={e => setDemand(Math.max(0, parseInt(e.target.value || '0', 10)))}
                />
                <button
                  className="rounded-md border px-3 py-2 disabled:opacity-50"
                  disabled={udLoading}
                  onClick={async () => {
                    if (!product) return
                    await updateDemand({ variables: { id: product.id, demand } })
                    alert('Demand updated')
                  }}
                >Save</button>
              </div>
            </div>

            <div className="mt-4 card card-pad">
              <div className="font-medium">Transfer Stock (deduct from this item)</div>
              <div className="mt-2 flex gap-2">
                <input
                  type="number" min={1} className="rounded-md border px-3 py-2 w-32"
                  value={qty} onChange={e => setQty(Math.max(0, parseInt(e.target.value || '0', 10)))}
                />
                <button
                  className="rounded-md border px-3 py-2 disabled:opacity-50"
                  disabled={tsLoading || qty <= 0}
                  onClick={async () => {
                    if (!product || qty <= 0) return
                    await transferStock({ variables: { id: product.id, quantity: qty } })
                    alert('Stock transferred')
                    setQty(0)
                  }}
                >Transfer</button>
              </div>
              <div className="mt-2 text-xs text-gray-500">Mock action: subtracts from current stock.</div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
