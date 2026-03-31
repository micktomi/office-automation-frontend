import { InsuranceView } from '@/components/InsuranceView'

interface PoliciesPageSearchParams {
  status?: string
}

interface PoliciesPageProps {
  searchParams?: Promise<PoliciesPageSearchParams>
}

export default async function PoliciesPage({ searchParams }: PoliciesPageProps) {
  const resolvedSearchParams = await searchParams
  const initialTab = resolvedSearchParams?.status === 'expired' ? 'expired' : 'expiring'
  return <InsuranceView initialTab={initialTab} />
}
