"use client";

import { useAsync } from "@/lib/useAsync";
import { listPersonalRecords } from "@/lib/api";
import { Card, EmptyState } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

export default function RecordsPage() {
  const { data: records, loading } = useAsync(listPersonalRecords, []);

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Personal Records</h1>
      {loading ? (
        <p className="text-center text-muted">Loading…</p>
      ) : !records || records.length === 0 ? (
        <EmptyState icon="🏆" title="No records yet" message="Log workouts to earn personal records." />
      ) : (
        <div className="space-y-3">
          {records.map((pr) => (
            <Card key={pr.id}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <p className="font-bold text-text">{pr.exercise.name}</p>
                  <p className="text-xs capitalize text-muted">{pr.exercise.muscle_group}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {pr.weight_kg != null ? `${pr.weight_kg} kg` : ""} × {pr.reps}
                  </p>
                  <p className="text-xs text-muted">{pr.completed_at.slice(0, 10)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </AppShell>
  );
}