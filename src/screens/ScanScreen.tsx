import { useState, useRef } from "react";
import { Bot, Camera, CheckCircle2, ChevronLeft, RefreshCw, AlertCircle } from "lucide-react";
import type { Category } from "../types";
import { scanReceipt, type ReceiptResult } from "../lib/scanReceipt";

const hand = "var(--font-hand)";

type Phase = "upload" | "analyzing" | "confirm";

const INITIAL_RESULT: ReceiptResult = {
  store: "",
  date: "",
  amount: 0,
  catId: "food",
  pay: "電子マネー",
};

function CatIcon({ cat, active, size = 13 }: { cat: Category; active: boolean; size?: number }) {
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

export default function ScanScreen({
  onDone, categories,
}: { onDone: (catId: string, amount: number) => void; categories: Category[] }) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ReceiptResult>(INITIAL_RESULT);
  const [savedCatId, setSavedCatId] = useState("food");
  const [done, setDone] = useState(false);
  const [pay, setPay] = useState("電子マネー");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const PAY = ["現金", "クレジットカード", "電子マネー", "QR決済"];

  function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setImageFile(file);
    setError(null);
  }

  async function analyze() {
    if (!imageFile) return;
    setPhase("analyzing");
    setError(null);
    try {
      const res = await scanReceipt(imageFile);
      setResult(res);
      setSavedCatId(res.catId);
      setPay(res.pay);
      setPhase("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み取りに失敗しました");
      setPhase("upload");
    }
  }

  function handleRegister() {
    onDone(savedCatId, result.amount);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setPhase("upload");
      setPreview(null);
      setImageFile(null);
      setResult(INITIAL_RESULT);
    }, 1400);
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
        <p style={{ fontFamily: hand, fontSize: 22, fontWeight: 600, color: "#2e7d32" }}>登録しました</p>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-6">
        <div className="animate-bounce">
          <Bot size={64} color="#f5a623" strokeWidth={1.5} />
        </div>
        <p style={{ fontFamily: hand, fontSize: 20, fontWeight: 600, color: "#5c4a2a" }}>AIが読み取り中...</p>
        <p style={{ fontFamily: hand, fontSize: 13, color: "#a08060" }}>Gemini がレシートを解析しています</p>
        <div className="flex gap-1.5 mt-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: "#f5a623", animation: `bounce 0.8s ${delay}s infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "confirm") {
    const cat = categories.find((c) => c.id === savedCatId) || categories[0];

    return (
      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-4">
        <button
          onClick={() => setPhase("upload")}
          className="flex items-center gap-1"
          style={{ fontFamily: hand, fontSize: 14, color: "#f5a623", width: "fit-content" }}
        >
          <ChevronLeft size={16} /> やり直す
        </button>

        <div
          className="rounded-[14px] px-4 py-3 flex items-center gap-3"
          style={{ background: "#e3f2fd", border: "2px solid #90caf9", boxShadow: "2px 3px 0px #90caf9" }}
        >
          <Bot size={22} color="#1565c0" strokeWidth={1.8} />
          <div>
            <p style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#1565c0" }}>Gemini 読み取り完了</p>
            <p style={{ fontFamily: hand, fontSize: 12, color: "#5c8abf" }}>タップして修正できます</p>
          </div>
        </div>

        <h1 style={{ fontFamily: hand, fontSize: 22, fontWeight: 600, color: "#5c4a2a" }}>内容の確認</h1>

        {/* Fields */}
        <div className="rounded-[18px] overflow-hidden divide-y" style={{ border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
          <div className="px-4 py-3.5" style={{ background: "#fffdf7" }}>
            <p style={{ fontFamily: hand, fontSize: 11, color: "#a08060", marginBottom: 2 }}>店名</p>
            <input
              style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, color: "#3d2e00", background: "transparent", outline: "none", width: "100%", border: "none" }}
              value={result.store}
              onChange={(e) => setResult({ ...result, store: e.target.value })}
            />
          </div>
          <div className="px-4 py-3.5" style={{ background: "#fffdf7" }}>
            <p style={{ fontFamily: hand, fontSize: 11, color: "#a08060", marginBottom: 2 }}>日時</p>
            <p style={{ fontFamily: hand, fontSize: 15, color: "#3d2e00" }}>{result.date}</p>
          </div>
          <div className="px-4 py-3.5" style={{ background: "#fffdf7" }}>
            <p style={{ fontFamily: hand, fontSize: 11, color: "#a08060", marginBottom: 2 }}>合計金額</p>
            <div className="flex items-center gap-1">
              <span style={{ fontFamily: hand, fontSize: 20, color: "#5c4a2a" }}>¥</span>
              <input
                style={{ fontFamily: hand, fontSize: 28, fontWeight: 600, color: "#f5a623", background: "transparent", outline: "none", width: "100%", border: "none" }}
                type="number"
                value={result.amount}
                onChange={(e) => setResult({ ...result, amount: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="rounded-[18px] p-4" style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
          <p style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#5c4a2a", marginBottom: 10 }}>
            カテゴリ
            <span className="ml-2 px-2 py-0.5 rounded-full text-[11px]" style={{ background: "#e3f2fd", color: "#1565c0" }}>AI判定</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSavedCatId(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                style={{
                  fontFamily: hand, fontSize: 13,
                  background: savedCatId === c.id ? "#f5a623" : "#f5ece0",
                  color: savedCatId === c.id ? "white" : "#7a5c30",
                  border: savedCatId === c.id ? "2px solid #e8921a" : "2px solid #ede0cc",
                }}
              >
                <CatIcon cat={c} active={savedCatId === c.id} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-[18px] p-4" style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
          <p style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#5c4a2a", marginBottom: 10 }}>支払い方法</p>
          <div className="flex flex-wrap gap-2">
            {PAY.map((p) => (
              <button
                key={p}
                onClick={() => setPay(p)}
                className="px-3 py-1.5 rounded-full transition-all"
                style={{
                  fontFamily: hand, fontSize: 13,
                  background: pay === p ? "#3d2e00" : "#f5ece0",
                  color: pay === p ? "white" : "#7a5c30",
                  border: pay === p ? "2px solid #3d2e00" : "2px solid #ede0cc",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div
          className="flex items-center gap-3 rounded-[16px] px-4 py-3"
          style={{ background: "#fffbe6", border: "2px solid #ffe082" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}22` }}>
            <CatIcon cat={cat} active={false} size={18} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: hand, fontSize: 14, fontWeight: 600, color: "#3d2e00" }}>{result.store}</p>
            <p style={{ fontFamily: hand, fontSize: 12, color: "#a08060" }}>{cat.label} · {pay}</p>
          </div>
          <p style={{ fontFamily: hand, fontSize: 20, fontWeight: 600, color: "#f5a623" }}>¥{result.amount.toLocaleString("ja-JP")}</p>
        </div>

        <button
          onClick={handleRegister}
          className="w-full py-4 rounded-[14px] text-white active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          style={{ fontFamily: hand, fontSize: 16, fontWeight: 600, background: "#f5a623", boxShadow: "3px 4px 0px #e8921a" }}
        >
          <CheckCircle2 size={18} strokeWidth={2.5} />
          登録する
        </button>
      </div>
    );
  }

  /* Upload phase */
  return (
    <div className="max-w-lg mx-auto px-4 flex flex-col" style={{ minHeight: "calc(100vh - 140px)" }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        <p style={{ fontFamily: hand, fontSize: 22, fontWeight: 600, color: "#5c4a2a", textAlign: "center" }}>
          レシートを読み取る
        </p>

        {/* Error banner */}
        {error && (
          <div
            className="w-full rounded-[14px] px-4 py-3 flex items-center gap-2"
            style={{ background: "#fff0f0", border: "2px solid #ffb3b3" }}
          >
            <AlertCircle size={16} color="#e74c3c" />
            <p style={{ fontFamily: hand, fontSize: 13, color: "#c0392b" }}>{error}</p>
          </div>
        )}

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 rounded-[28px]"
          style={{
            width: 220, height: 220,
            background: dragging ? "#fff9ec" : preview ? "transparent" : "#fffdf7",
            border: preview ? "none" : `3px dashed ${dragging ? "#f5a623" : "#ddc9a8"}`,
            boxShadow: preview ? "none" : "3px 4px 0px #ddc9a8",
            overflow: "hidden",
          }}
        >
          {preview ? (
            <img src={preview} alt="receipt" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={56} color="#c0a080" strokeWidth={1.2} />
              <p style={{ fontFamily: hand, fontSize: 14, color: "#a08060", marginTop: 12, textAlign: "center" }}>
                タップして撮影<br />またはアップロード
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={() => { setPreview(null); setImageFile(null); setError(null); }}
              className="flex-1 py-3 rounded-[14px] flex items-center justify-center gap-1.5"
              style={{ fontFamily: hand, fontSize: 14, background: "#f5ece0", color: "#7a5c30", border: "2px solid #ede0cc" }}
            >
              <RefreshCw size={14} /> やり直す
            </button>
            <button
              onClick={analyze}
              className="flex-1 py-3 rounded-[14px] text-white active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, background: "#f5a623", boxShadow: "2px 3px 0px #e8921a" }}
            >
              <Bot size={16} strokeWidth={2} /> 読み取る
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: hand, fontSize: 13, color: "#b0946a", textAlign: "center" }}>
            ドラッグ＆ドロップでもOK
          </p>
        )}
      </div>

      {/* Tips */}
      <div
        className="mx-0 mb-4 rounded-[16px] p-4"
        style={{ background: "#fffbe6", border: "2px solid #ffe082", boxShadow: "2px 3px 0px #ffd54f" }}
      >
        <p style={{ fontFamily: hand, fontSize: 13, fontWeight: 600, color: "#b07800", marginBottom: 6 }}>きれいに読み取るコツ</p>
        {["明るい場所で撮る", "全体が入るようにする", "ぼやけないよう注意"].map((t) => (
          <p key={t} style={{ fontFamily: hand, fontSize: 12, color: "#7a5c00" }}>・ {t}</p>
        ))}
      </div>
    </div>
  );
}
