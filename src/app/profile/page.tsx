"use client";

import { useSession, signIn } from "next-auth/react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <SidebarLayout title="Profile" description="Your account information">
        <div className="text-slate-600">Loading...</div>
      </SidebarLayout>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Profile</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view your profile.</p>
          <Button
            onClick={() => signIn("azure-ad")}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <SidebarLayout title="Profile" description="Manage your account information and preferences">
      {/* Profile Header */}
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-slate-900">
                {session.user?.name || "User"}
              </CardTitle>
              <CardDescription className="text-slate-600">
                {session.user?.email || "No email provided"}
              </CardDescription>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Active User
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-semibold text-slate-900">Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Full Name</p>
                  <p className="text-slate-900">{session.user?.name || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Email Address</p>
                  <p className="text-slate-900">{session.user?.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Role</p>
                  <p className="text-slate-900">Member</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-semibold text-slate-900">Account Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Last Sign In</p>
              <p className="mt-1 text-slate-900">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Account Created</p>
              <p className="mt-1 text-slate-900">Welcome to Beacon!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mt-6 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-lg bg-indigo-600 hover:bg-indigo-700">
              Edit Profile
            </Button>
            <Button variant="outline" className="rounded-lg border-slate-300">
              Change Password
            </Button>
            <Button variant="outline" className="rounded-lg border-slate-300">
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}