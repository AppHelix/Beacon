"use client";
import dynamic from "next/dynamic";
import PeopleDirectory from "../features/PeopleDirectory";
import TeamManagement from "../features/TeamManagement";
import NotificationSystem from "../features/NotificationSystem";
import RBAC from "../features/RBAC";
import E2ETestSuite from "../features/E2ETestSuite";
import SignalDetail from "../features/SignalDetail";
import HandRaise from "../features/HandRaise";
import SignalLifecycle from "../features/SignalLifecycle";

const SignalBoard = dynamic(() => import("../features/SignalBoard"), { ssr: false });

// Demo signal for detail/lifecycle/hand-raise
const demoSignal = {
  id: "1",
  title: "Need help with Next.js SSR",
  description: "Having trouble with server-side rendering in Next.js 14.",
  engagementId: "eng1",
  createdBy: "alice",
  status: "open" as const,
  urgency: "high" as const,
  requiredSkills: ["Next.js", "SSR", "React"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 space-y-8">
      <SignalBoard />
      <SignalDetail signal={demoSignal} />
      <HandRaise onRaise={() => alert("Hand raised for help!")} />
      <SignalLifecycle signal={demoSignal} onStatusChange={status => alert(`Status changed to ${status}`)} />
      <PeopleDirectory />
      <TeamManagement />
      <NotificationSystem />
      <RBAC />
      <E2ETestSuite />
    </div>
  );
}
