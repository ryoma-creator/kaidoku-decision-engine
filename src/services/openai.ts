import { SYSTEM_PROMPT, buildUserPrompt } from "../constants/prompt";
import { getApiKey } from "./storage";
import { USE_MOCK } from "../constants/options";
import { generateReplyMock } from "./mockData";
import type { AIResponse, ComposeFormData } from "../types";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 15_000;

export class OpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

// ── Fetch with timeout ──
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── Call OpenAI Responses API (or mock) ──
export async function generateReply(
  form: ComposeFormData
): Promise<AIResponse> {
  // ── Mock mode: no API call ──
  if (USE_MOCK) {
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
    return generateReplyMock(form);
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new OpenAIError(
      "APIキーが設定されていません。設定画面からキーを入力してください。"
    );
  }

  const userPrompt = buildUserPrompt({
    situation: form.situation,
    conversation: form.conversation,
    relationship: form.relationship,
    tone: form.tone,
    hoursSinceRead:
      form.situation === "既読スルー" ? form.hoursSinceRead : undefined,
  });

  let res: Response;
  try {
    res = await fetchWithTimeout(
      OPENAI_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          text: {
            format: {
              type: "json_object",
            },
          },
        }),
      },
      TIMEOUT_MS
    );
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new OpenAIError("リクエストがタイムアウトしました。再度お試しください。");
    }
    throw new OpenAIError("ネットワークエラーが発生しました。接続を確認してください。");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) {
      throw new OpenAIError("APIキーが無効です。正しいキーを設定してください。", 401);
    }
    if (res.status === 429) {
      throw new OpenAIError("レート制限に達しました。しばらく待ってから再試行してください。", 429);
    }
    throw new OpenAIError(
      `APIエラー (${res.status}): ${body.slice(0, 200)}`,
      res.status
    );
  }

  const json = await res.json();

  // Responses API returns output array
  const outputText =
    json.output?.[0]?.content?.[0]?.text ?? json.choices?.[0]?.message?.content;

  if (!outputText) {
    throw new OpenAIError("AIからの応答が空でした。再度お試しください。");
  }

  try {
    const parsed: AIResponse = JSON.parse(outputText);

    // Validate required fields
    if (
      !parsed.decision ||
      !parsed.best_reply ||
      !parsed.backup_reply ||
      !parsed.ng_reply ||
      !parsed.next_step
    ) {
      throw new Error("Missing fields");
    }

    return parsed;
  } catch {
    throw new OpenAIError("AIの応答を解析できませんでした。再度お試しください。");
  }
}
