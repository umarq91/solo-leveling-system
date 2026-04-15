export function xpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.8));
}

export function rankfromLevel(
  level: number,
): "E" | "D" | "C" | "B" | "A" | "S" {
  if (level >= 75) return "S";
  if (level >= 50) return "A";
  if (level >= 35) return "B";
  if (level >= 20) return "C";
  if (level >= 10) return "D";

  return "E";
}

export function streakMultipler(streak: number): number {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.3;
  if (streak >= 7) return 1.15;

  return 1;
}
