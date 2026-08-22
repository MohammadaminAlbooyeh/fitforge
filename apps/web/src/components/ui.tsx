import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-bold text-text">{title}</h3>}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "accent" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "w-full rounded-full py-3.5 text-sm font-semibold transition disabled:opacity-50";
  const styles = {
    primary: "grad-primary text-white shadow-[0_8px_20px_rgba(255,90,60,0.28)]",
    accent: "grad-accent text-white",
    ghost: "bg-line text-text",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium text-text">{label}</span>}
      <input
        {...props}
        className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm text-text shadow-[0_2px_8px_rgba(22,22,26,0.04)] outline-none transition focus:border-primary"
      />
    </label>
  );
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full grad-primary font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || "?"}
    </div>
  );
}

export function RingProgress({
  value,
  max,
  size = 96,
  strokeWidth = 10,
  color = "var(--color-primary)",
  trackColor = "var(--color-line)",
  label,
  valueLabel,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  valueLabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference * (1 - pct);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-text">{valueLabel ?? value}</span>
        {label && <span className="text-[10px] text-muted">{label}</span>}
      </div>
    </div>
  );
}

export function StatPill({
  value,
  label,
  color = "text-text",
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-base font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: string;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-semibold text-text">{title}</p>
      <p className="max-w-xs text-sm text-muted">{message}</p>
      {action && <div className="mt-2 w-full max-w-[240px]">{action}</div>}
    </div>
  );
}

export function Badge({ children, color = "primarysoft" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        color === "primarysoft"
          ? "bg-primarysoft text-primary"
          : color === "accent"
            ? "bg-[rgba(43,43,49,0.08)] text-accent"
            : color === "success"
              ? "bg-[rgba(52,178,123,0.14)] text-success"
              : "bg-line text-muted"
      }`}
    >
      {children}
    </span>
  );
}