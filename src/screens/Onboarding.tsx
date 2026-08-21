import { useState } from "react";
import { CalendarDays, Banknote, FolderOpen, PartyPopper, Wallet, CreditCard, ChevronLeft } from "lucide-react";
import type { UserProfile, Category, IncomeSource } from "../types";
import { DEFAULT_CATEGORIES, DEFAULT_INCOME } from "../types";

const hand = "var(--font-hand)";
const TOTAL_STEPS = 4;

type Props = { onDone: (profile: UserProfile) => void };

function DayPicker({
  value, onChange,
}: { value: number | "end" | null; onChange: (v: number | "end" | null) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className="w-9 h-9 rounded-full transition-all text-sm"
          style={{
            fontFamily: hand,
            background: value === d ? "#f5a623" : "#f5ece0",
            color: value === d ? "white" : "#7a5c30",
            border: value === d ? "2px solid #e8921a" : "2px solid transparent",
            boxShadow: value === d ? "1px 2px 0px #e8921a" : "none",
          }}
        >
          {d}
        </button>
      ))}
      <button
        onClick={() => onChange("end")}
        className="px-3 h-9 rounded-full transition-all text-sm"
        style={{
          fontFamily: hand,
          background: value === "end" ? "#f5a623" : "#f5ece0",
          color: value === "end" ? "white" : "#7a5c30",
          border: value === "end" ? "2px solid #e8921a" : "2px solid transparent",
          boxShadow: value === "end" ? "1px 2px 0px #e8921a" : "none",
        }}
      >
        月末
      </button>
      <button
        onClick={() => onChange(null)}
        className="px-3 h-9 rounded-full transition-all text-sm"
        style={{
          fontFamily: hand,
          background: value === null ? "#e0e0e0" : "#f5ece0",
          color: value === null ? "#666" : "#7a5c30",
          border: value === null ? "2px solid #bbb" : "2px solid transparent",
          boxShadow: value === null ? "1px 2px 0px #bbb" : "none",
        }}
      >
        設定しない
      </button>
    </div>
  );
}

function StepDot({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{ width: i === current ? 20 : 8, height: 8, background: i <= current ? "#f5a623" : "#e8d9c0" }}
        />
      ))}
    </div>
  );
}

