import { GoogleGenerativeAI } from "@google/generative-ai";

export type ReceiptResult = {
  store: string;
  date: string;
  amount: number;
  catId: string;
  pay: string;
};

const CATEGORY_HINT = `
カテゴリは以下から最も適切なものを1つ選んでください：
- food（飲食店・コンビニ・スーパー・食料品）
- fun（エンタメ・ゲーム・カラオケ・映画・旅行）
- school（書籍・文具・学費・コピー）
- daily（薬局・日用品・美容・クリーニング）
- transport（電車・バス・タクシー・ガソリン）
`.trim();

export async function scanReceipt(imageFile: File): Promise<ReceiptResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY が設定されていません");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const base64 = await fileToBase64(imageFile);

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
    { inlineData: { mimeType: imageFile.type as "image/jpeg" | "image/png" | "image/webp", data: base64 } },
  ]);

  const text = result.response.text().trim();
  const json = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  try {
    const parsed = JSON.parse(json) as ReceiptResult;
    return {
      store: parsed.store || "不明な店舗",
      date: parsed.date || formatToday(),
      amount: Math.abs(Number(parsed.amount)) || 0,
      catId: ["food", "fun", "school", "daily", "transport"].includes(parsed.catId) ? parsed.catId : "food",
      pay: ["現金", "クレジットカード", "電子マネー", "QR決済"].includes(parsed.pay) ? parsed.pay : "現金",
    };
  } catch {
    throw new Error("AIの返答を解析できませんでした");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatToday(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
