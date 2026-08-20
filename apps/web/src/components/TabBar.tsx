"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11.5 12 4l8 7.5"
          stroke="currentColor"
          strokeWidth={active ? 2.4 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 10v8.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10"
          stroke="currentColor"
          strokeWidth={active ? 2.4 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/exercises",
    label: "Exercises",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.5 8.5v7M17.5 8.5v7M3 10v4M21 10v4M6.5 12h11"
          stroke="currentColor"
          strokeWidth={active ? 2.4 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  { href: "spacer", label: "", icon: () => null },
  {
    href: "/progress",
    label: "Progress",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 20V10M11 20V4M18 20v-6"
          stroke="currentColor"
          strokeWidth={active ? 2.4 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.2" stroke="currentColor" strokeWidth={active ? 2.4 : 2} />
        <path
          d="M5 19.5c1.2-3.3 4-5 7-5s5.8 1.7 7 5"
          stroke="currentColor"
          strokeWidth={active ? 2.4 : 2}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="relative flex w-full max-w-sm items-center justify-between rounded-full border border-line bg-white/95 px-4 py-3 shadow-[0_12px_30px_rgba(58,46,107,0.16)] backdrop-blur">
        {tabs.map((t, i) => {
          if (t.href === "spacer") return <div key={i} className="w-12" />;
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center justify-center rounded-full p-2 transition ${
                active ? "text-primary" : "text-muted"
              }`}
              aria-label={t.label}
            >
              {t.icon(active)}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => router.push("/workouts")}
          aria-label="Log workout"
          className="grad-primary absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[0_8px_20px_rgba(94,61,224,0.45)]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
