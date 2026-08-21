import { useEffect, useRef, useState } from "react";
import { Target, AlertTriangle, Plus, BookOpen, Flame, CheckCircle2 } from "lucide-react";
import type { Category, UserProfile } from "../types";

const hand = "var(--font-hand)";
function fmt(n: number) { return Math.abs(n).toLocaleString("ja-JP"); }

// Category icon map keyed by category id
function CatIcon({ cat, size = 18 }: { cat: Category; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size + 12, height: size + 12, background: `${cat.color}22` }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {cat.id === "food"      && <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>}
        {cat.id === "fun"       && <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>}
        {cat.id === "school"    && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>}
        {cat.id === "daily"     && <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>}
        {cat.id === "transport" && <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
        {!["food","fun","school","daily","transport"].includes(cat.id) && <circle cx="12" cy="12" r="8"/>}
      </svg>
    </div>
  );
}

function BudgetBar({ cat, onAdd }: { cat: Category; onAdd: () => void }) {
  const remaining = cat.budget - cat.spent;
  const pct = Math.min(Math.max(remaining / cat.budget, 0), 1) * 100;
  const over = remaining < 0;
  const prevOver = useRef(over);
  const [cracking, setCracking] = useState(false);
  const [shattered, setShattered] = useState(over && cat.budget > 0);

  useEffect(() => {
    if (!prevOver.current && over) {
      setCracking(true);
      setTimeout(() => { setCracking(false); setShattered(true); }, 500);
    }
    prevOver.current = over;
  }, [over]);

  const barColor = pct > 50 ? cat.color : pct > 20 ? "#ff9f43" : "#ff6b6b";

  return (
    <button
      onClick={onAdd}
      className={`w-full text-left rounded-[18px] p-4 transition-all active:scale-[0.98] ${cracking ? "animate-crack" : ""}`}
      style={{
        background: shattered ? "#fff0f0" : "#fffdf7",
        border: shattered ? "2px solid #ffb3b3" : "2px solid #ede0cc",
        boxShadow: shattered ? "2px 3px 0px #ffb3b3" : "2px 3px 0px #ddc9a8",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CatIcon cat={cat} size={16} />
          <span style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, color: "#3d2e00" }}>
            {cat.label}
          </span>
          {shattered && (
            <span className={cracking ? "animate-shatter" : ""}>
              <AlertTriangle size={15} color="#e74c3c" strokeWidth={2} />
            </span>
          )}
        </div>
        <Plus size={16} color="#f5a623" strokeWidth={2.5} />
      </div>

      {!shattered ? (
        <div className="h-4 rounded-full overflow-hidden mb-2" style={{ background: "#f0e8d8", border: "1.5px solid #ddc9a8" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      ) : (
        <div className="mb-2 relative" style={{ height: 16 }}>
          <div className="absolute inset-0 rounded-full" style={{ background: "#ffdddd", border: "1.5px solid #ffb3b3" }} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 16" preserveAspectRatio="none">
            <path d="M70 0 L66 8 L72 8 L68 16" stroke="#ff6b6b" strokeWidth="1.5" fill="none" />
            <path d="M120 0 L116 6 L123 6 L119 16" stroke="#ff6b6b" strokeWidth="1.5" fill="none" />
            <path d="M90 0 L94 16" stroke="#ff9999" strokeWidth="1" fill="none" strokeDasharray="2,2" />
          </svg>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span style={{ fontFamily: hand, fontSize: 12, color: "#a08060" }}>使った: ¥{fmt(cat.spent)}</span>
        <span style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: over ? "#e74c3c" : "#3d2e00" }}>
          {over ? `−¥${fmt(-remaining)} オーバー` : `残り ¥${fmt(remaining)}`}
        </span>
      </div>
    </button>
  );
}

export default function BudgetScreen({
  profile, categories, onAddExpense, streak, todayLogged, onMarkNoSpend,
}: {
  profile: UserProfile;
  categories: Category[];
  onAddExpense: () => void;
  streak: number;
  todayLogged: boolean;
  onMarkNoSpend: () => void;
}) {
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPct = Math.min(totalSpent / totalBudget, 1) * 100;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();

  return (
    <div className="max-w-lg mx-auto px-4 py-3 flex flex-col gap-3">
      {/* Overall summary card */}
      <div
        className="rounded-[20px] p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #ffe066 0%, #ffcc02 100%)", boxShadow: "3px 4px 0px #d4a800", transform: "rotate(-0.3deg)" }}
      >
        <div className="absolute right-4 top-3 opacity-10">
          <BookOpen size={64} color="#3d2e00" />
        </div>
        <p style={{ fontFamily: hand, fontSize: 13, color: "#7a5c00" }}>
          {today.getMonth() + 1}月の残り予算
        </p>
        <p style={{ fontFamily: hand, fontSize: 36, fontWeight: 600, color: "#3d2e00", lineHeight: 1.1 }}>
          {totalRemaining >= 0 ? `¥${fmt(totalRemaining)}` : `−¥${fmt(-totalRemaining)}`}
        </p>
        <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%`, background: overallPct < 70 ? "#ff9f43" : "#ff6b6b" }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p style={{ fontFamily: hand, fontSize: 11, color: "#7a5c00" }}>{daysPassed}日目 / {daysInMonth}日</p>
          <p style={{ fontFamily: hand, fontSize: 11, color: "#7a5c00" }}>¥{fmt(totalSpent)} / ¥{fmt(totalBudget)}</p>
        </div>
      </div>

      {/* Streak + 今日の記録 */}
      <div className="flex gap-2">
        {/* 連続記録バッジ */}
        <div
          className="flex-1 rounded-[16px] px-4 py-3 flex items-center gap-3"
          style={{ background: streak > 0 ? "#fff8ec" : "#fffdf7", border: `2px solid ${streak > 0 ? "#f5a623" : "#ede0cc"}`, boxShadow: `2px 3px 0px ${streak > 0 ? "#e8921a" : "#ddc9a8"}` }}
        >
          <Flame size={22} color={streak > 0 ? "#f5a623" : "#c0a080"} strokeWidth={1.8} />
          <div>
            <p style={{ fontFamily: hand, fontSize: 11, color: "#a08060" }}>連続記録</p>
            <p style={{ fontFamily: hand, fontSize: 20, fontWeight: 600, color: streak > 0 ? "#e8921a" : "#c0a080", lineHeight: 1.2 }}>
              {streak > 0 ? `${streak}日` : "0日"}
            </p>
          </div>
        </div>

        {/* 今日の記録ボタン */}
        {!todayLogged ? (
          <button
            onClick={onMarkNoSpend}
            className="flex-1 rounded-[16px] px-3 py-3 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: "#e8f5e9", border: "2px solid #a5d6a7", boxShadow: "2px 3px 0px #a5d6a7" }}
          >
            <p style={{ fontFamily: hand, fontSize: 11, color: "#2e7d32" }}>今日は</p>
            <p style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#1b5e20" }}>使わなかった</p>
            <p style={{ fontFamily: hand, fontSize: 10, color: "#66bb6a" }}>タップして記録</p>
          </button>
        ) : (
          <div
            className="flex-1 rounded-[16px] px-3 py-3 flex flex-col items-center justify-center gap-1"
            style={{ background: "#f5f5f5", border: "2px solid #ddd" }}
          >
            <CheckCircle2 size={18} color="#a0a0a0" strokeWidth={1.8} />
            <p style={{ fontFamily: hand, fontSize: 12, color: "#a0a0a0" }}>今日は記録済み</p>
          </div>
        )}
      </div>

      {/* Savings goal */}
      {profile.savingsGoal > 0 && (
        <div
          className="rounded-[16px] px-4 py-3 flex items-center gap-3"
          style={{ background: "#e8f5e9", border: "2px solid #a5d6a7", boxShadow: "2px 3px 0px #a5d6a7" }}
        >
          <Target size={22} color="#2e7d32" strokeWidth={2} />
          <div className="flex-1">
            <p style={{ fontFamily: hand, fontSize: 13, color: "#2e7d32" }}>今月の貯金目標</p>
            <p style={{ fontFamily: hand, fontSize: 16, fontWeight: 600, color: "#1b5e20" }}>
              ¥{profile.savingsGoal.toLocaleString("ja-JP")}
            </p>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: hand, fontSize: 11, color: "#66bb6a" }}>達成まで</p>
            <p style={{ fontFamily: hand, fontSize: 14, fontWeight: 600, color: "#2e7d32" }}>
              ¥{Math.max(profile.savingsGoal - (totalBudget - totalSpent < 0 ? 0 : totalBudget - totalSpent - profile.savingsGoal), 0).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      )}

      {/* Category budget bars */}
      <div className="flex flex-col gap-3">
        <p style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, color: "#5c4a2a" }}>カテゴリ別予算</p>
        {categories.map((cat) => (
          <BudgetBar key={cat.id} cat={cat} onAdd={onAddExpense} />
        ))}
      </div>

      {/* Income info */}
      <div
        className="rounded-[16px] p-4"
        style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}
      >
        <p style={{ fontFamily: hand, fontSize: 14, fontWeight: 600, color: "#5c4a2a", marginBottom: 8 }}>今月の収入</p>
        {profile.incomeSources.map((src) => (
          <div key={src.id} className="flex justify-between items-center py-1.5">
            <span style={{ fontFamily: hand, fontSize: 13, color: "#7a5c30" }}>{src.label}</span>
            <span style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#3d2e00" }}>
              ¥{src.amount.toLocaleString("ja-JP")}
              <span style={{ fontFamily: hand, fontSize: 11, color: "#a08060", marginLeft: 4 }}>
                ({src.day === "end" ? "月末" : `${src.day}日`})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
