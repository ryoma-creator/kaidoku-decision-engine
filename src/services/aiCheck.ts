import type { AIResponse, AISmellWarning } from "../types";

// ── AI臭チェック heuristics ──
// Warn if a reply looks too "AI-generated"

const POLITE_PATTERNS = [
  /ございます/,
  /いたします/,
  /させていただ/,
  /存じます/,
  /お気持ち/,
  /心より/,
  /素敵な/,
  /素晴らしい/,
];

const COMPLIMENT_PATTERNS = [
  /可愛い/,
  /かわいい/,
  /綺麗/,
  /きれい/,
  /美しい/,
  /魅力的/,
  /素敵/,
  /最高/,
  /天使/,
  /運命/,
];

export function checkAISmell(response: AIResponse): AISmellWarning[] {
  const warnings: AISmellWarning[] = [];

  // Check best_reply length (Japanese chars)
  if (response.best_reply.length > 50) {
    warnings.push({
      type: "too_long",
      message: "⚠️ 返信が長めです。短いほど自然に見えます。",
    });
  }

  // Check for overly polite language
  const politeCount = POLITE_PATTERNS.filter((p) =>
    p.test(response.best_reply)
  ).length;
  if (politeCount >= 2) {
    warnings.push({
      type: "too_polite",
      message: "⚠️ 丁寧すぎるかも。もう少しカジュアルに。",
    });
  }

  // Check for too many compliments
  const complimentCount = COMPLIMENT_PATTERNS.filter((p) =>
    p.test(response.best_reply)
  ).length;
  if (complimentCount >= 2) {
    warnings.push({
      type: "too_many_compliments",
      message: "⚠️ 褒めすぎ注意。さりげなさが大事。",
    });
  }

  return warnings;
}
