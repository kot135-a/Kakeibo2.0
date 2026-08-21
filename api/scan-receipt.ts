import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel Serverless Function
// これはブラウザには配信されず、Vercelのサーバー上でだけ実行されます。
// そのため、ここで読み込む GEMINI_API_KEY はブラウザ側に一切露出しません。
// （VITE_ を付けないことで Vite のクライアントバンドルにも含まれません）

export const config = {
  runtime: "nodejs",
};

const CATEGORY_HINT = `
カテゴリは以下から最も適切なものを1つ選んでください：
- food（飲食店・コンビニ・スーパー・食料品）
- fun（エンタメ・ゲーム・カラオケ・映画・旅行）
- school（書籍・文具・学費・コピー）
- daily（薬局・日用品・美容・クリーニング）
- transport（電車・バス・タクシー・ガソリン）
`.trim();

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: "サーバー側に GEMINI_API_KEY が設定されていません" }, 500);
  }

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "リクエストボディの形式が不正です" }, 400);
  }

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return json({ error: "imageBase64 と mimeType は必須です" }, 400);
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    return json({ error: "対応していない画像形式です" }, 400);
  }
  // 大きすぎるアップロードを拒否（base64はおよそ元サイズの1.37倍）
  if (imageBase64.length > 8_000_000) {
    return json({ error: "画像サイズが大きすぎます" }, 413);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
このレシート画像を解析して、以下のJSON形式のみで返してください。余分なテキストは一切不要です。

{
  "store": "店舗名",
  "date": "YYYY年MM月DD日 HH:MM",
  "amount": 金額(整数・円),
  "catId": "カテゴリID",
  "pay": "支払い方法"
}

${CATEGORY_HINT}

支払い方法は「現金」「クレジットカード」「電子マネー」「QR決済」のいずれかを推測してください。
不明な場合は「現金」にしてください。
日付が読み取れない場合は今日の日付を使用してください。
`.trim();

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp", data: imageBase64 } },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

    const parsed = JSON.parse(cleaned) as {
      store?: string;
      date?: string;
      amount?: number;
      catId?: string;
      pay?: string;
    };

    const safeResult = {
      store: parsed.store || "不明な店舗",
      date: parsed.date || formatToday(),
      amount: Math.abs(Number(parsed.amount)) || 0,
      catId: ["food", "fun", "school", "daily", "transport"].includes(parsed.catId ?? "")
        ? parsed.catId
        : "food",
      pay: ["現金", "クレジットカード", "電子マネー", "QR決済"].includes(parsed.pay ?? "")
        ? parsed.pay
        : "現金",
    };

    return json(safeResult, 200);
  } catch (err) {
    console.error("scan-receipt error:", err);
    return json({ error: "AIの解析に失敗しました" }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function formatToday(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
