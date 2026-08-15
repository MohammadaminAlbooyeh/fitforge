"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, getEntitlements, getDataExport, clearToken } from "@/lib/api";
import { Avatar, Card, Button, Badge } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  gain_muscle: "Gain Muscle",
  maintain: "Maintain",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Awaited<ReturnType<typeof fetchProfile>> | null>(null);
  const [entitlements, setEntitlements] = useState<Awaited<ReturnType<typeof getEntitlements>> | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(setUser)
      .catch(() => {});
    getEntitlements()
      .then(setEntitlements)
      .catch(() => {});
  }, []);

  if (!user) return <div className="py-20 text-center text-muted">Loading…</div>;

  const isPro = entitlements?.plan === "PRO";
  const goalLabel = GOAL_LABELS[user.goal ?? ""] ?? (user.goal ?? "—");

  const handleExport = async () => {
    const data = await getDataExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitforge-export-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar name={user.full_name} size={72} />
        <p className="mt-2 text-xl font-extrabold text-text">{user.full_name ?? "Profile"}</p>
        <p className="text-[13px] text-muted">{user.email}</p>
      </div>

      <div className="flex justify-between rounded-[22px] bg-white p-4 shadow">
        <Stat label="Weight" value={user.weight_kg ? `${user.weight_kg} kg` : "—"} />
        <Stat label="Height" value={user.height_cm ? `${user.height_cm} cm` : "—"} />
        <Stat label="Goal" value={goalLabel} />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <p className="font-bold text-text">Subscription</p>
          <Badge color={isPro ? "primarysoft" : "success"}>{entitlements?.plan ?? "FREE"}</Badge>
        </div>
        <div className="mt-3">
          <Link href="/subscription">
            <Button variant="ghost">{isPro ? "Manage subscription" : "Upgrade to Pro"}</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <MenuRow label="Edit profile" href="/profile/edit" />
        <MenuRow label="Goals" href="/goals" />
        <MenuRow label="Schedule" href="/schedule" />
        <MenuRow label="Export my data" href="#" onMenuClick={handleExport} />
      </Card>

      <Button
        variant="accent"
        onClick={() => {
          clearToken();
          router.replace("/login");
        }}
      >
        Log out
      </Button>
    </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5">
      <span className="text-base font-bold text-text">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function MenuRow({ label, href, onMenuClick }: { label: string; href: string; onMenuClick?: () => void }) {
  const inner = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primarysoft text-primary">
        →
      </span>
      <span className="flex-1 text-sm font-semibold text-text">{label}</span>
      <span className="text-muted">›</span>
    </>
  );
  if (onMenuClick) {
    return (
      <button onClick={onMenuClick} className="flex w-full items-center gap-3 py-2 text-left">
        {inner}
      </button>
    );
  }
  return <Link href={href} className="flex items-center gap-3 py-2">{inner}</Link>;
}