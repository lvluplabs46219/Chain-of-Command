import React from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272830]">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wider uppercase text-[#D4AF37] mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "gold" | "success" | "warning" | "danger" | "info";
}) {
  const variantStyles = {
    neutral: "bg-neutral-800 text-neutral-300 border-neutral-700",
    gold: "bg-[#D4AF37]/15 text-[#E6C65A] border-[#D4AF37]/30",
    success: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
    warning: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    danger: "bg-red-950/40 text-red-300 border-red-800/40",
    info: "bg-sky-950/40 text-sky-300 border-sky-800/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
