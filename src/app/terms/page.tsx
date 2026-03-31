import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for the Γραφείο AI demo app.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-text">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service - Demo app</h1>
          <p className="text-text-muted">
            This page exists so the public app has a real, reachable terms URL for OAuth review.
          </p>
        </div>

        <section className="space-y-5 rounded-3xl border border-border bg-surface/70 p-6 shadow-xl shadow-black/20">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Use of the service</h2>
            <p className="leading-7 text-text-muted">
              The demo app is provided to support internal office workflows and connected Google services.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">User responsibility</h2>
            <p className="leading-7 text-text-muted">
              Users are responsible for keeping their credentials secure and for using the service in
              accordance with applicable laws and account policies.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Changes</h2>
            <p className="leading-7 text-text-muted">
              These terms may be updated as the application evolves.
            </p>
          </div>
        </section>

        <Link href="/" className="text-sm font-semibold text-primary transition hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
