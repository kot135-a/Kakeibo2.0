import { useState } from "react";
import { CheckCircle2, Delete } from "lucide-react";
import type { Category } from "../types";

const hand = "var(--font-hand)";

function CatIcon({ cat, active, size = 14 }: { cat: Category; active: boolean; size?: number }) {
  const color = active ? "white" : cat.color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {cat.id === "food"      && <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>}
      {cat.id === "fun"       && <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>}
      {cat.id === "school"    && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>}
      {cat.id === "daily"     && <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>}
      {cat.id === "transport" && <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
      {!["food","fun","school","daily","transport"].includes(cat.id) && <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
}

export default function AddExpenseScreen({
  categories,
  onSubmit,
}: { categories: Category[]; onSubmit: (catId: string, amount: number) => void }) {
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [done, setDone] = useState(false);

  const cat = categories.find((c) => c.id === selectedCat);

  function handleNum(n: string) {
    if (n === "←") { setAmount((p) => (p.length > 1 ? p.slice(0, -1) : "")); return; }
    if (n === "00") { setAmount((p) => (p ? p + "00" : "")); return; }
    setAmount((p) => p + n);
  }

  function handleSubmit() {
    const num = parseInt(amount);
    if (!num || !selectedCat) return;
    onSubmit(selectedCat, num);
    setDone(true);
    setTimeout(() => { setDone(false); setAmount(""); setMemo(""); }, 900);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          style={{
            width: 88, height: 88, borderRadius: 24,
            background: "#e8f5e9", border: "3px solid #a5d6a7",
            boxShadow: "3px 4px 0px #a5d6a7",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <CheckCircle2 size={48} color="#2e7d32" strokeWidth={1.5} />
        </div>
        <p style={{ fontFamily: hand, fontSize: 22, fontWeight: 600, color: "#2e7d32" }}>記録しました</p>
      </div>
    );
  }

  const displayAmount = amount ? parseInt(amount).toLocaleString("ja-JP") : "0";

  return (
    <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
      <h1 style={{ fontFamily: hand, fontSize: 22, fontWeight: 600, color: "#5c4a2a" }}>支出を入力</h1>

      {/* Category selector */}
      <div className="rounded-[18px] p-3" style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
        <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060", marginBottom: 8 }}>カテゴリ</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all active:scale-95"
              style={{
                fontFamily: hand, fontSize: 13,
                background: selectedCat === c.id ? c.color : "#f5ece0",
                color: selectedCat === c.id ? "white" : "#7a5c30",
                border: selectedCat === c.id ? `2px solid ${c.color}` : "2px solid #ede0cc",
                boxShadow: selectedCat === c.id ? `1px 2px 0px ${c.color}` : "none",
              }}
            >
              <CatIcon cat={c} active={selectedCat === c.id} size={13} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount display */}
      <div
        className="rounded-[18px] px-5 py-4 flex flex-col items-center"
        style={{ background: "#fffbe6", border: "2px solid #ffe082", boxShadow: "2px 3px 0px #ffd54f" }}
      >
        {cat && (
          <p style={{ fontFamily: hand, fontSize: 13, color: "#7a5c00", marginBottom: 4 }}>
            {cat.label} — 残り ¥{Math.max(cat.budget - cat.spent, 0).toLocaleString("ja-JP")}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: hand, fontSize: 26, color: "#a08060" }}>¥</span>
          <span style={{ fontFamily: hand, fontSize: 52, fontWeight: 600, color: "#f5a623", lineHeight: 1 }}>
            {displayAmount}
          </span>
        </div>
      </div>

      {/* Memo */}
      <div
        className="rounded-[14px] px-4 py-3 flex items-center gap-2"
        style={{ background: "#fffdf7", border: "2px solid #ede0cc" }}
      >
        <input
          style={{ fontFamily: hand, fontSize: 14, color: "#3d2e00", background: "transparent", outline: "none", border: "none", flex: 1 }}
          placeholder="メモ（任意）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {["1","2","3","4","5","6","7","8","9","00","0","←"].map((n) => (
          <button
            key={n}
            onClick={() => handleNum(n)}
            className="h-12 rounded-[14px] flex items-center justify-center transition-all active:scale-95"
            style={{
              fontFamily: hand,
              fontSize: n === "←" ? 16 : 20,
              fontWeight: 600,
              background: n === "←" ? "#f5ece0" : "white",
              color: n === "←" ? "#7a5c30" : "#3d2e00",
              border: "2px solid #ede0cc",
              boxShadow: "1px 2px 0px #ddc9a8",
            }}
          >
            {n === "←" ? <Delete size={18} color="#7a5c30" /> : n}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 rounded-[14px] text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        style={{
          fontFamily: hand, fontSize: 16, fontWeight: 600,
          background: amount ? "#f5a623" : "#d4c4a0",
          boxShadow: amount ? "3px 4px 0px #e8921a" : "none",
        }}
      >
        <CheckCircle2 size={18} strokeWidth={2.5} />
        記録する
      </button>
    </div>
  );
}
