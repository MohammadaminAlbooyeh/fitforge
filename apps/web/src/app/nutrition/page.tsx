"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDailySummary,
  getEntriesForDay,
  createNutritionLog,
  deleteNutritionLog,
  getWaterSummary,
  getWaterEntries,
  createWaterLog,
  deleteWaterLog,
} from "@/lib/api";
import { Card, Button, Input, Badge } from "@/components/ui";
import { AppShell } from "@/components/AppShell";
import type {
  DailyNutritionSummaryContract,
  DailyWaterSummaryContract,
  NutritionLogContract,
  WaterLogContract,
} from "@shared/types/api-contracts";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const WATER_GOAL_ML = 2000;

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildWeek(center: Date) {
  const day = (center.getDay() + 6) % 7;
  const monday = new Date(center);
  monday.setDate(center.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function MacroDonut({
  calories,
  protein,
  carbs,
  fat,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const size = 110;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const rings = [
    { value: protein, max: 150, color: "#7C5CFC" },
    { value: carbs, max: 300, color: "#FF7A50" },
    { value: fat, max: 90, color: "#3DD598" },
  ];
  const inset = 5;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {rings.map((ring, i) => {
          const rad = r - i * inset;
          return (
            <circle
              key={ring.color}
              cx={cx}
              cy={cx}
              r={rad}
              fill="none"
              stroke="#ECEAF4"
              strokeWidth={stroke}
            />
          );
        })}
        {rings.map((ring, i) => {
          const rad = r - i * inset;
          const circ = 2 * Math.PI * rad;
          const filled = Math.min(1, ring.value / ring.max) * circ;
          return (
            <circle
              key={`${ring.color}-f`}
              cx={cx}
              cy={cx}
              r={rad}
              fill="none"
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circ - filled}`}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-text">{Math.round(calories)}</span>
        <span className="text-[11px] text-muted">cal</span>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value, max }: { color: string; label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 text-xs font-semibold text-text">{label}</span>
      <span className="text-[11px] text-muted">
        {Math.round(value)} of {max}
      </span>
    </div>
  );
}

export default function NutritionPage() {
  const [selected, setSelected] = useState(new Date());
  const [summary, setSummary] = useState<DailyNutritionSummaryContract | null>(null);
  const [entries, setEntries] = useState<NutritionLogContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [water, setWater] = useState<DailyWaterSummaryContract | null>(null);
  const [waterEntries, setWaterEntries] = useState<WaterLogContract[]>([]);

  // add form
  const [showForm, setShowForm] = useState(false);
  const [meal, setMeal] = useState("");
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const week = buildWeek(selected);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const day = toISODate(selected);
      const [s, e, w, we] = await Promise.all([
        getDailySummary(day),
        getEntriesForDay(day),
        getWaterSummary(day),
        getWaterEntries(day),
      ]);
      setSummary(s);
      setEntries(e);
      setWater(w);
      setWaterEntries(we);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time data fetch on selected day
    load();
  }, [load]);

  const grouped = entries.reduce<Record<string, NutritionLogContract[]>>((acc, entry) => {
    const key = entry.meal ?? "other";
    acc[key] = acc[key] ?? [];
    acc[key].push(entry);
    return acc;
  }, {});

  const handleAdd = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await createNutritionLog({
        log_date: toISODate(selected),
        meal: meal || null,
        food_item: food,
        calories: calories ? Number(calories) : undefined,
        protein_g: protein ? Number(protein) : undefined,
        carbs_g: carbs ? Number(carbs) : undefined,
        fat_g: fat ? Number(fat) : undefined,
      });
      setShowForm(false);
      setMeal("");
      setFood("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to add entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text">
          {selected.toLocaleDateString("en-US", { weekday: "long", day: "numeric" })}
        </h1>
        <Badge color="primarysoft">Nutrition</Badge>
      </div>

      {/* Week strip */}
      <div className="flex justify-between">
        {week.map((d, i) => {
          const isSelected = toISODate(d) === toISODate(selected);
          return (
            <button key={i} onClick={() => setSelected(d)} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-muted">{WEEKDAYS[i]}</span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                  isSelected ? "bg-primary text-white" : "bg-card text-text"
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Macros */}
      <Card>
        <div className="flex items-center gap-4">
          <MacroDonut
            calories={summary?.total_calories ?? 0}
            protein={summary?.total_protein_g ?? 0}
            carbs={summary?.total_carbs_g ?? 0}
            fat={summary?.total_fat_g ?? 0}
          />
          <div className="flex-1 space-y-2">
            <LegendRow color="#7C5CFC" label="Protein" value={summary?.total_protein_g ?? 0} max={150} />
            <LegendRow color="#FF7A50" label="Carbs" value={summary?.total_carbs_g ?? 0} max={300} />
            <LegendRow color="#3DD598" label="Fat" value={summary?.total_fat_g ?? 0} max={90} />
          </div>
        </div>
      </Card>

      {/* Water tracker */}
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-text">💧 Water</p>
          <span className="text-xs text-muted">
            {water?.total_ml ?? 0} ml · {water?.cups ?? 0} cups
          </span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-line">
          <div
            className="h-2.5 rounded-full bg-sky-400 transition-all"
            style={{ width: `${Math.min(100, ((water?.total_ml ?? 0) / WATER_GOAL_ML) * 100)}%` }}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-muted">
          Goal: {WATER_GOAL_ML} ml
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {[250, 500, 750].map((size) => (
              <button
                key={size}
                onClick={async () => {
                  await createWaterLog({ log_date: toISODate(selected), amount_ml: size });
                  load();
                }}
                className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600 transition hover:bg-sky-100"
              >
                +{size}ml
              </button>
            ))}
          </div>
          {waterEntries.length > 0 && (
            <button
              onClick={async () => {
                await deleteWaterLog(waterEntries[waterEntries.length - 1].id);
                load();
              }}
              className="text-xs text-danger"
            >
              Undo last
            </button>
          )}
        </div>
        {waterEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {waterEntries.map((w) => (
              <span key={w.id} className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                {w.amount_ml}ml
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Entries */}
      {loading ? (
        <p className="text-center text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted">No meals logged for this day yet.</p>
      ) : (
        Object.entries(grouped).map(([mealKey, items]) => (
          <Card key={mealKey}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold text-text">
                {mealKey[0].toUpperCase() + mealKey.slice(1)}:{" "}
                {Math.round(items.reduce((sum, i) => sum + i.calories, 0))} cal
              </p>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primarysoft text-primary">🍽</span>
                <span className="flex-1 text-[13px] font-semibold text-text">{item.food_item}</span>
                <span className="text-xs text-muted">{Math.round(item.calories)}</span>
                <button
                  onClick={async () => {
                    await deleteNutritionLog(item.id);
                    load();
                  }}
                  className="text-xs text-danger"
                >
                  ✕
                </button>
              </div>
            ))}
          </Card>
        ))
      )}

      {/* Add form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-card p-4 text-primary shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
        >
          <span className="text-xl">＋</span>
          <span className="font-bold">Add food entry</span>
        </button>
      ) : (
        <Card title="Add food entry">
          <div className="space-y-3">
            <Input label="Meal" placeholder="Breakfast, Lunch…" value={meal} onChange={(e) => setMeal(e.target.value)} />
            <Input label="Food item" placeholder="Oatmeal with banana" value={food} onChange={(e) => setFood(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
              <Input label="Protein (g)" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
              <Input label="Carbs (g)" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              <Input label="Fat (g)" type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <div className="space-y-2">
              <Button onClick={handleAdd} disabled={!food.trim() || saving}>
                {saving ? "Saving…" : "Save entry"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
    </AppShell>
  );
}