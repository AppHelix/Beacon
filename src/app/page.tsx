"use client";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  Activity,
  Bell,
  FolderKanban,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarLayout } from "@/components/SidebarLayout";

export default function Home() {
  const { data: session, status } = useSession();

  // Get user role for RBAC
  const userRole = (session?.user as any)?.role?.toLowerCase();
  const canAccessAdmin = userRole === 'admin' || userRole === 'curator';

  const quickActions = [
    {
      href: "/engagements",
      icon: FolderKanban,
      tip: "Engagement catalog",
      title: "Engagements",
      description: "Browse projects, clients, and delivery status.",
      cta: "Open Engagement Catalog",
      variant: "default" as const,
    },
    {
      href: "/signals",
      icon: Bell,
      tip: "Signal board",
      title: "Signals",
      description: "Find blockers, post help requests, and track progress.",
      cta: "Open Signal Board",
      variant: "secondary" as const,
    },
    {
      href: "/people",
      icon: Users,
      tip: "People directory",
      title: "People",
      description: "Find teammates by role and collaboration context.",
      cta: "Open People Directory",
      variant: "outline" as const,
    },
    {
      href: "/admin",
      icon: Shield,
      tip: "Admin console",
      title: "Admin",
      description: "Manage users, settings, and system governance.",
      cta: "Open Admin Console",
      variant: "ghost" as const,
      requiresAdmin: true, // RBAC flag
    },
  ];

  // Filter actions based on user role
  const filteredActions = quickActions.filter(action => {
    if (action.requiresAdmin) {
      return canAccessAdmin;
    }
    return true;
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to Beacon</h1>
          <p className="text-gray-300 dark:text-slate-400 mb-8 text-lg">Your platform for collaborative knowledge sharing</p>
          <Button
            onClick={() => signIn("azure-ad")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg px-8 py-3"
          >
            Sign In with Azure AD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout title="Home" description="Welcome back to your dashboard">
      {/* Search Bar (Desktop Only) */}
      <div className="mb-8 hidden lg:block">
        <div className="relative">
          <Input
            placeholder="Search engagements, signals, people..."
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-white dark:to-slate-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Activity className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-wide">Quick Start</p>
          </div>
          <CardTitle className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Use Beacon in 3 simple steps
          </CardTitle>
          <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
            Discover active work, collaborate through Signals, and connect with the right people.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-800 p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">1</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Discover</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Open Engagements to understand current projects</p>
            </div>
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-800 p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">2</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Collaborate</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Visit Signals to ask for help or respond to blockers</p>
            </div>
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-800 p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">3</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Connect</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use People/Admin for collaboration and governance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredActions.map(action => (
            <Card
              key={action.href}
              className="group relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <action.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-slate-900">
                  {action.title}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-slate-600">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative pt-0">
                <Button
                  asChild
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  <Link href={action.href}>{action.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-8 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Need guidance?</CardTitle>
          </div>
          <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
            New to Beacon? Start with Engagements, then move to Signals when you need help or can contribute expertise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Use consistent filters to narrow by status, urgency, and role
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Open detail pages to understand context before taking action
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Capture outcomes clearly so future users can reuse solutions
            </li>
          </ul>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
