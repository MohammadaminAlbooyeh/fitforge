"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/nutrition", label: "Nutrition", icon: "🥗" },
  { href: "/workouts", label: "Workouts", icon: "💪" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {tabs.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
