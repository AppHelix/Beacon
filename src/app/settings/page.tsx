"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Moon,
  Sun,
  Monitor,
  User,
  Lock,
  Download,
  X
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    signals: true,
    engagements: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Track changes to show save/cancel buttons
  const markAsChanged = () => setHasUnsavedChanges(true);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Simulate saving settings to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      // Show success message (could use a toast library)
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset all settings to their original values
    setNotifications({
      email: true,
      push: false,
      signals: true,
      engagements: true,
    });
    setTwoFactorEnabled(false);
    setHasUnsavedChanges(false);
  };

  const handleViewSessions = () => {
    setShowSessionsModal(true);
  };

  const handleRequestExport = () => {
    setShowExportModal(true);
  };

  if (status === "loading") {
    return (
      <SidebarLayout title="Settings" description="Configure your preferences">
        <div className="text-slate-600">Loading...</div>
      </SidebarLayout>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-gray-300 dark:text-slate-400 mb-8">You need to be signed in to access settings.</p>
          <Button
            onClick={() => signIn("azure-ad")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout title="Settings" description="Configure your account preferences and system settings">
      <div className="space-y-6">
        {/* General Settings */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">General</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">Basic account and application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="display-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Display Name
                </label>
                <Input
                  id="display-name"
                  value={session.user?.name || ""}
                  className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  value={session.user?.email || ""}
                  disabled
                  className="rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed as it's managed by Azure AD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-semibold text-slate-900">Appearance</CardTitle>
            </div>
            <CardDescription>Customize how Beacon looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Theme</label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                      theme === value
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">Choose when and how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, email: checked }));
                    markAsChanged();
                  }}
                />
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, push: checked }));
                    markAsChanged();
                  }}
                />
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Signal Notifications</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Get notified about new signals and responses</p>
                </div>
                <Switch
                  checked={notifications.signals}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, signals: checked }));
                    markAsChanged();
                  }}
                />
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Engagement Updates</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Get notified about engagement changes</p>
                </div>
                <Switch
                  checked={notifications.engagements}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, engagements: checked }));
                    markAsChanged();
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Privacy & Security</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">Manage your privacy and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      markAsChanged();
                    }}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Active Sessions</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Review and manage your active login sessions</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={handleViewSessions}
                  >
                    View Sessions
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Data Export</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Download a copy of your data</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                    onClick={handleRequestExport}
                  >
                    Request Export
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        {hasUnsavedChanges && (
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Sessions Modal */}
        {showSessionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowSessionsModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Current Session</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Windows • Chrome</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">Last active: Now</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                      Current
                    </span>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Mobile Session</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">iPhone • Safari</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">Last active: 2 hours ago</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSessionsModal(false)}
                  className="rounded-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowExportModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Request Data Export</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We'll prepare a copy of your data and send you a download link via email. This may take a few minutes to process.
              </p>
              <div className="space-y-3 mb-6">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-slate-900 dark:text-white">Profile Information</span>
                  </label>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-slate-900 dark:text-white">Engagement Activity</span>
                  </label>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-slate-900 dark:text-white">Signal History</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowExportModal(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    alert('Export request submitted! You\'ll receive an email when your data is ready.');
                    setShowExportModal(false);
                  }}
                >
                  Request Export
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}