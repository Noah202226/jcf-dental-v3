"use client";

import { useEffect } from "react";
import Features from "./components/landing/Features";
import Hero from "./components/landing/Hero";

import { useAuthStore } from "./stores/authStore";
import DashboardPage from "./components/Dashboard";

export default function HomePage() {
  const { getCurrentUser, current, loading } = useAuthStore((state) => state);

  // Fetch user on mount
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  // If logged in → show dashboard
  if (current) {
    return <DashboardPage user={current} />;
  }

  // Else → show landing page
  return (
    <>
      <Hero />
    </>
  );
}
