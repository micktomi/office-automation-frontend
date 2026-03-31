import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Γραφείο AI demo app.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-text">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy - Demo app</h1>
          <p className="text-text-muted">
            This page exists so the public app has a real, reachable privacy policy URL for OAuth review.
          </p>
        </div>

        <section className="space-y-5 rounded-3xl border border-border bg-surface/70 p-6 shadow-xl shadow-black/20">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">What we collect</h2>
            <p className="leading-7 text-text-muted">
              The app may process account identifiers, profile details, and operational data needed to
              run the office assistant workflow.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">How we use data</h2>
            <p className="leading-7 text-text-muted">
              We use the data to authenticate users, sync connected services, and provide the features
              visible inside the application.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="leading-7 text-text-muted">
              For questions about this demo privacy page, contact the application owner through the main app.
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
