export type Category = {
  id: string;
  label: string;
  emoji: string;
  budget: number;
  spent: number;
  color: string;
};

export type IncomeSource = {
  id: string;
  label: string;
  amount: number;
  day: number | "end";
};

export type UserProfile = {
  savings: number;
  savingsGoal: number;
  payday: number | "end";
  withdrawalDay: number | "end";
  incomeSources: IncomeSource[];
  categories: Category[];
};

// "recorded" = 支出を記録した日, "none" = お金を使わなかった日
export type DailyLog = "recorded" | "none";
export type DailyLogs = Record<string, DailyLog>; // キー: "YYYY-MM-DD"

export function calcStreak(logs: DailyLogs): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (logs[key]) streak++;
    else break;
  }
  return streak;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", label: "ごはん", emoji: "🍙", budget: 20000, spent: 12400, color: "#ff9f43" },
  { id: "fun", label: "あそび", emoji: "🎮", budget: 10000, spent: 11200, color: "#fd79a8" },
  { id: "school", label: "学校生活", emoji: "📚", budget: 5000, spent: 2800, color: "#74b9ff" },
  { id: "daily", label: "日常生活", emoji: "🧴", budget: 8000, spent: 3100, color: "#55efc4" },
  { id: "transport", label: "交通費", emoji: "🚃", budget: 6000, spent: 4200, color: "#a29bfe" },
];

export const DEFAULT_INCOME: IncomeSource[] = [
  { id: "furisode", label: "仕送り", amount: 0, day: 1 },
  { id: "scholarship", label: "奨学金", amount: 0, day: 15 },
];
