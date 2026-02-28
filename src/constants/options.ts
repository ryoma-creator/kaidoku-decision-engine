import type { Situation, Relationship, Tone } from "../types";

export interface SituationOption {
  id: Situation;
  emoji: string;
  label: string;
  description: string;
}

export const SITUATIONS: SituationOption[] = [
  {
    id: "既読スルー",
    emoji: "👀",
    label: "既読スルー",
    description: "既読ついたのに返信がない…",
  },
  {
    id: "デート後",
    emoji: "🍽",
    label: "デート後",
    description: "デート後の最初のメッセージ",
  },
  {
    id: "温度差",
    emoji: "🌡",
    label: "温度差",
    description: "自分ばかり盛り上がってる…？",
  },
  {
    id: "敬語→タメ口",
    emoji: "💬",
    label: "敬語→タメ口",
    description: "距離を縮めたいけどタイミングが…",
  },
];

export const RELATIONSHIPS: { id: Relationship; label: string }[] = [
  { id: "マッチング相手", label: "マッチング相手" },
  { id: "友達以上未満", label: "友達以上未満" },
  { id: "恋人", label: "恋人" },
];

export const TONES: { id: Tone; label: string; emoji: string }[] = [
  { id: "さりげなく", label: "さりげなく", emoji: "🍃" },
  { id: "ちょい好意", label: "ちょい好意", emoji: "💕" },
  { id: "大人っぽく", label: "大人っぽく", emoji: "🍷" },
  { id: "ユーモア", label: "ユーモア", emoji: "😂" },
];

// ── Usage limits ──
export const FREE_LIMIT = 5;
export const PAID_MONTHLY_LIMIT = 200;
export const IAP_PRODUCT_ID = "kaidoku_unlock_480";
