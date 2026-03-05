"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Activity,
  Bell,
  ChevronDown,
  Compass,
  FolderKanban,
  Home as HomeIcon,
  Menu,
  Shield,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: session, status } = useSession();
  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map(chunk => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  const primaryNav = [
    { href: "/", label: "Home", icon: HomeIcon, tip: "Go to home dashboard" },
    { href: "/engagements", label: "Engagements", icon: FolderKanban, tip: "Browse all engagements" },
    { href: "/signals", label: "Signals", icon: Bell, tip: "Track and respond to signals" },
    { href: "/people", label: "People", icon: Users, tip: "Find teammates and collaborators" },
    { href: "/admin", label: "Admin", icon: Shield, tip: "Open administration tools" },
  ];

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
    },
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-16 xl:px-12">
            <Card className="rounded-none shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Compass className="h-6 w-6 text-primary" aria-label="Beacon overview" />
                    </TooltipTrigger>
                    <TooltipContent className="rounded-none">Beacon platform overview</TooltipContent>
                  </Tooltip>
                  <p className="text-sm font-semibold tracking-wide text-primary">AppHelix Internal Platform</p>
                </div>
                <CardTitle className="text-4xl font-bold sm:text-5xl">Beacon</CardTitle>
                <CardDescription className="max-w-3xl text-lg text-muted-foreground">
                  One place to discover engagements, post or resolve Signals, and connect with the right people across teams.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-none bg-muted shadow-none">
                    <CardContent className="p-4 text-sm">
                      <p className="font-semibold text-foreground">1. Discover</p>
                      <p className="mt-1 text-muted-foreground">Search active engagements and current priorities.</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-none bg-muted shadow-none">
                    <CardContent className="p-4 text-sm">
                      <p className="font-semibold text-foreground">2. Collaborate</p>
                      <p className="mt-1 text-muted-foreground">Raise or respond to Signals with clear ownership.</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-none bg-muted shadow-none">
                    <CardContent className="p-4 text-sm">
                      <p className="font-semibold text-foreground">3. Deliver</p>
                      <p className="mt-1 text-muted-foreground">Track outcomes and scale proven solutions.</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => signIn("azure-ad")}
                    className="rounded-none px-8 py-3 text-base font-semibold"
                  >
                    Sign In with Azure AD
                  </Button>
                  <p className="mt-3 text-sm text-muted-foreground">Internal use only — AppHelix employees and authorized members.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card text-card-foreground">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 xl:px-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Beacon</h1>
                <Badge variant="secondary" className="rounded-none">Light Theme</Badge>
              </div>

              <div className="flex flex-1 items-center justify-end gap-3 lg:max-w-2xl">
                <Input
                  aria-label="Global search"
                  placeholder="Search engagements, signals, people..."
                  className="hidden rounded-none md:block"
                />

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-none md:hidden">
                      <Menu className="h-4 w-4" />
                      Menu
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="rounded-none">
                    <SheetHeader>
                      <SheetTitle>Navigate Beacon</SheetTitle>
                      <SheetDescription>Open core sections quickly from mobile navigation.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 flex flex-col gap-2">
                      {primaryNav.map(item => (
                        <Button key={item.href} asChild variant="ghost" className="justify-start rounded-none">
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-none">
                      <Avatar className="h-6 w-6 rounded-none">
                        <AvatarFallback className="rounded-none text-xs">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="max-w-36 truncate">{session.user?.name || "User"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Preferences</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <NavigationMenu className="max-w-full justify-start">
              <NavigationMenuList className="justify-start gap-1">
                {primaryNav.map(item => (
                  <NavigationMenuItem key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "h-9 rounded-none gap-2",
                              item.href === "/" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-none">{item.tip}</TooltipContent>
                    </Tooltip>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 xl:px-12">
        <Card className="rounded-none shadow-sm">
          <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Start Here</p>
          <CardTitle className="mt-2 text-3xl font-bold">Use Beacon in 3 simple steps</CardTitle>
          <CardDescription className="mt-3 max-w-3xl text-muted-foreground">
            Discover active work, collaborate through Signals, and connect with the right people. Use the cards below to navigate quickly.
          </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-none border bg-muted p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Step 1:</span> Open Engagements to understand current projects.
            </div>
            <div className="rounded-none border bg-muted p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Step 2:</span> Visit Signals to ask for help or respond to blockers.
            </div>
            <div className="rounded-none border bg-muted p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Step 3:</span> Use People/Admin for collaboration and governance.
            </div>
          </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => (
            <Card
              key={action.href}
              className="flex h-full flex-col rounded-none shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <action.icon className="h-7 w-7 text-foreground" aria-label={action.tip} />
                  </TooltipTrigger>
                  <TooltipContent className="rounded-none">{action.tip}</TooltipContent>
                </Tooltip>
                <CardTitle className="mt-2 text-2xl font-semibold">{action.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant={action.variant} className="w-full rounded-none text-sm font-semibold">
                  <Link href={action.href}>{action.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator className="my-8" />

        <Card className="mt-8 rounded-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Activity className="h-5 w-5 text-foreground" aria-label="Guidance and tips" />
                </TooltipTrigger>
                <TooltipContent className="rounded-none">Guidance for first-time users</TooltipContent>
              </Tooltip>
              <CardTitle className="text-2xl font-bold">Need guidance?</CardTitle>
            </div>
            <CardDescription className="mt-3 text-muted-foreground">
            New to Beacon? Start with Engagements, then move to Signals when you need help or can contribute expertise.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Use consistent filters to narrow by status, urgency, and role.</li>
            <li>Open detail pages to understand context before taking action.</li>
            <li>Capture outcomes clearly so future users can reuse solutions.</li>
          </ul>
          </CardContent>
        </Card>
      </main>
      </div>
    </TooltipProvider>
  );
}
