import { useState, useEffect } from "react";
import { Home, Camera, BarChart2, CalendarDays, Plus, PiggyBank } from "lucide-react";
import Onboarding from "./screens/Onboarding";
import BudgetScreen from "./screens/BudgetScreen";
import ScanScreen from "./screens/ScanScreen";
import ChartsScreen from "./screens/ChartsScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import CalendarScreen from "./screens/CalendarScreen";
import type { UserProfile, Category, DailyLogs } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_INCOME, calcStreak, todayKey } from "./types";

type Tab = "budget" | "scan" | "charts" | "calendar";

const TABS: { id: Tab; Icon: React.ElementType; label: string }[] = [
  { id: "budget", Icon: Home, label: "ホーム" },
  { id: "scan", Icon: Camera, label: "読み取り" },
  { id: "charts", Icon: BarChart2, label: "グラフ" },
  { id: "calendar", Icon: CalendarDays, label: "カレンダー" },
];

// コインパーティクル
type Coin = { id: number; tx: number; ty: number; r: number; delay: number; x: number; y: number };

function MoneyFlyOverlay({ onDone }: { onDone: () => void }) {
  const coins: Coin[] = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    tx: (Math.random() - 0.5) * 320,
    ty: -(Math.random() * 280 + 80),
    r: Math.random() * 720 - 360,
    delay: Math.random() * 0.25,
    x: (Math.random() - 0.5) * 40,
    y: (Math.random() - 0.5) * 40,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      {coins.map((c) => (
        <div
          key={c.id}
          className="coin-fly absolute"
          style={{
            "--tx": `${c.tx}px`,
            "--ty": `${c.ty}px`,
            "--r": `${c.r}deg`,
            animationDelay: `${c.delay}s`,
            left: `calc(50% + ${c.x}px)`,
            top: `calc(60% + ${c.y}px)`,
          } as React.CSSProperties}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #ffe066, #f5a623)",
              border: "2px solid #d4a800",
              boxShadow: "0 2px 6px rgba(245,166,35,0.5)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// 貯金箱アニメーション
function PiggyBankOverlay({ onDone }: { onDone: () => void }) {
  const coins = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    fromY: -(180 + i * 25),
    delay: i * 0.12,
    x: (Math.random() - 0.5) * 100,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* コインが落ちてくる */}
        {coins.map((c) => (
          <div
            key={c.id}
            className="coin-drop absolute"
            style={{
              "--from-y": `${c.fromY}px`,
              animationDelay: `${c.delay}s`,
              left: `calc(50% + ${c.x}px - 8px)`,
              top: "50%",
            } as React.CSSProperties}
          >
            <div
              style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #ffe066, #f5a623)",
                border: "2px solid #d4a800",
                boxShadow: "1px 2px 0px #d4a800",
              }}
            />
          </div>
        ))}
        {/* 貯金箱 */}
        <div className="piggy-bounce" style={{ animationDelay: "0.3s" }}>
          <div
            style={{
              width: 200, height: 200, borderRadius: 24,
              background: "#ffe066", border: "3px solid #d4a800",
              boxShadow: "3px 4px 0px #d4a800",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <PiggyBank size={130} color="#d4a800" strokeWidth={1.5} />
          </div>
        </div>
        <p
          className="streak-pop mt-3"
          style={{
            fontFamily: "var(--font-hand)", fontSize: 15, fontWeight: 600,
            color: "#7a5c00", background: "#ffe066",
            padding: "4px 14px", borderRadius: 99,
            border: "2px solid #d4a800",
            animationDelay: "0.5s",
          }}
        >
          節約できた！
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<Tab>("budget");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [showAdd, setShowAdd] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<DailyLogs>({});
  const [showMoneyFly, setShowMoneyFly] = useState(false);
  const [showPiggy, setShowPiggy] = useState(false);

  const streak = calcStreak(dailyLogs);

  function handleOnboardingDone(p: UserProfile) {
    setProfile(p);
    setCategories(p.categories.map((c) => ({ ...c, spent: 0 })));
  }

  function addExpense(catId: string, amount: number) {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, spent: c.spent + amount } : c))
    );
    setDailyLogs((prev) => ({ ...prev, [todayKey()]: "recorded" }));
    setShowAdd(false);
    setShowMoneyFly(true);
  }

  function markNoSpend() {
    setDailyLogs((prev) => ({ ...prev, [todayKey()]: "none" }));
    setShowPiggy(true);
  }

  const todayLogged = !!dailyLogs[todayKey()];

  if (!profile) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#fdf8f0", fontFamily: "var(--font-hand)" }}
    >
      {/* アニメーションオーバーレイ */}
      {showMoneyFly && <MoneyFlyOverlay onDone={() => setShowMoneyFly(false)} />}
      {showPiggy && <PiggyBankOverlay onDone={() => setShowPiggy(false)} />}

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b-2"
        style={{ background: "rgba(253,248,240,0.9)", backdropFilter: "blur(12px)", borderColor: "#e8d9c0" }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <span style={{ fontFamily: "var(--font-hand)", fontSize: 17, color: "#5c4a2a", fontWeight: 600 }}>
            {profile.name ? `${profile.name}の家計簿` : "ズボラ家計簿"}
          </span>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div
                className="streak-pop flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: "#fff0d4", border: "2px solid #f5a623", boxShadow: "1px 2px 0px #e8921a" }}
              >
                <span style={{ fontSize: 13 }}>🔥</span>
                <span style={{ fontFamily: "var(--font-hand)", fontSize: 12, color: "#e8921a", fontWeight: 600 }}>
                  {streak}日連続
                </span>
              </div>
            )}
            <div
              className="px-3 py-1 rounded-full"
              style={{ background: "#ffe066", border: "2px solid #d4a800", boxShadow: "1px 2px 0px #d4a800" }}
            >
              <span style={{ fontFamily: "var(--font-hand)", fontSize: 12, color: "#7a5c00", fontWeight: 600 }}>
                貯金 ¥{profile.savings.toLocaleString("ja-JP")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-24">
        {tab === "budget" && (
          <BudgetScreen
            profile={profile}
            categories={categories}
            onAddExpense={() => setShowAdd(true)}
            streak={streak}
            todayLogged={todayLogged}
            onMarkNoSpend={markNoSpend}
          />
        )}
        {tab === "scan" && <ScanScreen onDone={addExpense} categories={categories} />}
        {tab === "charts" && <ChartsScreen categories={categories} profile={profile} />}
        {tab === "calendar" && <CalendarScreen />}
      </main>

      {/* Floating add button */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed z-50 flex items-center justify-center transition-all active:scale-90"
        style={{
          bottom: 72, right: 20, width: 52, height: 52,
          borderRadius: "50%", background: "#f5a623",
          border: "2.5px solid #e8921a",
          boxShadow: "0 4px 14px rgba(245,166,35,0.45), 3px 4px 0px #e8921a",
        }}
        aria-label="支出を入力"
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </button>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t-2 z-40"
        style={{ background: "rgba(253,248,240,0.95)", backdropFilter: "blur(16px)", borderColor: "#e8d9c0" }}
      >
        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-2">
          {TABS.map(({ id, Icon, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-[14px] transition-all"
                style={{
                  background: active ? "#ffe066" : "transparent",
                  border: active ? "2px solid #d4a800" : "2px solid transparent",
                  boxShadow: active ? "1px 2px 0px #d4a800" : "none",
                  minWidth: 60,
                }}
              >
                <Icon size={20} color={active ? "#7a5c00" : "#b0946a"} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontFamily: "var(--font-hand)", fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "#7a5c00" : "#b0946a" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add expense modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(61,46,0,0.35)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <div
            className="rounded-t-[28px] overflow-y-auto"
            style={{ background: "#fdf8f0", maxHeight: "90vh", boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "#ddc9a8" }} />
            </div>
            <AddExpenseScreen categories={categories} onSubmit={addExpense} />
          </div>
        </div>
      )}
    </div>
  );
}
