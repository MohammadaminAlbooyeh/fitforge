"use client";

type Region = {
  muscle: string;
  label: string;
  d?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
};

// Simplified anatomical regions over a stylized humanoid silhouette,
// viewBox 0 0 200 440. Coordinates are hand-tuned to roughly line up with
// the body outline drawn below them, not medically precise.
const FRONT_REGIONS: Region[] = [
  { muscle: "shoulders", label: "Shoulders", cx: 60, cy: 78, rx: 14, ry: 11 },
  { muscle: "shoulders", label: "Shoulders", cx: 140, cy: 78, rx: 14, ry: 11 },
  { muscle: "chest", label: "Chest", d: "M76 72 h48 v34 h-48 Z" },
  { muscle: "biceps", label: "Biceps", cx: 46, cy: 118, rx: 11, ry: 22 },
  { muscle: "biceps", label: "Biceps", cx: 154, cy: 118, rx: 11, ry: 22 },
  { muscle: "core", label: "Core", d: "M78 108 h44 v58 h-44 Z" },
  { muscle: "forearms", label: "Forearms", cx: 41, cy: 165, rx: 9, ry: 22 },
  { muscle: "forearms", label: "Forearms", cx: 159, cy: 165, rx: 9, ry: 22 },
  { muscle: "quads", label: "Quads", d: "M76 172 h20 v78 h-20 Z" },
  { muscle: "quads", label: "Quads", d: "M104 172 h20 v78 h-20 Z" },
  { muscle: "calves", label: "Calves", d: "M77 254 h18 v56 h-18 Z" },
  { muscle: "calves", label: "Calves", d: "M105 254 h18 v56 h-18 Z" },
];

const BACK_REGIONS: Region[] = [
  { muscle: "shoulders", label: "Shoulders", cx: 60, cy: 78, rx: 14, ry: 11 },
  { muscle: "shoulders", label: "Shoulders", cx: 140, cy: 78, rx: 14, ry: 11 },
  { muscle: "back", label: "Back", d: "M74 70 h52 v72 h-52 Z" },
  { muscle: "triceps", label: "Triceps", cx: 46, cy: 118, rx: 11, ry: 22 },
  { muscle: "triceps", label: "Triceps", cx: 154, cy: 118, rx: 11, ry: 22 },
  { muscle: "forearms", label: "Forearms", cx: 41, cy: 165, rx: 9, ry: 22 },
  { muscle: "forearms", label: "Forearms", cx: 159, cy: 165, rx: 9, ry: 22 },
  { muscle: "glutes", label: "Glutes", d: "M76 144 h48 v30 h-48 Z" },
  { muscle: "hamstrings", label: "Hamstrings", d: "M76 176 h20 v70 h-20 Z" },
  { muscle: "hamstrings", label: "Hamstrings", d: "M104 176 h20 v70 h-20 Z" },
  { muscle: "calves", label: "Calves", d: "M77 254 h18 v56 h-18 Z" },
  { muscle: "calves", label: "Calves", d: "M105 254 h18 v56 h-18 Z" },
];

function Silhouette() {
  return (
    <g fill="currentColor" className="text-[#1f1f24]" opacity={0.9}>
      {/* head */}
      <circle cx="100" cy="34" r="18" />
      {/* neck */}
      <rect x="92" y="50" width="16" height="14" rx="3" />
      {/* torso */}
      <path d="M64 66 h72 c4 40 -4 76 -10 100 h-52 c-6 -24 -14 -60 -10 -100 Z" />
      {/* arms */}
      <path d="M60 70 c-14 4 -22 20 -24 46 c-1 22 0 44 3 62 h14 c-2 -20 -3 -42 -1 -60 c1 -18 4 -32 8 -44 Z" />
      <path d="M140 70 c14 4 22 20 24 46 c1 22 0 44 -3 62 h-14 c2 -20 3 -42 1 -60 c-1 -18 -4 -32 -8 -44 Z" />
      {/* legs */}
      <path d="M74 168 c-4 40 -6 76 -4 138 h24 c2 -46 4 -96 4 -138 Z" />
      <path d="M126 168 c4 40 6 76 4 138 h-24 c-2 -46 -4 -96 -4 -138 Z" />
      {/* feet */}
      <ellipse cx="82" cy="316" rx="14" ry="7" />
      <ellipse cx="118" cy="316" rx="14" ry="7" />
    </g>
  );
}

export function BodyDiagram({
  side,
  selected,
  onSelect,
}: {
  side: "front" | "back";
  selected: string | null;
  onSelect: (muscle: string) => void;
}) {
  const regions = side === "front" ? FRONT_REGIONS : BACK_REGIONS;

  return (
    <svg viewBox="0 0 200 330" className="mx-auto h-[360px] w-auto select-none">
      <Silhouette />
      {regions.map((r, i) => {
        const active = selected === r.muscle;
        const shared = {
          key: `${r.muscle}-${i}`,
          onClick: () => onSelect(r.muscle),
          role: "button" as const,
          "aria-label": r.label,
          tabIndex: 0,
          className: `cursor-pointer transition ${
            active
              ? "fill-primary/70 stroke-primary"
              : "fill-white/0 stroke-white/25 hover:fill-primary/25 hover:stroke-primary/70"
          }`,
          strokeWidth: 1.5,
          style: { pointerEvents: "all" as const },
        };
        return r.d ? (
          <path {...shared} d={r.d} />
        ) : (
          <ellipse {...shared} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} />
        );
      })}
    </svg>
  );
}
