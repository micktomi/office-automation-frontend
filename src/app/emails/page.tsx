import InboxPage from '../dashboard/inbox/page'

interface EmailsPageProps {
  searchParams?: {
    status?: string
  }
}

export default function EmailsPage({ searchParams }: EmailsPageProps) {
  const mode = searchParams?.status === 'all' ? 'all' : 'pending'
  return <InboxPage mode={mode} />
}
