"use client";

import { useMemo, useState } from "react";
import { HeatmapDay } from "@/lib/api";

interface Props {
  data: HeatmapDay[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Cyan-tinted intensity ramp, level 0 → 4.
const LEVEL_BG = [
  "rgba(255,255,255,0.04)",
  "rgba(0,212,255,0.18)",
  "rgba(0,212,255,0.38)",
  "rgba(0,212,255,0.62)",
  "rgba(0,212,255,0.92)",
];

function intensity(count: number, max: number): number {
  if (count <= 0) return 0;
  const r = count / max;
  if (r < 0.25) return 1;
  if (r < 0.5) return 2;
  if (r < 0.75) return 3;
  return 4;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatTooltipDate(iso: string): string {
  const d = parseLocalDate(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function ActivityHeatmap({ data }: Props) {
  const [hover, setHover] = useState<HeatmapDay | null>(null);

  const { weeks, max, monthMarkers } = useMemo(() => {
    if (data.length === 0) {
      return { weeks: [] as (HeatmapDay | null)[][], max: 1, monthMarkers: [] as { col: number; label: string }[] };
    }

    const max = Math.max(1, ...data.map((d) => d.count));
    const firstDow = parseLocalDate(data[0].date).getDay();
    const cells: (HeatmapDay | null)[] = [...Array(firstDow).fill(null), ...data];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    // Track first column where each month appears so we can label across the top.
    const monthMarkers: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstReal = week.find((c): c is HeatmapDay => c !== null);
      if (!firstReal) return;
      const month = parseLocalDate(firstReal.date).getMonth();
      if (month !== lastMonth) {
        monthMarkers.push({ col, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });

    return { weeks, max, monthMarkers };
  }, [data]);

  if (data.length === 0) return null;

  const cellSize = 11;
  const gap = 3;
  const dayLabelWidth = 26;

  return (
    <div className="relative">
      {/* Tooltip */}
      {hover && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap pointer-events-none"
          style={{
            background: "var(--sl-surface-2)",
            border: "1px solid var(--sl-border-bright)",
            color: "var(--sl-text)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ color: "var(--sl-cyan)" }}>{hover.count}</span>{" "}
          <span style={{ color: "var(--sl-text-muted)" }}>quest{hover.count !== 1 ? "s" : ""}</span>
          {hover.xp > 0 && (
            <>
              {" · "}
              <span style={{ color: "#fbbf24" }}>+{hover.xp} XP</span>
            </>
          )}
          {" · "}
          <span style={{ color: "var(--sl-text-dim)" }}>{formatTooltipDate(hover.date)}</span>
        </div>
      )}

      <div className="overflow-x-auto pb-1">
        <div style={{ paddingLeft: dayLabelWidth }}>
          {/* Month header */}
          <div className="relative h-4 mb-1" style={{ width: weeks.length * (cellSize + gap) }}>
            {monthMarkers.map((mark) => (
              <span
                key={`${mark.col}-${mark.label}`}
                className="absolute text-[0.6rem] font-mono uppercase tracking-wider"
                style={{
                  left: mark.col * (cellSize + gap),
                  color: "var(--sl-text-dim)",
                }}
              >
                {mark.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Weekday labels — show every other to avoid clutter */}
          <div className="flex flex-col justify-between mr-1" style={{ width: dayLabelWidth, paddingTop: 0 }}>
            {DAY_LABELS.map((d, i) => (
              <span
                key={d}
                className="text-[0.55rem] font-mono uppercase"
                style={{
                  color: "var(--sl-text-dim)",
                  height: cellSize,
                  lineHeight: `${cellSize}px`,
                  marginBottom: gap,
                  visibility: i % 2 === 1 ? "visible" : "hidden",
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap }}>
                {week.map((cell, di) => {
                  if (!cell) {
                    return <div key={di} style={{ width: cellSize, height: cellSize }} />;
                  }
                  const lvl = intensity(cell.count, max);
                  const isHover = hover?.date === cell.date;
                  return (
                    <div
                      key={di}
                      onMouseEnter={() => setHover(cell)}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: 2,
                        background: LEVEL_BG[lvl],
                        border: `1px solid ${lvl === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,212,255,0.25)"}`,
                        cursor: "pointer",
                        transform: isHover ? "scale(1.4)" : undefined,
                        boxShadow: isHover ? "0 0 8px rgba(0,212,255,0.6)" : undefined,
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-7">
          <span className="text-[0.6rem] font-mono uppercase tracking-wider" style={{ color: "var(--sl-text-dim)" }}>
            Less
          </span>
          {LEVEL_BG.map((bg, i) => (
            <div
              key={i}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 2,
                background: bg,
                border: `1px solid ${i === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,212,255,0.25)"}`,
              }}
            />
          ))}
          <span className="text-[0.6rem] font-mono uppercase tracking-wider" style={{ color: "var(--sl-text-dim)" }}>
            More
          </span>
        </div>
      </div>
    </div>
  );
}
