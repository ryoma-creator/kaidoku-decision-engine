// ── Situation types ──
export type Situation = "既読スルー" | "デート後" | "温度差" | "敬語→タメ口";

export type Relationship = "マッチング相手" | "友達以上未満" | "恋人";

export type Tone = "さりげなく" | "ちょい好意" | "大人っぽく" | "ユーモア";

// ── Psychology principles (safe, widely accepted) ──
export type PsychologyPrinciple =
  | "ミラーリング"
  | "返報性"
  | "希少性"
  | "フット・イン・ザ・ドア"
  | "ポジティブ・フレーミング"
  | "認知負荷の軽減"
  | "選択設計";

// ── Communication Insight (Psychology Layer) ──
export interface CommunicationInsight {
  strategy_used: string;            // 使った戦略名
  psychology_principle: PsychologyPrinciple; // 根拠となる心理原則
  why_it_works: string;             // なぜ効くか（2行以内）
  risk_if_wrong: string;            // 使い方を間違えた場合の注意
  when_not_to_use: string;          // この戦略を使わないほうがいい場面
  source_note: string;              // 出典表現（安全な言い回し）
}

// ── AI response ──
export interface AIResponse {
  decision: "送る" | "待つ";
  best_reply: string;
  backup_reply: string;
  ng_reply: string;
  next_step: string;
  // ── Success story fields ──
  why_it_works?: string;
  expected_reaction?: string;
  reaction_followup?: string;
  // ── Psychology Insight Layer ──
  insight?: CommunicationInsight;
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
