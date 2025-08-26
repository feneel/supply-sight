import { createServer } from 'node:http'
import { createYoga, createSchema } from 'graphql-yoga'

type Product = {
  id: string
  name: string
  sku: string
  warehouse: string
  stock: number
  demand: number
}

let products: Product[] = [
  { id: 'P-1001', name: '12mm Hex Bolt', sku: 'HEX-12-100', warehouse: 'BLR-A', stock: 180, demand: 120 },
  { id: 'P-1002', name: 'Steel Washer', sku: 'WSR-08-500', warehouse: 'BLR-A', stock: 50, demand: 80 },
  { id: 'P-1003', name: 'M8 Nut', sku: 'NUT-08-200', warehouse: 'PNQ-C', stock: 80, demand: 80 },
  { id: 'P-1004', name: 'Bearing 608ZZ', sku: 'BRG-608-50', warehouse: 'DEL-B', stock: 24, demand: 120 },
  { id: 'P-1005', name: 'Aluminum Spacer', sku: 'SPC-10-050', warehouse: 'BLR-A', stock: 300, demand: 120 },
  { id: 'P-1006', name: 'Spring Pin 4x16', sku: 'PIN-04-016', warehouse: 'DEL-B', stock: 40, demand: 60 },
  { id: 'P-1007', name: 'M6 Socket Screw', sku: 'SCR-M6-020', warehouse: 'PNQ-C', stock: 95, demand: 50 },
  { id: 'P-1008', name: 'Circlip 8mm', sku: 'CRC-008', warehouse: 'BLR-A', stock: 10, demand: 25 },
  { id: 'P-1009', name: 'Grease Pack 50g', sku: 'GRS-050', warehouse: 'DEL-B', stock: 200, demand: 140 },
  { id: 'P-1010', name: 'Countersunk Screw M4', sku: 'CSS-M4-012', warehouse: 'PNQ-C', stock: 12, demand: 12 },
  { id: 'P-1011', name: 'Shim Set 0.5mm', sku: 'SHM-05-SET', warehouse: 'DEL-B', stock: 8, demand: 30 },
  { id: 'P-1012', name: 'O-Ring 12x2', sku: 'ORG-012-2', warehouse: 'BLR-A', stock: 500, demand: 480 }
]

function statusOf(stock: number, demand: number): 'HEALTHY' | 'LOW' | 'CRITICAL' {
  if (stock > demand) return 'HEALTHY'
  if (stock === demand) return 'LOW'
  return 'CRITICAL'
}
function warehouses() { return Array.from(new Set(products.map(p => p.warehouse))).sort() }
function computeKPI(list: Product[]) {
  const totalStock = list.reduce((a, p) => a + p.stock, 0)
  const totalDemand = list.reduce((a, p) => a + p.demand, 0)
  const served = list.reduce((a, p) => a + Math.min(p.stock, p.demand), 0)
  const fillRatePct = totalDemand === 0 ? 100 : (served / totalDemand) * 100
  return { totalStock, totalDemand, fillRatePct }
}
function seededFactor(seed: string) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return 0.95 + (h % 1000) / 1000 * 0.1 // ~[0.95,1.05]
}
function trend(range: 'R7'|'R14'|'R30') {
  const days = range === 'R7' ? 7 : range === 'R14' ? 14 : 30
  const base = computeKPI(products)
  const out: { date: string, stock: number, demand: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const f = seededFactor(ds)
    out.push({ date: ds, stock: Math.round(base.totalStock * f), demand: Math.round(base.totalDemand * (2 - f)) })
  }
  return out
}
function connection(args: any) {
  const { search, warehouse, status, page = 1, pageSize = 10 } = args
  let list = products.slice()
  if (search && String(search).trim()) {
    const q = String(search).toLowerCase()
    list = list.filter(p => `${p.name} ${p.sku} ${p.id}`.toLowerCase().includes(q))
  }
  if (warehouse) list = list.filter(p => p.warehouse === warehouse)
  if (status) list = list.filter(p => statusOf(p.stock, p.demand) === status)
  const total = list.length
  const start = (page - 1) * pageSize
  const slice = list.slice(start, start + pageSize)
  return {
    edges: slice.map(node => ({ node: { ...node, status: statusOf(node.stock, node.demand) } })),
    pageInfo: { total, page, pageSize }
  }
}

const typeDefs = /* GraphQL */ `
  enum Status { HEALTHY LOW CRITICAL }
  enum Range { R7 R14 R30 }

  type Product {
    id: ID!
    name: String!
    sku: String!
    warehouse: String!
    stock: Int!
    demand: Int!
    status: Status!
  }

  type KPI { totalStock: Int!, totalDemand: Int!, fillRatePct: Float! }
  type TrendPoint { date: String!, stock: Int!, demand: Int! }
  type KPISeries { kpi: KPI!, trend: [TrendPoint!]! }

  type ProductEdge { node: Product! }
  type PageInfo { total: Int!, page: Int!, pageSize: Int! }
  type ProductConnection { edges: [ProductEdge!]!, pageInfo: PageInfo! }

  type Query {
    warehouses: [String!]!
    kpis(range: Range!): KPISeries!
    products(search: String, warehouse: String, status: Status, page: Int = 1, pageSize: Int = 10): ProductConnection!
  }

  type Mutation {
    updateDemand(id: ID!, demand: Int!): Product!
    transferStock(id: ID!, quantity: Int!): Product!
  }
`

const resolvers = {
  Query: {
    warehouses: () => warehouses(),
    kpis: (_: any, { range }: { range: 'R7'|'R14'|'R30' }) => ({ kpi: computeKPI(products), trend: trend(range) }),
    products: (_: any, args: any) => connection(args)
  },
  Mutation: {
    updateDemand: (_: any, { id, demand }: { id: string, demand: number }) => {
      if (demand < 0) throw new Error('Demand cannot be negative')
      const i = products.findIndex(p => p.id === id)
      if (i === -1) throw new Error('Product not found')
      products[i] = { ...products[i], demand }
      return { ...products[i], status: statusOf(products[i].stock, products[i].demand) }
    },
    transferStock: (_: any, { id, quantity }: { id: string, quantity: number }) => {
      if (quantity <= 0) throw new Error('Quantity must be > 0')
      const i = products.findIndex(p => p.id === id)
      if (i === -1) throw new Error('Product not found')
      products[i] = { ...products[i], stock: Math.max(0, products[i].stock - quantity) }
      return { ...products[i], status: statusOf(products[i].stock, products[i].demand) }
    }
  }
}

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  cors: { origin: ['http://localhost:5173','http://127.0.0.1:5173'], credentials: false },
  graphqlEndpoint: '/graphql'
})

const server = createServer(yoga)
server.listen(4000, () => console.log('\n🚀 API ready at http://localhost:4000/graphql'))
