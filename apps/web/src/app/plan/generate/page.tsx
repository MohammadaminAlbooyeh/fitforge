"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, updateProfile, generateWorkoutPlan } from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

const DAY_OPTIONS = [1, 2, 3, 4, 5];

function DumbbellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="9" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="4.5" y="7.5" width="2.5" height="9" rx="0.8" fill="currentColor" />
      <rect x="18.5" y="9" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="17" y="7.5" width="2.5" height="9" rx="0.8" fill="currentColor" />
      <rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function BarbellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="10.5" width="1.8" height="3" rx="0.5" fill="currentColor" />
      <rect x="3.5" y="9" width="2" height="6" rx="0.6" fill="currentColor" />
      <rect x="6" y="7" width="2.2" height="10" rx="0.6" fill="currentColor" />
      <rect x="15.8" y="7" width="2.2" height="10" rx="0.6" fill="currentColor" />
      <rect x="18.5" y="9" width="2" height="6" rx="0.6" fill="currentColor" />
      <rect x="20.7" y="10.5" width="1.8" height="3" rx="0.5" fill="currentColor" />
      <rect x="8" y="11.2" width="8" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function MachineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="2" height="18" rx="0.6" fill="currentColor" />
      <rect x="18" y="3" width="2" height="18" rx="0.6" fill="currentColor" />
      <rect x="4" y="7" width="6" height="1.8" rx="0.6" fill="currentColor" />
      <rect x="13" y="16" width="7" height="1.8" rx="0.6" fill="currentColor" />
      <circle cx="14.5" cy="9" r="2.6" stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

function CableIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2.4" fill="currentColor" />
      <path
        d="M12 7.4V14.5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <path
        d="M12 14.5 8.3 20M12 14.5l3.7 5.5"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KettlebellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9.3 6.3a2.7 2.7 0 0 1 5.4 0v1.4H9.3V6.3Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14.5" r="6.5" fill="currentColor" />
    </svg>
  );
}

function BandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3.5 5.5c5 0 3.5 13 8.5 13s3.5-13 8.5-13"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const EQUIPMENT_OPTIONS = [
  { value: "dumbbell", label: "Dumbbells", icon: DumbbellIcon },
  { value: "barbell", label: "Barbell", icon: BarbellIcon },
  { value: "machine", label: "Machines", icon: MachineIcon },
  { value: "cable", label: "Cable", icon: CableIcon },
  { value: "kettlebell", label: "Kettlebell", icon: KettlebellIcon },
  { value: "band", label: "Bands", icon: BandIcon },
];
const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
        active
          ? "border-primary bg-primary text-white"
          : "border-line bg-white text-text"
      }`}
    >
      {children}
    </button>
  );
}

export default function GeneratePlanPage() {
  const router = useRouter();
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [experience, setExperience] = useState("beginner");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile()
      .then((u) => {
        if (u.available_days_per_week != null) setDaysPerWeek(u.available_days_per_week);
        if (u.available_equipment?.length) setEquipment(u.available_equipment);
        if (u.experience_level) setExperience(u.experience_level);
      })
      .catch(() => {});
  }, []);

  const toggleEquipment = (value: string) => {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleGenerate = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        experience_level: experience,
        available_days_per_week: daysPerWeek,
        available_equipment: equipment,
      });
      await generateWorkoutPlan({ days_per_week: daysPerWeek });
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate plan");
      setSaving(false);
    }
  };

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Build your plan</h1>
      <p className="text-[13px] text-muted">
        A few questions so we can generate a split that fits your schedule and equipment.
      </p>

      <Card title="Days per week">
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((n) => (
            <Chip key={n} active={daysPerWeek === n} onClick={() => setDaysPerWeek(n)}>
              {n}
            </Chip>
          ))}
        </div>
      </Card>

      <Card title="Experience level">
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={experience === opt.value}
              onClick={() => setExperience(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </Card>

      <Card title="Available equipment" subtitle="Bodyweight exercises are always included.">
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={equipment.includes(opt.value)}
              onClick={() => toggleEquipment(opt.value)}
            >
              <opt.icon />
              {opt.label}
            </Chip>
          ))}
        </div>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={handleGenerate} disabled={saving} variant="accent">
        {saving ? "Generating…" : "Generate my plan"}
      </Button>
    </div>
    </AppShell>
  );
}