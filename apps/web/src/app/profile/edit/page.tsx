"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, updateProfile } from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";

const GOALS = [
  { value: "", label: "No goal selected" },
  { value: "lose_weight", label: "Lose Weight" },
  { value: "gain_muscle", label: "Gain Muscle" },
  { value: "maintain", label: "Maintain" },
];

export type UserUpdatePayload = Partial<{
  full_name: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  available_days_per_week: number | null;
}>;

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((u) => {
        setFullName(u.full_name ?? "");
        setBirthDate(u.birth_date ?? "");
        setHeightCm(u.height_cm != null ? String(u.height_cm) : "");
        setWeightKg(u.weight_kg != null ? String(u.weight_kg) : "");
        setGoal(u.goal ?? "");
        setDaysPerWeek(u.available_days_per_week != null ? String(u.available_days_per_week) : "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload: UserUpdatePayload = {
        full_name: fullName || null,
        birth_date: birthDate || null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        goal: goal || null,
        available_days_per_week: daysPerWeek ? Number(daysPerWeek) : null,
      };
      await updateProfile(payload);
      setSaved(true);
      setTimeout(() => router.push("/profile"), 800);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-text">Edit Profile</h1>

      <Card title="Profile">
        <div className="space-y-3">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Birth date (YYYY-MM-DD)" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Height (cm)" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            <Input label="Weight (kg)" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </div>
          <Input
            label="Workouts per week"
            type="number"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
          />
        </div>
      </Card>

      <Card title="Fitness Goal">
        <div className="space-y-1">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left"
            >
              <span className={`text-xl ${goal === g.value ? "text-primary" : "text-muted"}`}>
                {goal === g.value ? "🔘" : "⚪"}
              </span>
              <span className={`text-sm font-semibold ${goal === g.value ? "text-primary" : "text-text"}`}>
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {saved && <p className="text-sm text-success">Saved! Redirecting…</p>}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}