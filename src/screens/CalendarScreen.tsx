import { useState } from "react";
import { ChevronLeft, ChevronRight, Inbox, CalendarDays, Banknote, Smile, BookOpen, Heart, Train } from "lucide-react";

const hand = "var(--font-hand)";
function fmt(n: number) { return n.toLocaleString("ja-JP"); }

type Expense = {
  id: string;
  label: string;
  catId: string;
  catColor: string;
  amount: number;
  pay: string;
  memo?: string;
};

type DayRecord = { [dateKey: string]: Expense[] };

const MOCK: DayRecord = {
  "2026-08-01": [
    { id: "1", label: "日常生活", catId: "daily", catColor: "#55efc4", amount: 1480, pay: "電子マネー", memo: "シャンプー・コンディショナー" },
  ],
  "2026-08-03": [
    { id: "2", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 648, pay: "電子マネー", memo: "セブン　ランチ" },
    { id: "3", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 1200, pay: "現金", memo: "夜ご飯　定食屋" },
  ],
  "2026-08-05": [
    { id: "4", label: "交通費", catId: "transport", catColor: "#a29bfe", amount: 320, pay: "QR決済" },
  ],
  "2026-08-07": [
    { id: "5", label: "あそび", catId: "fun", catColor: "#fd79a8", amount: 2500, pay: "クレジットカード", memo: "カラオケ　友達と" },
  ],
  "2026-08-10": [
    { id: "6", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 780, pay: "現金", memo: "コンビニ" },
    { id: "7", label: "日常生活", catId: "daily", catColor: "#55efc4", amount: 398, pay: "電子マネー" },
  ],
  "2026-08-12": [
    { id: "8", label: "学校生活", catId: "school", catColor: "#74b9ff", amount: 3200, pay: "クレジットカード", memo: "教科書" },
  ],
  "2026-08-14": [
    { id: "9", label: "交通費", catId: "transport", catColor: "#a29bfe", amount: 860, pay: "QR決済", memo: "帰省の電車" },
    { id: "10", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 1560, pay: "現金", memo: "外食　家族と" },
  ],
  "2026-08-15": [
    { id: "11", label: "あそび", catId: "fun", catColor: "#fd79a8", amount: 1800, pay: "QR決済", memo: "映画" },
  ],
  "2026-08-18": [
    { id: "12", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 920, pay: "電子マネー" },
  ],
  "2026-08-19": [
    { id: "13", label: "日常生活", catId: "daily", catColor: "#55efc4", amount: 2180, pay: "クレジットカード", memo: "薬局" },
    { id: "14", label: "交通費", catId: "transport", catColor: "#a29bfe", amount: 210, pay: "QR決済" },
  ],
  "2026-08-20": [
    { id: "15", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 648, pay: "電子マネー", memo: "セブン　ランチ" },
  ],
  "2026-08-22": [
    { id: "16", label: "学校生活", catId: "school", catColor: "#74b9ff", amount: 550, pay: "現金", memo: "コピー代" },
  ],
  "2026-08-25": [
    { id: "17", label: "あそび", catId: "fun", catColor: "#fd79a8", amount: 4200, pay: "クレジットカード", memo: "ゲーム" },
    { id: "18", label: "ごはん", catId: "food", catColor: "#ff9f43", amount: 1100, pay: "現金", memo: "ラーメン" },
  ],
};

