import { Skeleton } from '../components/ui'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

