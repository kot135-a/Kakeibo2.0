export type ReceiptResult = {
  store: string;
  date: string;
  amount: number;
  catId: string;
  pay: string;
};

// レシート画像をサーバー側の API（/api/scan-receipt）に送るだけ。
// Gemini呼び出しとAPIキーはすべてサーバー側（api/scan-receipt.ts）で処理されるため、
// このファイル（ブラウザ側コード）にAPIキーは一切登場しない。
export async function scanReceipt(imageFile: File): Promise<ReceiptResult> {
  const imageBase64 = await fileToBase64(imageFile);

  const res = await fetch("/api/scan-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType: imageFile.type }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "AIの解析に失敗しました");
  }

  const parsed = (await res.json()) as ReceiptResult;
  return {
    store: parsed.store || "不明な店舗",
    date: parsed.date || formatToday(),
    amount: Math.abs(Number(parsed.amount)) || 0,
    catId: ["food", "fun", "school", "daily", "transport"].includes(parsed.catId) ? parsed.catId : "food",
    pay: ["現金", "クレジットカード", "電子マネー", "QR決済"].includes(parsed.pay) ? parsed.pay : "現金",
  };
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
