import { Rank, RANK_COLORS } from "@/lib/api";

interface Props {
  rank: Rank;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

const sizes = {
  sm: { badge: "w-7 h-7 text-xs", label: "text-xs" },
  md: { badge: "w-9 h-9 text-sm", label: "text-sm" },
  lg: { badge: "w-14 h-14 text-xl", label: "text-base" },
  xl: { badge: "w-20 h-20 text-3xl", label: "text-lg" },
};

export default function RankBadge({ rank, size = "md", showLabel }: Props) {
  const color = RANK_COLORS[rank];
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`rank-badge ${s.badge} font-bold`}
        style={{
          color,
          borderColor: color,
          backgroundColor: `${color}14`,
          boxShadow: rank === "S" ? `0 0 18px ${color}55` : undefined,
        }}
      >
        {rank}
      </div>
      {showLabel && (
        <span className={`${s.label} font-mono`} style={{ color }}>
          {rank}-RANK
        </span>
      )}
    </div>
  );
}
