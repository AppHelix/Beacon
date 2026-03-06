
"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const getErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "Configuration":
      return "Authentication configuration is incomplete. Please contact support.";
    case "AccessDenied":
      return "Access was denied for this account.";
    case "Verification":
      return "Verification failed. Please try signing in again.";
    case "Callback":
    case "OAuthCallback":
      return "Sign-in callback failed. Please try again or use a different account.";
    case "OAuthSignin":
    case "OAuthCreateAccount":
      return "Could not start Azure AD sign-in. Please try again.";
    default:
      return "Authentication failed. Please try again.";
  }
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("error") ?? "Unknown";
  const message = getErrorMessage(errorCode);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-6 py-12 xl:px-12">
        <Card className="w-full max-w-xl rounded-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-2xl">Sign-in failed</CardTitle>
            </div>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Error code: {errorCode}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="rounded-none" onClick={() => signIn("azure-ad")}>Try again</Button>
              <Button asChild variant="outline" className="rounded-none">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
