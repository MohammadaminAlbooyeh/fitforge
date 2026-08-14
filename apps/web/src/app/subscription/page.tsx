"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEntitlements, apiFetch } from "@/lib/api";
import { Card, Button, Badge } from "@/components/ui";
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
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">FitForge Pro</h1>
      <p className="text-sm text-muted">
        Unlock the full training experience. You have 5 days left of your 30 day trial.
      </p>

      <Card className="border-2 border-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-text">6-month plan</p>
            <p className="text-sm text-muted">$9.99 / month</p>
          </div>
          <Badge color="primarysoft">Best value</Badge>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-text">3-month plan</p>
            <p className="text-sm text-muted">$15.99 / month</p>
          </div>
        </div>
      </Card>

      <Card title="What's included">
        <ul className="space-y-2 text-sm text-text">
          <li>✓ Unlimited exercise videos</li>
          <li>✓ Weekly diet meal plan</li>
          <li>✓ Advice from professional trainers</li>
        </ul>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={purchase} disabled={busy}>
        {busy ? "Purchasing…" : "Purchase Pro"}
      </Button>
      <Button variant="ghost" onClick={() => router.push("/profile")}>
        Thanks, Not Now
      </Button>
    </div>
  );
}