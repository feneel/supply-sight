import { gql } from '@apollo/client'

export const GET_WAREHOUSES = gql`
  query Warehouses { warehouses }
`

export const GET_KPIS = gql`
  query Kpis($range: Range!) {
    kpis(range: $range) {
      kpi { totalStock totalDemand fillRatePct }
      trend { date stock demand }
    }
  }
`

export const GET_PRODUCTS = gql`
  query Products($search: String, $warehouse: String, $status: Status, $page: Int!, $pageSize: Int!) {
    products(search: $search, warehouse: $warehouse, status: $status, page: $page, pageSize: $pageSize) {
      pageInfo { total page pageSize }
      edges { node { id name sku warehouse stock demand status } }
    }
  }
`

export const UPDATE_DEMAND = gql`
  mutation UpdateDemand($id: ID!, $demand: Int!) {
    updateDemand(id: $id, demand: $demand) { id demand stock status }
  }
`

export const TRANSFER_STOCK = gql`
  mutation TransferStock($id: ID!, $quantity: Int!) {
    transferStock(id: $id, quantity: $quantity) { id stock demand status }
  }
`
