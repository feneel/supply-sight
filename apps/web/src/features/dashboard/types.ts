export type Status = 'HEALTHY' | 'LOW' | 'CRITICAL'
export type Range = 'R7' | 'R14' | 'R30'

export interface KPI { totalStock: number; totalDemand: number; fillRatePct: number }
export interface TrendPoint { date: string; stock: number; demand: number }
export interface KPISeries { kpi: KPI; trend: TrendPoint[] }

export interface Product {
  id: string; name: string; sku: string; warehouse: string; stock: number; demand: number; status: Status
}
export interface PageInfo { total: number; page: number; pageSize: number }
export interface ProductEdge { node: Product }
export interface ProductConnection { edges: ProductEdge[]; pageInfo: PageInfo }
