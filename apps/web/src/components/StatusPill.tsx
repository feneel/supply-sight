import type { Status } from '../features/dashboard/types'
export default function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    HEALTHY: 'bg-green-100 text-green-800',
    LOW: 'bg-yellow-100 text-yellow-800',
    CRITICAL: 'bg-red-100 text-red-800',
  }
  return <span className={`pill ${map[status]}`}>{status}</span>
}
