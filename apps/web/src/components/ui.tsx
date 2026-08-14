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
    primary: "grad-primary text-white",
    accent: "grad-accent text-white",
    ghost: "bg-primarysoft text-primary",
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
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
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
            ? "bg-[#fff0ea] text-accent"
            : color === "success"
              ? "bg-[#e6faf1] text-[#1fa97a]"
              : "bg-line text-muted"
      }`}
    >
      {children}
    </span>
  );
}