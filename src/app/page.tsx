import Link from "next/link";

const highlights = [
  "Διαχείριση εργασιών και πελατών σε ένα dashboard",
  "Email, SMS και ημερολόγιο με AI-assisted ροές",
  "Καθαρό landing page για OAuth verification",
];

export default function RootPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.16),_transparent_34%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-text-muted">
              Productivity Agent
            </p>
            <h1 className="mt-2 text-xl font-semibold">Γραφείο AI</h1>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-border/80 bg-surface/70 px-4 py-2 text-sm font-medium text-text transition hover:border-primary/60 hover:text-primary"
          >
            Sign in
          </Link>
        </header>

        <section className="grid gap-8 py-14 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-20">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Official app landing page
            </span>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
                AI workflow for office operations, clients, and follow-ups.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-text-muted md:text-lg">
                This is the public homepage used for OAuth verification and app discovery.
                It points to the live product experience, legal pages, and login flow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-[#06281d] transition hover:brightness-110"
              >
                Open app
              </Link>
              <Link
                href="/privacy"
                className="rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-text transition hover:border-accent/50 hover:text-accent"
              >
                Privacy policy
              </Link>
              <Link
                href="/terms"
                className="rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-text transition hover:border-accent/50 hover:text-accent"
              >
                Terms of service
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-surface/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">
                What you get
              </p>
              <ul className="space-y-3">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm leading-6 text-text"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-border/70 py-5 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 Γραφείο AI</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-text">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-text">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
