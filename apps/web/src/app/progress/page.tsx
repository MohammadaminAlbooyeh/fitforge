"use client";

import { useState } from "react";
import Link from "next/link";
import { useAsync } from "@/lib/useAsync";
import {
  getEnhancedAnalytics,
  listPersonalRecords,
  getGamificationSummary,
  listBodyMeasurements,
  createBodyMeasurement,
} from "@/lib/api";
import { Card, StatPill, RingProgress } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

function WeeklyVolumeChart({ weeks }: { weeks: { week_start: string; total_sets: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.total_sets));
  return (
    <div className="flex h-32 items-end gap-2">
      {weeks.slice(-8).map((w) => {
        const h = (w.total_sets / max) * 100;
        return (
          <div key={w.week_start} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-md grad-primary"
              style={{ height: `${Math.max(h, 4)}%` }}
            />
            <span className="text-[10px] text-muted">
              {new Date(w.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyVolumeChart({ months }: { months: { month: string; total_sets: number }[] }) {
  const max = Math.max(1, ...months.map((m) => m.total_sets));
  return (
    <div className="flex h-32 items-end gap-2">
      {months.map((m) => {
        const h = (m.total_sets / max) * 100;
        const [, monthNum] = m.month.split("-");
        return (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-md grad-accent"
              style={{ height: `${Math.max(h, 4)}%` }}
            />
            <span className="text-[10px] text-muted">
              {new Date(Number(m.month.slice(0, 4)), Number(monthNum) - 1).toLocaleDateString("en-US", {
                month: "short",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const RECOVERY_COLORS: Record<string, string> = {
  low: "text-success",
  normal: "text-primary",
  moderate: "text-accent",
  high: "text-danger",
};

export default function ProgressPage() {
  const { data: enhanced } = useAsync(getEnhancedAnalytics, []);
  const { data: records } = useAsync(listPersonalRecords, []);
  const { data: gamification } = useAsync(getGamificationSummary, []);
  const { data: measurements, reload } = useAsync(listBodyMeasurements, []);

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Activity</h1>

      {/* Level / streak */}
      <Card>
        <div className="flex justify-around">
          <StatPill value={gamification?.xp.level ?? 0} label="Level" color="text-primary" />
          <StatPill value={enhanced?.streak_days ?? 0} label="Streak" color="text-accent" />
          <StatPill value={enhanced?.longest_streak ?? 0} label="Best streak" color="text-success" />
        </div>
        {gamification && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-line">
              <div
                className="h-2 rounded-full grad-primary"
                style={{
                  width: `${gamification.next_level_xp > 0 ? Math.min(100, (gamification.xp.total_xp / (gamification.xp.total_xp + gamification.next_level_xp)) * 100) : 100}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {gamification.xp.total_xp} XP · {gamification.achievements.length} achievements
            </p>
          </div>
        )}
      </Card>

      {/* Training summary */}
      {enhanced && (
        <div className="grid grid-cols-3 gap-3">
          <IconStat icon="🏋️" value={enhanced.summary.total_workouts} label="Workouts" tone="primary" />
          <IconStat icon="⏱️" value={enhanced.summary.total_sessions} label="Sessions" tone="accent" />
          <IconStat icon="🔥" value={enhanced.summary.total_sets} label="Sets" tone="success" />
        </div>
      )}

      {/* Recovery score */}
      {enhanced && (
        <Card title="Recovery">
          <div className="flex items-center gap-4">
            <RingProgress
              value={enhanced.recovery.recovery_score}
              max={100}
              size={64}
              strokeWidth={6}
              valueLabel={String(enhanced.recovery.recovery_score)}
            />
            <div>
              <p className={`text-sm font-bold capitalize ${RECOVERY_COLORS[enhanced.recovery.fatigue_level] ?? "text-text"}`}>
                {enhanced.recovery.fatigue_level} fatigue
              </p>
              {enhanced.recovery.suggestion && (
                <p className="mt-1 text-xs text-muted">{enhanced.recovery.suggestion}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Weekly volume */}
      {enhanced && enhanced.weekly_volume.length > 0 && (
        <Card title="Weekly volume">
          <WeeklyVolumeChart weeks={enhanced.weekly_volume} />
        </Card>
      )}

      {/* Monthly volume */}
      {enhanced && enhanced.monthly_volume.length > 0 && (
        <Card title="Monthly volume">
          <MonthlyVolumeChart months={enhanced.monthly_volume} />
        </Card>
      )}

      {/* Strength standards / estimated 1RM */}
      {enhanced && enhanced.exercise_progression.length > 0 && (
        <Card title="Estimated 1RM">
          <div className="space-y-3">
            {enhanced.exercise_progression
              .filter((p) => p.estimated_1rm != null)
              .slice(0, 8)
              .map((p) => {
                const delta =
                  p.estimated_1rm != null && p.previous_1rm != null
                    ? p.estimated_1rm - p.previous_1rm
                    : null;
                return (
                  <div key={p.exercise_id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{p.exercise_name}</p>
                      <p className="text-xs text-muted">
                        {p.estimated_1rm} kg · best {p.best_weight} × {p.best_reps}
                      </p>
                    </div>
                    {delta != null && (
                      <span className={`text-xs font-bold ${delta >= 0 ? "text-success" : "text-danger"}`}>
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
          {enhanced.strength_standards.filter((s) => s.standard_level).length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                Strength standards vs bodyweight
              </p>
              <div className="space-y-2">
                {enhanced.strength_standards
                  .filter((s) => s.standard_level)
                  .slice(0, 5)
                  .map((s) => (
                    <div key={s.exercise_id} className="flex items-center justify-between text-sm">
                      <p className="truncate font-medium text-text">{s.exercise_name}</p>
                      <p className="text-xs capitalize text-muted">
                        {s.standard_level} · {s.bodyweight_ratio}× bw
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Progress photos */}
      <Card title="Progress Photos">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {(measurements ?? [])
            .filter((m) => m.photo_url)
            .map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.photo_url!}
                  alt={`Progress ${m.date}`}
                  className="h-28 w-28 rounded-xl object-cover"
                />
                <span className="text-[11px] text-muted">{m.date}</span>
              </div>
            ))}
          {(!measurements || measurements.filter((m) => m.photo_url).length === 0) && (
            <p className="py-4 text-sm text-muted">No progress photos yet. Add one below.</p>
          )}
        </div>
        <ProgressPhotoForm onAdded={reload} />
      </Card>

      {/* Achievements */}
      {gamification && gamification.achievements.length > 0 && (
        <Card title="Achievements">
          <div className="grid grid-cols-3 gap-3">
            {gamification.achievements.slice(0, 9).map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1.5 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primarysoft text-2xl">
                  {a.icon || "🏆"}
                </span>
                <span className="text-[11px] font-bold leading-tight text-text">{a.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Personal records */}
      <Card title="Personal Records">
        {!records || records.length === 0 ? (
          <p className="text-sm text-muted">No personal records yet. Log some workouts!</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 5).map((pr) => (
              <div key={pr.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{pr.exercise.name}</p>
                  <p className="text-xs text-muted">
                    {pr.completed_at.slice(0, 10)} · {pr.weight_kg != null ? `${pr.weight_kg} kg` : ""} × {pr.reps}
                  </p>
                </div>
                <span className="text-lg">🏆</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/progress/records" className="mt-3 inline-block text-sm font-bold text-primary">
          View all →
        </Link>
      </Card>
    </div>
    </AppShell>
  );
}

const ICON_TONE: Record<string, string> = {
  primary: "bg-primarysoft text-primary",
  accent: "bg-[#fff0ea] text-accent",
  success: "bg-[#e6faf1] text-[#1fa97a]",
};

function IconStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: string | number;
  label: string;
  tone: "primary" | "accent" | "success";
}) {
  return (
    <div className="card flex flex-col items-center gap-1 !p-3 text-center">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${ICON_TONE[tone]}`}>
        {icon}
      </span>
      <span className="text-base font-extrabold text-text">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function ProgressPhotoForm({ onAdded }: { onAdded: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        await createBodyMeasurement({
          date: new Date().toISOString().slice(0, 10),
          photo_url: String(reader.result),
        });
        onAdded();
        setSaving(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload photo");
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t border-line pt-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primarysoft py-2.5 text-sm font-bold text-primary">
        {saving ? "Uploading…" : "＋ Add progress photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          disabled={saving}
        />
      </label>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}