function CatIcon({ cat, size = 18 }: { cat: Category; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {cat.id === "food" && <><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></>}
      {cat.id === "fun" && <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>}
      {cat.id === "school" && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>}
      {cat.id === "daily" && <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>}
      {cat.id === "transport" && <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>}
      {!["food", "fun", "school", "daily", "transport"].includes(cat.id) && <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

type IncomeToggle = { enabled: boolean; day: number | "end"; amount: string };

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [savings, setSavings] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [payday, setPayday] = useState<number | "end" | null>(25);
  const [withdrawalDay, setWithdrawalDay] = useState<number | "end" | null>(27);
  const [furisode, setFurisode] = useState<IncomeToggle>({ enabled: true, day: 1, amount: "" });
  const [scholarship, setScholarship] = useState<IncomeToggle>({ enabled: false, day: 15, amount: "" });
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  function next() { setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  function finish() {
    const incomeSources: IncomeSource[] = [];
    if (furisode.enabled) incomeSources.push({ id: "furisode", label: "仕送り", amount: parseInt(furisode.amount) || 0, day: furisode.day });
    if (scholarship.enabled) incomeSources.push({ id: "scholarship", label: "奨学金", amount: parseInt(scholarship.amount) || 0, day: scholarship.day });

    onDone({
      savings: parseInt(savings.replace(/,/g, "")) || 0,
      savingsGoal: parseInt(savingsGoal.replace(/,/g, "")) || 0,
      payday: payday ?? "end",
      withdrawalDay: withdrawalDay ?? "end",
      incomeSources,
      categories,
    });
  }

  function updateCatBudget(id: string, val: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, budget: parseInt(val.replace(/,/g, "")) || 0 } : c)));
  }

  const card = {
    background: "#fffdf7",
    border: "2px solid #ede0cc",
    boxShadow: "3px 4px 0px #ddc9a8",
    borderRadius: 20,
    padding: "20px 16px",
  };

  const inputStyle = {
    fontFamily: hand, fontSize: 16, color: "#3d2e00",
    background: "transparent", border: "none", outline: "none", width: "100%",
  };

  const fieldBox = {
    background: "#f5ece0", borderRadius: 12, padding: "10px 14px", border: "2px solid #ede0cc",
  };

  const STEP_ICONS = [
    <CalendarDays size={44} color="#f5a623" strokeWidth={1.5} />,
    <Banknote size={44} color="#f5a623" strokeWidth={1.5} />,
    <FolderOpen size={44} color="#f5a623" strokeWidth={1.5} />,
    <PartyPopper size={44} color="#f5a623" strokeWidth={1.5} />,
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fdf8f0" }}>
      <div className="max-w-lg mx-auto w-full px-4 pt-10 pb-8 flex flex-col flex-1">
        <StepDot total={TOTAL_STEPS} current={step} />

        {/* ── Step 0: 残高・貯金目標 ── */}
        {step === 0 && (
          <div className="slide-up flex flex-col gap-5">
            <div className="text-center mb-2">
              {STEP_ICONS[0]}
              <h1 style={{ fontFamily: hand, fontSize: 26, fontWeight: 600, color: "#5c4a2a", marginTop: 8 }}>
                はじめましょう
              </h1>
              <p style={{ fontFamily: hand, fontSize: 14, color: "#a08060", marginTop: 4 }}>
                まず基本情報を教えてください
              </p>
            </div>
            <div style={card}>
              <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 4 }}>いまの全財産</p>
              <div style={fieldBox} className="flex items-center gap-2">
                <span style={{ fontFamily: hand, fontSize: 16, color: "#a08060" }}>¥</span>
                <input style={inputStyle} type="number" placeholder="0" value={savings} onChange={(e) => setSavings(e.target.value)} />
              </div>
              <p style={{ fontFamily: hand, fontSize: 12, color: "#c0a080", marginTop: 6 }}>※あとで変更できます</p>
            </div>
            <div style={card}>
              <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 4 }}>今月の貯金目標</p>
              <div style={fieldBox} className="flex items-center gap-2">
                <span style={{ fontFamily: hand, fontSize: 16, color: "#a08060" }}>¥</span>
                <input style={inputStyle} type="number" placeholder="10000" value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: 給料日・引き落とし日 ── */}
        {step === 1 && (
          <div className="slide-up flex flex-col gap-5">
            <div className="text-center mb-2">
              {STEP_ICONS[0]}
              <h1 style={{ fontFamily: hand, fontSize: 24, fontWeight: 600, color: "#5c4a2a", marginTop: 8 }}>
                お金の日程を設定
              </h1>
              <p style={{ fontFamily: hand, fontSize: 14, color: "#a08060", marginTop: 4 }}>
                通知やリセットに使います
              </p>
            </div>
            <div style={card} className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={16} color="#a08060" />
                <span style={{ fontFamily: hand, fontSize: 13, color: "#a08060" }}>給料日・振込日</span>
              </div>
              <DayPicker value={payday} onChange={setPayday} />
              <div style={{ height: 1, background: "#ede0cc" }} />
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} color="#a08060" />
                <span style={{ fontFamily: hand, fontSize: 13, color: "#a08060" }}>クレカの引き落とし日</span>
              </div>
              <DayPicker value={withdrawalDay} onChange={setWithdrawalDay} />
            </div>
          </div>
        )}

        {/* ── Step 2: 仕送り・奨学金 ── */}
        {step === 2 && (
          <div className="slide-up flex flex-col gap-4">
            <div className="text-center mb-2">
              {STEP_ICONS[1]}
              <h1 style={{ fontFamily: hand, fontSize: 24, fontWeight: 600, color: "#5c4a2a", marginTop: 8 }}>
                収入の設定
              </h1>
              <p style={{ fontFamily: hand, fontSize: 14, color: "#a08060", marginTop: 4 }}>
                金額と振込日を教えてください
              </p>
            </div>

            {/* 仕送り */}
            <div style={card} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: hand, fontSize: 16, fontWeight: 600, color: "#5c4a2a" }}>仕送り</span>
                <div className="flex gap-2">
                  {(["あり", "なし"] as const).map((opt) => {
                    const isSelected = opt === "あり" ? furisode.enabled : !furisode.enabled;
                    return (
                      <button
                        key={opt}
                        onClick={() => setFurisode((f) => ({ ...f, enabled: opt === "あり" }))}
                        className="px-4 py-1.5 rounded-full text-sm transition-all"
                        style={{
                          fontFamily: hand,
                          background: isSelected ? "#f5a623" : "#f5ece0",
                          color: isSelected ? "white" : "#7a5c30",
                          border: isSelected ? "2px solid #e8921a" : "2px solid transparent",
                          boxShadow: isSelected ? "1px 2px 0px #e8921a" : "none",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              {furisode.enabled && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 6 }}>月の金額（わかれば）</p>
                    <div style={fieldBox} className="flex items-center gap-2">
                      <span style={{ fontFamily: hand, fontSize: 15, color: "#a08060" }}>¥</span>
                      <input
                        style={inputStyle}
                        type="number"
                        placeholder="50000"
                        value={furisode.amount}
                        onChange={(e) => setFurisode((f) => ({ ...f, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 6 }}>振込日</p>
                    <DayPicker
                      value={furisode.day}
                      onChange={(v) => setFurisode((f) => ({ ...f, day: v ?? 1 }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 奨学金 */}
            <div style={card} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: hand, fontSize: 16, fontWeight: 600, color: "#5c4a2a" }}>奨学金</span>
                <div className="flex gap-2">
                  {(["あり", "なし"] as const).map((opt) => {
                    const isSelected = opt === "あり" ? scholarship.enabled : !scholarship.enabled;
                    return (
                      <button
                        key={opt}
                        onClick={() => setScholarship((f) => ({ ...f, enabled: opt === "あり" }))}
                        className="px-4 py-1.5 rounded-full text-sm transition-all"
                        style={{
                          fontFamily: hand,
                          background: isSelected ? "#f5a623" : "#f5ece0",
                          color: isSelected ? "white" : "#7a5c30",
                          border: isSelected ? "2px solid #e8921a" : "2px solid transparent",
                          boxShadow: isSelected ? "1px 2px 0px #e8921a" : "none",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              {scholarship.enabled && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 6 }}>月の金額（わかれば）</p>
                    <div style={fieldBox} className="flex items-center gap-2">
                      <span style={{ fontFamily: hand, fontSize: 15, color: "#a08060" }}>¥</span>
                      <input
                        style={inputStyle}
                        type="number"
                        placeholder="30000"
                        value={scholarship.amount}
                        onChange={(e) => setScholarship((f) => ({ ...f, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 6 }}>振込日</p>
                    <DayPicker
                      value={scholarship.day}
                      onChange={(v) => setScholarship((f) => ({ ...f, day: v ?? 15 }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: カテゴリ予算 ── */}
        {step === 3 && (
          <div className="slide-up flex flex-col gap-4">
            <div className="text-center mb-2">
              {STEP_ICONS[2]}
              <h1 style={{ fontFamily: hand, fontSize: 24, fontWeight: 600, color: "#5c4a2a", marginTop: 8 }}>
                カテゴリの予算
              </h1>
              <p style={{ fontFamily: hand, fontSize: 14, color: "#a08060", marginTop: 4 }}>
                1ヶ月の目安金額を入れてください
              </p>
            </div>
            <div style={card} className="flex flex-col gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}22` }}>
                    <CatIcon cat={cat} size={18} />
                  </div>
                  <span style={{ fontFamily: hand, fontSize: 14, color: "#5c4a2a", minWidth: 64 }}>{cat.label}</span>
                  <div style={{ ...fieldBox, flex: 1 }} className="flex items-center gap-1">
                    <span style={{ fontFamily: hand, fontSize: 13, color: "#a08060" }}>¥</span>
                    <input
                      style={{ ...inputStyle, fontSize: 14 }}
                      type="number"
                      value={cat.budget || ""}
                      onChange={(e) => updateCatBudget(cat.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: 完了 ── */}
        {step === TOTAL_STEPS - 1 && (
          <div className="slide-up flex flex-col items-center gap-5 pt-8">
            <div
              style={{
                width: 100, height: 100, borderRadius: 28,
                background: "#ffe066", boxShadow: "4px 5px 0px #d4a800",
                transform: "rotate(-2deg)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <PartyPopper size={52} color="#d4a800" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1 style={{ fontFamily: hand, fontSize: 28, fontWeight: 600, color: "#5c4a2a" }}>
                準備完了！
              </h1>
              <p style={{ fontFamily: hand, fontSize: 14, color: "#a08060", marginTop: 8, lineHeight: 1.6 }}>
                設定が終わりました<br />さっそく家計簿をはじめましょう！
              </p>
            </div>
            <div style={{ ...card, width: "100%" }} className="flex flex-col gap-2">
              {[
                { label: "残高", value: `¥${parseInt(savings) ? parseInt(savings).toLocaleString("ja-JP") : 0}` },
                { label: "貯金目標", value: `月 ¥${parseInt(savingsGoal) ? parseInt(savingsGoal).toLocaleString("ja-JP") : 0}` },
                { label: "給料日", value: payday === null ? "設定なし" : payday === "end" ? "月末" : `毎月${payday}日` },
                { label: "引き落とし日", value: withdrawalDay === null ? "設定なし" : withdrawalDay === "end" ? "月末" : `毎月${withdrawalDay}日` },
                { label: "仕送り", value: furisode.enabled ? (furisode.day === "end" ? "月末" : `毎月${furisode.day}日`) : "なし" },
                { label: "奨学金", value: scholarship.enabled ? (scholarship.day === "end" ? "月末" : `毎月${scholarship.day}日`) : "なし" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span style={{ fontFamily: hand, fontSize: 13, color: "#a08060" }}>{label}</span>
                  <span style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#3d2e00" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-auto pt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={prev}
              className="py-3 px-5 rounded-[14px] flex items-center gap-1"
              style={{ fontFamily: hand, fontSize: 15, color: "#a08060", background: "#f5ece0", border: "2px solid #ede0cc" }}
            >
              <ChevronLeft size={16} /> もどる
            </button>
          )}
          <button
            onClick={step === TOTAL_STEPS - 1 ? finish : next}
            className="flex-1 py-3.5 rounded-[14px] text-white transition-all active:scale-[0.97]"
            style={{ fontFamily: hand, fontSize: 16, fontWeight: 600, background: "#f5a623", boxShadow: "3px 4px 0px #e8921a" }}
          >
            {step === TOTAL_STEPS - 1 ? "はじめる" : "つぎへ →"}
          </button>
        </div>
      </div>
    </div>
  );
}
