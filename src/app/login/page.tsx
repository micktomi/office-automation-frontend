'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { apiService } from '@/lib/api'
import locales from '@/locales/el.json'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-text">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const googleStatus = searchParams.get('google')
    const reason = searchParams.get('reason')

    if (googleStatus === 'connected') {
      setSuccess("Η σύνδεση με Google ολοκληρώθηκε!")
      ;(async () => {
        try {
          const existing = localStorage.getItem('token')
          if (!existing) {
            const loginResp = await apiService.devLogin()
            if (loginResp?.access_token) {
              localStorage.setItem('token', loginResp.access_token)
            }
          }
          setTimeout(() => router.push('/dashboard'), 700)
        } catch {
          setError("Η σύνδεση Google ολοκληρώθηκε, αλλά απέτυχε η τοπική συνεδρία.")
        }
      })()
    } else if (googleStatus === 'error') {
      const decodedReason = reason ? decodeURIComponent(reason) : 'Άγνωστο σφάλμα OAuth.'
      setError(`Αποτυχία Google OAuth: ${decodedReason}`)
    }
  }, [router, searchParams])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      // Ensure a local session token exists before redirecting to Google
      if (!localStorage.getItem('token')) {
        const loginResp = await apiService.devLogin()
        const token = loginResp?.access_token
        if (!token) {
          setError("Αποτυχία σύνδεσης: Δεν ελήφθη token.")
          return
        }
        localStorage.setItem('token', token)
      }

      const authData = await apiService.getGoogleAuthUrl()
      if (authData.auth_url) {
        window.location.href = authData.auth_url
      } else {
        setError("Δεν βρέθηκε URL σύνδεσης με Google.")
      }
    } catch (err) {
      console.error("Google Auth failed", err)
      setError("Αποτυχία σύνδεσης με Google.")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-text">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-6">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">{locales.app.title}</h1>
          <p className="text-text-muted italic">Ο AI συνεργάτης του γραφείου σας</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
          >
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.64l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {locales.auth.google_login}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
