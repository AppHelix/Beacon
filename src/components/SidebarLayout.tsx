"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Briefcase, Radio, Users, ShieldCheck, Menu, Compass, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navigationItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/engagements", label: "Engagements", icon: Briefcase },
  { href: "/signals", label: "Signals", icon: Radio },
  { href: "/people", label: "People", icon: Users },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Check user role for navigation visibility
  const userRole = (session?.user as any)?.role?.toLowerCase();
  const canAccessAdmin = userRole === "admin" || userRole === "curator";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-700 px-6">
          <Compass className="h-6 w-6 text-indigo-600" />
          <span className="ml-3 text-xl font-bold text-slate-900 dark:text-white">Beacon</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            // Hide Admin link for non-admin/curator users
            if (item.href === "/admin" && !canAccessAdmin) {
              return null;
            }
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View profile</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <DropdownMenuLabel className="text-slate-900 dark:text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem onClick={() => router.push('/profile')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Layout */}
      <div className="flex w-full flex-col lg:hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-700 px-6">
                  <Compass className="h-6 w-6 text-indigo-600" />
                  <span className="ml-3 text-xl font-bold text-slate-900 dark:text-white">Beacon</span>
                </div>
                <nav className="space-y-1 p-3">
                  {navigationItems.map((item) => {
                    // Hide Admin link for non-admin/curator users
                    if (item.href === "/admin" && !canAccessAdmin) {
                      return null;
                    }
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <Compass className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Beacon</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <DropdownMenuLabel className="text-slate-900 dark:text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem onClick={() => router.push('/profile')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Mobile Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          {/* Top Bar */}
          {(title || description) && (
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>}
                  {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Content Area */}
          <div className="p-4">{children}</div>
        </main>
      </div>

      {/* Desktop Main Content */}
      <main className="hidden flex-1 overflow-auto lg:block">
        {/* Top Bar */}
        {(title || description) && (
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>}
                {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Content Area */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
