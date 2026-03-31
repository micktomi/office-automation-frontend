import { InboxView } from '@/components/InboxView'

interface EmailsPageSearchParams {
  status?: string
}

interface EmailsPageProps {
  searchParams?: Promise<EmailsPageSearchParams>
}

export default async function EmailsPage({ searchParams }: EmailsPageProps) {
  const resolvedSearchParams = await searchParams
  const mode = resolvedSearchParams?.status === 'all' ? 'all' : 'pending'
  return <InboxView mode={mode} />
}
