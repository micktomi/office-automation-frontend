import { InsuranceView } from '@/components/InsuranceView'

interface InsurancePageSearchParams {
  status?: string
}

interface InsurancePageProps {
  searchParams?: Promise<InsurancePageSearchParams>
}

export default async function InsurancePage({ searchParams }: InsurancePageProps) {
  const resolvedSearchParams = await searchParams
  const initialTab = resolvedSearchParams?.status === 'expired' ? 'expired' : 'expiring'
  return <InsuranceView initialTab={initialTab} />
}
