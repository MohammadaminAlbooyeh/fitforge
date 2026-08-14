"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, updateProfile, generateWorkoutPlan } from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

const DAY_OPTIONS = [1, 2, 3, 4, 5];
const EQUIPMENT_OPTIONS = [
  { value: "dumbbell", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "machine", label: "Machines" },
  { value: "cable", label: "Cable" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "band", label: "Bands" },
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
      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
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