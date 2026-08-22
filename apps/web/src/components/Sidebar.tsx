"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { label: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    label: "Dashboard",
    items: [{ href: "/home", label: "Home", icon: "🏠" }],
  },
  {
    label: "Training",
    items: [
      { href: "/workouts", label: "Workouts", icon: "🏋️" },
      { href: "/plan", label: "Plan", icon: "📋" },
      { href: "/exercises", label: "Exercises", icon: "💪" },
      { href: "/schedule", label: "Schedule", icon: "📅" },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/progress", label: "Progress", icon: "📈" },
      { href: "/goals", label: "Goals", icon: "🎯" },
    ],
  },
  {
    label: "Health",
    items: [{ href: "/nutrition", label: "Nutrition", icon: "🥗" }],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: "👤" },
      { href: "/subscription", label: "Subscription", icon: "⭐" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto border-r border-line bg-card px-4 py-6 md:flex">
      <Link href="/home" className="mb-8 flex items-center gap-2 px-2">
        <span className="grad-primary flex h-9 w-9 items-center justify-center rounded-xl text-white">⚡</span>
        <span className="text-lg font-extrabold text-text">
          FIT<span className="text-primary">FORGE</span>
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-6">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wide text-muted">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active =
                  item.href === "/home" ? pathname === "/home" || pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active ? "bg-primarysoft text-primary" : "text-text hover:bg-line"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