function CatIconById({ catId, color, size = 16 }: { catId: string; color: string; size?: number }) {
  const props = { size, color, strokeWidth: 1.8 };
  if (catId === "food")      return <Banknote {...props} />;
  if (catId === "fun")       return <Smile {...props} />;
  if (catId === "school")    return <BookOpen {...props} />;
  if (catId === "daily")     return <Heart {...props} />;
  if (catId === "transport") return <Train {...props} />;
  return <Banknote {...props} />;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarScreen() {
  const today = new Date(2026, 7, 20);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>("2026-08-20");

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected("");
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected("");
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const selectedExpenses = selected ? (MOCK[selected] || []) : [];
  const selectedTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);

  const isToday = (d: number) => {
    const t = new Date();
    return d === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-4">

      {/* Calendar card */}
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "3px 4px 0px #ddc9a8" }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1.5px solid #ede0cc" }}>
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "#f5ece0", border: "1.5px solid #ddc9a8" }}
          >
            <ChevronLeft size={18} color="#7a5c30" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#3d2e00", fontFamily: hand }}>
            {year}年&nbsp;{month + 1}月
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "#f5ece0", border: "1.5px solid #ddc9a8" }}
          >
            <ChevronRight size={18} color="#7a5c30" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className="text-center" style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? "#e74c3c" : i === 6 ? "#3498db" : "#a08060", paddingBottom: 4, fontFamily: hand }}>
              {w}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const key = dateKey(d);
            const hasData = !!MOCK[key];
            const isSelected = selected === key;
            const dayTotal = hasData ? MOCK[key].reduce((s, e) => s + e.amount, 0) : 0;
            const col = i % 7;
            const isSun = col === 0;
            const isSat = col === 6;

            return (
              <button
                key={key}
                onClick={() => setSelected(isSelected ? "" : key)}
                className="flex flex-col items-center py-1.5 rounded-[12px] transition-all active:scale-90"
                style={{
                  background: isSelected ? "#f5a623" : isToday(d) ? "#ffe066" : "transparent",
                  border: isSelected ? "2px solid #e8921a" : isToday(d) ? "2px solid #d4a800" : "2px solid transparent",
                  boxShadow: isSelected ? "1px 2px 0px #e8921a" : "none",
                  minHeight: 50,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: isSelected || isToday(d) ? 600 : 400, color: isSelected ? "white" : isSun ? "#e74c3c" : isSat ? "#3498db" : "#3d2e00", lineHeight: 1, fontFamily: hand }}>
                  {d}
                </span>
                {hasData && (
                  <span style={{ fontSize: 9, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.9)" : "#f5a623", marginTop: 2, letterSpacing: "-0.2px", fontFamily: hand }}>
                    ¥{dayTotal >= 1000 ? `${Math.round(dayTotal / 100) / 10}k` : dayTotal}
                  </span>
                )}
                {hasData && !isSelected && (
                  <div className="rounded-full mt-0.5" style={{ width: 4, height: 4, background: "#f5a623" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day records */}
      {selected ? (
        <div className="flex flex-col gap-3 slide-up">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 15, fontWeight: 600, color: "#5c4a2a", fontFamily: hand }}>
              {parseInt(selected.split("-")[1])}月{parseInt(selected.split("-")[2])}日の記録
            </p>
            {selectedExpenses.length > 0 && (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f5a623", fontFamily: hand }}>
                合計 ¥{fmt(selectedTotal)}
              </p>
            )}
          </div>

          {selectedExpenses.length === 0 ? (
            <div
              className="rounded-[18px] py-10 flex flex-col items-center gap-3"
              style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}
            >
              <Inbox size={36} color="#c0a080" strokeWidth={1.5} />
              <p style={{ fontSize: 13, color: "#a08060", fontFamily: hand }}>この日の記録はありません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {selectedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-[16px] px-4 py-3.5 flex items-center gap-3"
                  style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${exp.catColor}22` }}>
                    <CatIconById catId={exp.catId} color={exp.catColor} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#3d2e00", fontFamily: hand }}>{exp.label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span style={{ fontSize: 10, color: "#a08060", fontFamily: hand }}>{exp.pay}</span>
                      {exp.memo && (
                        <>
                          <span style={{ color: "#ddc9a8", fontSize: 10 }}>·</span>
                          <span style={{ fontSize: 10, color: "#b0946a", fontFamily: hand }} className="truncate">{exp.memo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#3d2e00", flexShrink: 0, fontFamily: hand }}>
                    ¥{fmt(exp.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-[18px] py-8 flex flex-col items-center gap-3"
          style={{ background: "#fffdf7", border: "2px dashed #ddc9a8" }}
        >
          <CalendarDays size={32} color="#c0a080" strokeWidth={1.5} />
          <p style={{ fontSize: 13, color: "#a08060", fontFamily: hand }}>日付を選ぶと記録が見られます</p>
        </div>
      )}
    </div>
  );
}
