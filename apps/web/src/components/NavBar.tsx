"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

export default function NavBar() {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
      <div className="flex items-center gap-6">
        <span className="font-semibold">FitForge Admin</span>
        <Link href="/admin/exercises" className="text-sm hover:underline">
          Exercises
        </Link>
        <Link href="/admin/subscription" className="text-sm hover:underline">
          Subscription
        </Link>
      </div>
      <button
        onClick={() => {
          clearToken();
          router.replace("/login");
        }}
        className="text-sm text-red-600 hover:underline dark:text-red-400"
      >
        Log out
      </button>
    </nav>
  );
}
