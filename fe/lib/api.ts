const BASE = "/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sl_token");
}

export function setToken(token: string) {
  localStorage.setItem("sl_token", token);
}

export function clearToken() {
  localStorage.removeItem("sl_token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data as T;
}

export const api = {
  auth: {
    register: (body: { username: string; email: string; password: string }) =>
      request<{ message: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ message: string; token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: () => request<{ user: User }>("/auth/me"),
  },
  users: {
    stats: () => request<StatsResponse>("/users/stats"),
    heatmap: (days = 90) => request<HeatmapResponse>(`/users/heatmap?days=${days}`),
  },
  quests: {
    active: () => request<{ quests: UserQuest[] }>("/quests"),
    history: () => request<{ quests: UserQuest[] }>("/quests/history"),
    assignDaily: () =>
      request<{ assigned: UserQuest[]; message: string }>("/quests/daily", {
        method: "POST",
      }),
    complete: (userQuestId: number) =>
      request<CompleteQuestResponse>(`/quests/${userQuestId}/complete`, {
        method: "POST",
      }),
  },
};

// ── Types ──────────────────────────────────────────────────────────────────

export type Rank = "E" | "D" | "C" | "B" | "A" | "S";
export type Aspect = "FITNESS" | "DESCIPLINE" | "CAREER" | "INTELLECT" | "SOCIAL";
export type QuestType = "DAILY" | "WEEKLY" | "PERMANENT";
export type QuestStatus = "ACTIVE" | "COMPLETED" | "FAILED" | "EXPIRED";

export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  rank: Rank;
  current_xp: number;
  total_xp: number;
  up_to_next: number;
  streak_days: number;
  last_active_at: string | null;
  created_at: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  type: QuestType;
  aspect: Aspect;
  rank: Rank;
  xp_reward: number;
  is_active: boolean;
}

export interface UserQuest {
  id: number;
  user_id: number;
  quest_id: number;
  status: QuestStatus;
  assigned_at: string;
  completed_at: string | null;
  expires_at: string | null;
  quest: Quest;
}

export interface StatsResponse {
  user: User;
  xp_progress_pct: number;
  active_quests: number;
  completed_total: number;
  completed_by_aspect: Partial<Record<Aspect, number>>;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  xp: number;
}

export interface HeatmapResponse {
  days: number;
  data: HeatmapDay[];
  totals: {
    completed: number;
    xp: number;
    active_days: number;
  };
}

export interface CompleteQuestResponse {
  xp_gained: number;
  streak_multiplier: number;
  leveled_up: boolean;
  streak_days: number;
  user: User;
}

// ── Helpers ────────────────────────────────────────────────────────────────

export const RANK_LABELS: Record<Rank, string> = {
  E: "E-Rank",
  D: "D-Rank",
  C: "C-Rank",
  B: "B-Rank",
  A: "A-Rank",
  S: "S-Rank",
};

export const ASPECT_LABELS: Record<Aspect, string> = {
  FITNESS: "Fitness",
  DESCIPLINE: "Discipline",
  CAREER: "Career",
  INTELLECT: "Intellect",
  SOCIAL: "Social",
};

export const ASPECT_COLORS: Record<Aspect, string> = {
  FITNESS: "#f87171",
  DESCIPLINE: "#a78bfa",
  CAREER: "#34d399",
  INTELLECT: "#60a5fa",
  SOCIAL: "#fbbf24",
};

export const RANK_COLORS: Record<Rank, string> = {
  E: "#9ca3af",
  D: "#34d399",
  C: "#60a5fa",
  B: "#c084fc",
  A: "#fbbf24",
  S: "#f87171",
};

export function rankClass(rank: Rank) {
  return `rank-${rank.toLowerCase()}`;
}

export function xpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.8));
}

export function timeUntil(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
