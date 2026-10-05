"use client";

import React from "react";
import { Database, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  StatusBadge – standardized capsules for Pro Se / Active / etc.    */
/* ------------------------------------------------------------------ */

export type StatusVariant =
  | "pro-se"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "gold";

const STATUS_STYLES: Record<
  StatusVariant,
  { wrap: string; dot: string }
> = {
  "pro-se": {
    wrap: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
    dot: "bg-emerald-400",
  },
  active: {
    wrap: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
    dot: "bg-emerald-400",
  },
  success: {
    wrap: "bg-emerald-950/50 border-emerald-800/40 text-emerald-400",
    dot: "bg-emerald-400",
  },
  warning: {
    wrap: "bg-amber-950/50 border-amber-700/40 text-amber-300",
    dot: "bg-amber-400",
  },
  danger: {
    wrap: "bg-rose-950/50 border-rose-700/40 text-rose-300",
    dot: "bg-rose-400",
  },
  info: {
    wrap: "bg-blue-950/50 border-blue-700/40 text-blue-300",
    dot: "bg-blue-400",
  },
  neutral: {
    wrap: "bg-neutral-800/80 border-neutral-700/70 text-neutral-300",
    dot: "bg-neutral-400",
  },
  gold: {
    wrap: "bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]",
    dot: "bg-[#D4AF37]",
  },
};

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  children,
  variant = "neutral",
  pulse = false,
  className,
}: StatusBadgeProps) {
  const styles = STATUS_STYLES[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
        styles.wrap,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          styles.dot,
          pulse && "animate-pulse"
        )}
      />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  CaseTitle – elevated primary caption                               */
/* ------------------------------------------------------------------ */

interface CaseTitleProps {
  /** Mono gold eyebrow e.g. "Active Legal Workspace" */
  eyebrow?: string;
  /** Secondary mono bits (case number, court, etc.) */
  meta?: React.ReactNode;
  children: React.ReactNode;
  /** Optional subtitle under the title */
  subtitle?: React.ReactNode;
  className?: string;
  size?: "lg" | "xl";
}

export function CaseTitle({
  eyebrow,
  meta,
  children,
  subtitle,
  className,
  size = "xl",
}: CaseTitleProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {(eyebrow || meta) && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {eyebrow && (
            <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">
              {eyebrow}
            </span>
          )}
          {meta}
        </div>
      )}
      <h1
        className={cn(
          "font-serif font-extrabold text-white tracking-tight drop-shadow-sm leading-tight",
          size === "xl" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
        )}
      >
        {children}
      </h1>
      {subtitle && (
        <p className="text-xs text-neutral-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionHeader – page-level section chrome                          */
/* ------------------------------------------------------------------ */

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#23242B] pb-4",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-neutral-400 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard – value-vs-label staging                                */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  tooltip?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconClassName,
  tooltip,
  className,
}: MetricCardProps) {
  const [showTip, setShowTip] = React.useState(false);

  return (
    <div
      className={cn(
        "bg-[#191A20] border border-[#2A2B33] rounded-lg p-3.5 relative",
        className
      )}
      onMouseEnter={() => tooltip && setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium tracking-wider uppercase mb-1.5">
        <span className="flex items-center gap-1">{label}</span>
        {Icon && (
          <Icon className={cn("w-3.5 h-3.5", iconClassName ?? "text-[#D4AF37]")} />
        )}
      </div>
      <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
        {value}
      </div>
      {sublabel && (
        <div className="text-[11px] text-slate-400 truncate mt-1">{sublabel}</div>
      )}
      {showTip && tooltip && (
        <div className="absolute z-20 left-0 right-0 top-full mt-2 p-3 bg-[#0F1014] border border-[#D4AF37]/40 rounded-lg shadow-xl text-left">
          {tooltip}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TelemetryPill – compact sync / persistence indicator               */
/* ------------------------------------------------------------------ */

interface TelemetryPillProps {
  className?: string;
  compact?: boolean;
}

export function TelemetryPill({ className, compact = false }: TelemetryPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#17181C] border border-[#2D2E35] text-[10px] font-mono text-neutral-400",
        className
      )}
      title="Local persistence and sync status"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <Database className="w-3 h-3 text-emerald-400/80" />
      {!compact && (
        <>
          <span className="text-neutral-300">PERSISTED</span>
          <span className="text-neutral-600">|</span>
          <span>SYNC: 100%</span>
          <span className="text-neutral-600">|</span>
          <span>AES-256</span>
        </>
      )}
      {compact && <span className="text-neutral-300">SYNC OK</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MonoPill – case number / metadata chip                             */
/* ------------------------------------------------------------------ */

export function MonoPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] text-neutral-300 font-mono bg-neutral-800/80 border border-neutral-700/70 px-2 py-0.5 rounded",
        className
      )}
    >
      {children}
    </span>
  );
}
