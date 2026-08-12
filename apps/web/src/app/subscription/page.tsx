"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import NavBar from "@/components/NavBar";
import { apiFetch } from "@/lib/api";
import { EntitlementsResponse } from "@/lib/types";

export default function SubscriptionPage() {
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
      <p className="text-sm text-black/60 dark:text-white/60">
        Shows the entitlements for the signed-in account. The backend currently only exposes
        a &quot;my entitlements&quot; endpoint (<code>GET /entitlements/me</code>) — there is no
        system-wide subscription listing yet, so a full admin subscription-management view
        needs a backend endpoint added first.
      </p>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {entitlements && (
        <dl className="grid grid-cols-2 gap-y-2 rounded border border-black/10 p-4 text-sm dark:border-white/10">
          <dt className="text-black/60 dark:text-white/60">User ID</dt>
          <dd>{entitlements.userId}</dd>
          <dt className="text-black/60 dark:text-white/60">Plan</dt>
          <dd>{entitlements.plan}</dd>
          <dt className="text-black/60 dark:text-white/60">Status</dt>
          <dd>{entitlements.status ?? "—"}</dd>
          <dt className="text-black/60 dark:text-white/60">Store product</dt>
          <dd>{entitlements.storeProductId ?? "—"}</dd>
          <dt className="text-black/60 dark:text-white/60">Current period end</dt>
          <dd>{entitlements.currentPeriodEnd ?? "—"}</dd>
        </dl>
      )}
    </main>
  );
}
