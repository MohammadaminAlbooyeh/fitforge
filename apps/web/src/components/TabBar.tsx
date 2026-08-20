"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const quickActions = [
  { href: "/workouts", label: "Log workout" },
  { href: "/nutrition", label: "Log nutrition" },
  { href: "/progress", label: "Log weigh-in" },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div ref={menuRef} className="relative flex w-full max-w-sm items-center justify-between rounded-full border border-line bg-white/95 px-4 py-3 shadow-[0_12px_30px_rgba(58,46,107,0.16)] backdrop-blur">
        {tabs.map((t, i) => {
          if (t.href === "spacer") return <div key={i} className="w-12" />;
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center justify-center rounded-full p-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active ? "text-primary" : "text-muted"
              }`}
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
            >
              {t.icon(active)}
            </Link>
          );
        })}
        {menuOpen && (
          <div
            role="menu"
            className="absolute bottom-full left-1/2 mb-3 w-44 -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_30px_rgba(58,46,107,0.2)]"
          >
            {quickActions.map((a) => (
              <button
                key={a.href}
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(a.href);
                }}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-text transition hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Quick actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="grad-primary absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[0_8px_20px_rgba(94,61,224,0.45)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${menuOpen ? "rotate-45" : ""}`}
          >
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
