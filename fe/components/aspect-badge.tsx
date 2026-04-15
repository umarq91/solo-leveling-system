import { Aspect, ASPECT_LABELS, ASPECT_COLORS } from "@/lib/api";

interface Props {
  aspect: Aspect;
  size?: "sm" | "md";
}

const ASPECT_ICONS: Record<Aspect, string> = {
  FITNESS: "⚔",
  DESCIPLINE: "🧠",
  CAREER: "💼",
  INTELLECT: "📚",
  SOCIAL: "🤝",
};

export default function AspectBadge({ aspect, size = "sm" }: Props) {
  const color = ASPECT_COLORS[aspect];
  const label = ASPECT_LABELS[aspect];
  const icon = ASPECT_ICONS[aspect];
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono ${textSize} font-semibold uppercase tracking-wide`}
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      <span style={{ fontSize: size === "sm" ? "0.65rem" : "0.75rem" }}>{icon}</span>
      {label}
    </span>
  );
}
