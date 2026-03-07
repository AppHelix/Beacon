
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";

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

function AuthErrorPageContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("error") ?? "Unknown";
  const message = getErrorMessage(errorCode);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-4 py-10 sm:px-6 sm:py-12 xl:px-12">
        <Card className="w-full max-w-xl border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">Sign-in failed</CardTitle>
                <CardDescription className="mt-1 text-slate-600">{message}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Error code:</span> {errorCode}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                onClick={() => signIn("azure-ad")}
              >
                Try again
              </Button>
              <Button asChild variant="outline" className="rounded-lg border-slate-300">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p>Loading...</p>
        </div>
      )}
    >
      <AuthErrorPageContent />
    </Suspense>
  );
}
