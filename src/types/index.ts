// ── Situation types ──
export type Situation = "既読スルー" | "デート後" | "温度差" | "敬語→タメ口";

export type Relationship = "マッチング相手" | "友達以上未満" | "恋人";

export type Tone = "さりげなく" | "ちょい好意" | "大人っぽく" | "ユーモア";

// ── AI response ──
export interface AIResponse {
  decision: "送る" | "待つ";
  best_reply: string;
  backup_reply: string;
  ng_reply: string;
  next_step: string;
  // ── Success story fields (mock / enhanced) ──
  why_it_works?: string;        // 短い理由（心理ポイント）
  expected_reaction?: string;   // 相手の返信例（成功演出）
  reaction_followup?: string;   // その後の展開
}

// ── Compose form data ──
export interface ComposeFormData {
  situation: Situation;
  conversation: string;
  relationship: Relationship;
  tone: Tone;
  hoursSinceRead: number; // 0-72, only relevant for 既読スルー
}

// ── Usage tracking ──
export interface UsageData {
  totalFreeUsed: number;
  monthlyUsed: number;
  currentMonth: string; // "YYYY-MM"
  isPurchased: boolean;
}

// ── AI smell check ──
export interface AISmellWarning {
  type: "too_long" | "too_polite" | "too_many_compliments";
  message: string;
}
