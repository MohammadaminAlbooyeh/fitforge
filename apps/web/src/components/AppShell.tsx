"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, fetchProfile, clearToken, ApiError } from "@/lib/api";
import TabBar from "./TabBar";
import Sidebar from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        router.replace("/login");
        return;
      }
      try {
        const me = await fetchProfile();
        if (!cancelled) {
          void me;
          setReady(true);
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="md:pl-64">
      <Sidebar />
      <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 md:pb-10">
        {children}
      </div>
      <div className="md:hidden">
        <TabBar />
      </div>
    </div>
  );
}