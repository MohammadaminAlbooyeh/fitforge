"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getEntitlements, apiFetch } from "@/lib/api";
import { Card, Button, Badge } from "@/components/ui";
import { AppShell } from "@/components/AppShell";
import type { EntitlementsContract } from "@shared/types/api-contracts";

export default function SubscriptionPage() {
  const router = useRouter();
  const [entitlements, setEntitlements] = useState<EntitlementsContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getEntitlements()
      .then(setEntitlements)
      .catch(() => setError("Could not load subscription info."));
  }, []);

  const isPro = entitlements?.plan === "PRO";
  const active = entitlements?.status === "ACTIVE";

  const purchase = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = await apiFetch("/subscriptions/purchase", { method: "POST", body: "{}" });
      setEntitlements(updated as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/subscriptions/cancel", { method: "POST" });
      setEntitlements((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  };

  if (isPro) {
    return (
      <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-text">Manage Subscription</h1>
        <Card>
          <div className="flex items-center justify-between">
            <p className="font-bold text-text">Plan</p>
            <Badge color="primarysoft">PRO</Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">Status</span>
            <span className={`font-semibold ${active ? "text-success" : "text-muted"}`}>
              {entitlements?.status ?? "—"}
            </span>
          </div>
          {entitlements?.currentPeriodEnd && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Renews</span>
              <span className="font-semibold text-text">
                {new Date(entitlements.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </Card>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={cancel} disabled={busy} variant="accent">
          {busy ? "Working…" : "Cancel auto-renew"}
        </Button>
      </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Purchase Pro</h1>
      <p className="text-sm text-muted">
        You have 5 days left of your 30 day trial.
      </p>

      <PlanCard
        selected
        title="6 month subscription"
        price="$9.99"
        period="/month"
        badge="Best value"
      >
        <Feature selected>Unlimited exercise videos</Feature>
        <Feature selected>Weekly diet meal plan</Feature>
        <Feature selected>Advice from professional trainers</Feature>
      </PlanCard>

      <PlanCard title="3 month subscription" price="$15.99" period="/month">
        <Feature>Unlimited exercise videos</Feature>
        <Feature>Weekly diet meal plan</Feature>
        <Feature>Advice from professional trainers</Feature>
      </PlanCard>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button variant="accent" onClick={purchase} disabled={busy}>
        {busy ? "Purchasing…" : "Purchase Pro"}
      </Button>
      <Button variant="ghost" onClick={() => router.push("/profile")}>
        Thanks, Not Now
      </Button>
    </div>
    </AppShell>
  );
}

function PlanCard({
  selected,
  title,
  price,
  period,
  badge,
  children,
}: {
  selected?: boolean;
  title: string;
  price: string;
  period: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative rounded-[22px] p-5 ${
        selected ? "grad-primary text-white shadow-lg" : "border border-line bg-card text-text"
      }`}
    >
      <span
        className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-white bg-white/20 text-white" : "border-line text-transparent"
        }`}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold">{price}</span>
        <span className={`text-sm ${selected ? "text-white/80" : "text-muted"}`}>{period}</span>
      </div>
      <p className={`mt-0.5 text-sm font-semibold ${selected ? "text-white/90" : "text-muted"}`}>{title}</p>
      {badge && selected && (
        <span className="mt-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

function Feature({ children, selected }: { children: ReactNode; selected?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${selected ? "text-white/90" : "text-muted"}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </div>
  );
}