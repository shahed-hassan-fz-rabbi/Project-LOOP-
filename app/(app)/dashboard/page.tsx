"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome, {session?.user?.name}! 
      </p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 uppercase">Total Feedback</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 uppercase">Negative %</p>
          <p className="text-3xl font-bold mt-2">0%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 uppercase">New This Week</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      <p className="text-gray-500 text-center">
        Charts and analytics coming soon...
      </p>
    </div>
  );
}