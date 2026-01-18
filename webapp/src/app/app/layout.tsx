'use client';

import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/context/AuthContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 transition-colors duration-300">
        <Navigation />
        <main className="pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

