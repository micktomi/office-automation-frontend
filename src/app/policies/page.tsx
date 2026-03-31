import InsurancePage from '../dashboard/insurance/page'

interface PoliciesPageProps {
  searchParams?: {
    status?: string
  }
}

export default function PoliciesPage({ searchParams }: PoliciesPageProps) {
  const initialTab = searchParams?.status === 'expired' ? 'expired' : 'expiring'
  return <InsurancePage initialTab={initialTab} />
}
