"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import NavBar from "@/components/NavBar";
import { apiFetch } from "@/lib/api";

type EntitlementsResponse = {
  userId: number;
  plan: string;
  status?: string | null;
  storeProductId?: string | null;
  currentPeriodEnd?: string | null;
};

export default function AdminSubscriptionPage() {
  return (
    <AuthGate>
      <NavBar />
      <SubscriptionBody />
    </AuthGate>
  );
}

function SubscriptionBody() {
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<EntitlementsResponse>("/entitlements/me")
      .then(setEntitlements)
      .catch(() => setError("Could not load subscription info."));
  }, []);

  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-4 p-6">
      <h1 className="text-lg font-semibold">Subscription</h1>
      <p className="text-sm text-muted">
        Shows the entitlements for the signed-in account. The backend currently only exposes
        a &quot;my entitlements&quot; endpoint (<code>GET /entitlements/me</code>) — there is no
        system-wide subscription listing yet.
      </p>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {entitlements && (
        <dl className="grid grid-cols-2 gap-y-2 rounded border border-line p-4 text-sm">
          <dt className="text-muted">User ID</dt>
          <dd>{entitlements.userId}</dd>
          <dt className="text-muted">Plan</dt>
          <dd>{entitlements.plan}</dd>
          <dt className="text-muted">Status</dt>
          <dd>{entitlements.status ?? "—"}</dd>
          <dt className="text-muted">Store product</dt>
          <dd>{entitlements.storeProductId ?? "—"}</dd>
          <dt className="text-muted">Current period end</dt>
          <dd>{entitlements.currentPeriodEnd ?? "—"}</dd>
        </dl>
      )}
    </main>
  );
}