import type { Category, UserProfile } from "../types";

const hand = "var(--font-hand)";
function fmt(n: number) { return n.toLocaleString("ja-JP"); }

function CatDot({ color }: { color: string }) {
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />;
}

function DonutChart({ categories }: { categories: Category[] }) {
  const total = categories.reduce((s, c) => s + c.spent, 0);
  if (total === 0) return (
    <div style={{ fontFamily: hand, color: "#a08060", textAlign: "center", padding: 24 }}>
      まだデータがありません
    </div>
  );

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 65;
  const sw = 26;

  let cumPct = 0;
  const segments = categories.filter((c) => c.spent > 0).map((cat) => {
    const pct = cat.spent / total;
    const startAngle = cumPct * 2 * Math.PI - Math.PI / 2;
    cumPct += pct;
    const endAngle = cumPct * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { cat, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="flex-shrink-0">
        {segments.map((seg, i) => (
          <path key={i} d={seg.d} fill="none" stroke={seg.cat.color} strokeWidth={sw} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#5c4a2a" fontSize="12" fontFamily="Klee One, sans-serif">合計</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#3d2e00" fontSize="14" fontWeight="600" fontFamily="Klee One, sans-serif">
          ¥{fmt(total)}
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {categories.filter((c) => c.spent > 0).map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <CatDot color={cat.color} />
            <span style={{ fontFamily: hand, fontSize: 12, color: "#5c4a2a" }}>{cat.label}</span>
            <span style={{ fontFamily: hand, fontSize: 12, fontWeight: 600, color: "#3d2e00", marginLeft: 4 }}>
              {Math.round((cat.spent / Math.max(total, 1)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WEEK_DATA = [
  { day: "月", amount: 1200 },
  { day: "火", amount: 3400 },
  { day: "水", amount: 880 },
  { day: "木", amount: 5200 },
  { day: "金", amount: 2100 },
  { day: "土", amount: 6800 },
  { day: "日", amount: 1540 },
];
const weekMax = Math.max(...WEEK_DATA.map((d) => d.amount));

export default function ChartsScreen({ categories, profile }: { categories: Category[]; profile: UserProfile }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-5">
      <h1 style={{ fontFamily: hand, fontSize: 24, fontWeight: 600, color: "#5c4a2a" }}>グラフ</h1>

      {/* Donut */}
      <div className="rounded-[18px] p-4" style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
        <p style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, color: "#5c4a2a", marginBottom: 12 }}>支出の内訳</p>
        <DonutChart categories={categories} />
      </div>

      {/* Category bars */}
      <div className="rounded-[18px] p-4" style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
        <p style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, color: "#5c4a2a", marginBottom: 12 }}>カテゴリ別の使い具合</p>
        <div className="flex flex-col gap-3.5">
          {categories.map((cat) => {
            const pct = Math.min((cat.spent / Math.max(cat.budget, 1)) * 100, 120);
            const over = cat.spent > cat.budget;
            return (
              <div key={cat.id}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <CatDot color={cat.color} />
                    <span style={{ fontFamily: hand, fontSize: 13, color: "#5c4a2a" }}>{cat.label}</span>
                  </div>
                  <span style={{ fontFamily: hand, fontSize: 12, color: over ? "#e74c3c" : "#7a5c30" }}>
                    ¥{fmt(cat.spent)} / ¥{fmt(cat.budget)}
                  </span>
                </div>
                <div className="h-3.5 rounded-full overflow-hidden" style={{ background: "#f0e8d8", border: "1.5px solid #ddc9a8" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(pct, 100)}%`, background: over ? "#ff6b6b" : cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-[18px] p-4" style={{ background: "#fffdf7", border: "2px solid #ede0cc", boxShadow: "2px 3px 0px #ddc9a8" }}>
        <p style={{ fontFamily: hand, fontSize: 15, fontWeight: 600, color: "#5c4a2a", marginBottom: 12 }}>今週の支出</p>
        <div className="flex items-end justify-between gap-1" style={{ height: 100 }}>
          {WEEK_DATA.map((d) => {
            const h = (d.amount / weekMax) * 80;
            const today = ["月","火","水","木","金","土","日"][new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
            const isToday = d.day === today;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-[6px] transition-all duration-500"
                  style={{
                    height: h || 4,
                    background: isToday ? "#f5a623" : "#ddc9a8",
                    border: isToday ? "1.5px solid #e8921a" : "1.5px solid #c0a080",
                  }}
                />
                <span style={{ fontFamily: hand, fontSize: 10, color: isToday ? "#f5a623" : "#a08060", fontWeight: isToday ? 600 : 400 }}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
