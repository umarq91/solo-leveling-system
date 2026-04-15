"use client";

interface Props {
  current: number;
  max: number;
  pct?: number;
  showNumbers?: boolean;
  height?: "sm" | "md" | "lg";
}

const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

export default function XpBar({ current, max, pct, showNumbers = false, height = "md" }: Props) {
  const percent = pct !== undefined ? pct : Math.min(100, Math.floor((current / max) * 100));

  return (
    <div className="w-full">
      <div className={`xp-bar-track ${heights[height]}`}>
        <div
          className="xp-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showNumbers && (
        <div className="flex justify-between mt-1">
          <span className="text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
            {current.toLocaleString()} XP
          </span>
          <span className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            {max.toLocaleString()} XP
          </span>
        </div>
      )}
    </div>
  );
}
