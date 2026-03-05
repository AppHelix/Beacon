"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  const primaryNav = [
    { href: "/", label: "Home" },
    { href: "/engagements", label: "Engagements" },
    { href: "/signals", label: "Signals" },
    { href: "/people", label: "People" },
    { href: "/admin", label: "Admin" },
  ];

  const quickActions = [
    {
      href: "/engagements",
      icon: "📋",
      title: "Engagements",
      description: "Browse projects, clients, and delivery status.",
      cta: "Open Engagement Catalog",
      accent: "bg-blue-600 hover:bg-blue-700",
    },
    {
      href: "/signals",
      icon: "🔔",
      title: "Signals",
      description: "Find blockers, post help requests, and track progress.",
      cta: "Open Signal Board",
      accent: "bg-amber-600 hover:bg-amber-700",
    },
    {
      href: "/people",
      icon: "👥",
      title: "People",
      description: "Find teammates by role and collaboration context.",
      cta: "Open People Directory",
      accent: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      href: "/admin",
      icon: "⚙️",
      title: "Admin",
      description: "Manage users, settings, and system governance.",
      cta: "Open Admin Console",
      accent: "bg-slate-700 hover:bg-slate-800",
    },
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-100 text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
            <p className="text-sm font-semibold tracking-wide text-blue-400">AppHelix Internal Platform</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Beacon</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              One place to discover engagements, post or resolve Signals, and connect with the right people across teams.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-slate-200">1. Discover</p>
                <p className="mt-1 text-sm text-slate-400">Search active engagements and current priorities.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-slate-200">2. Collaborate</p>
                <p className="mt-1 text-sm text-slate-400">Raise or respond to Signals with clear ownership.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-slate-200">3. Deliver</p>
                <p className="mt-1 text-sm text-slate-400">Track outcomes and scale proven solutions.</p>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={() => signIn("azure-ad")}
                className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
              >
                Sign In with Azure AD
              </button>
              <p className="mt-3 text-sm text-slate-400">Internal use only — AppHelix employees and authorized members.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🚀 Beacon</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {primaryNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  item.href === "/"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Start Here</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Use Beacon in 3 simple steps</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Discover active work, collaborate through Signals, and connect with the right people. Use the cards below to navigate quickly.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Step 1:</span> Open Engagements to understand current projects.
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Step 2:</span> Visit Signals to ask for help or respond to blockers.
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Step 3:</span> Use People/Admin for collaboration and governance.
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => (
            <article
              key={action.href}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-3xl" aria-hidden="true">{action.icon}</div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900">{action.title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">{action.description}</p>
              <Link
                href={action.href}
                className={`mt-5 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition ${action.accent}`}
              >
                {action.cta}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">Need guidance?</h3>
          <p className="mt-3 text-slate-600">
            New to Beacon? Start with Engagements, then move to Signals when you need help or can contribute expertise.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Use consistent filters to narrow by status, urgency, and role.</li>
            <li>Open detail pages to understand context before taking action.</li>
            <li>Capture outcomes clearly so future users can reuse solutions.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
