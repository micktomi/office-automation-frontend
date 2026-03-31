import { InboxView } from '@/components/InboxView'

interface InboxPageSearchParams {
  status?: string
}

interface InboxPageProps {
  searchParams?: Promise<InboxPageSearchParams>
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const resolvedSearchParams = await searchParams
  const mode = resolvedSearchParams?.status === 'all' ? 'all' : 'pending'
  return <InboxView mode={mode} />
}
