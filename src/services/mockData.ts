import type { AIResponse, Situation, ComposeFormData } from "../types";

// ── Demo auto-fill presets ──
export interface DemoPreset {
  situation: Situation;
  conversation: string;
  relationship: "マッチング相手" | "友達以上未満" | "恋人";
  tone: "さりげなく" | "ちょい好意" | "大人っぽく" | "ユーモア";
  hoursSinceRead: number;
  label: string; // デモ選択用ラベル
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    situation: "既読スルー",
    conversation:
      "自分: 昨日の写真送るね！\n自分: [写真]\n相手: ありがとう😊\n自分: 今週どこか行かない？\n相手: (既読)",
    relationship: "マッチング相手",
    tone: "さりげなく",
    hoursSinceRead: 24,
    label: "既読スルー24h — マッチング相手",
  },
  {
    situation: "デート後",
    conversation:
      "相手: 今日はありがとう！\n相手: すごく楽しかった✨\n自分: こちらこそ！\n自分: (ここから何送ろう…)",
    relationship: "マッチング相手",
    tone: "ちょい好意",
    hoursSinceRead: 0,
    label: "デート後 — お礼のあと",
  },
  {
    situation: "温度差",
    conversation:
      "自分: 来週の金曜空いてる？\n相手: んー、まだわかんないかな\n自分: じゃあ分かったら教えて！😆\n相手: うん",
    relationship: "友達以上未満",
    tone: "大人っぽく",
    hoursSinceRead: 0,
    label: "温度差 — 自分だけ盛り上がり",
  },
  {
    situation: "敬語→タメ口",
    conversation:
      "相手: お疲れさまです！今日の会議大変でしたね\n自分: お疲れさまです、ほんとに長かったですね😅\n相手: 資料まとめありがとうございました！\n自分: (そろそろタメ口にしたい…)",
    relationship: "友達以上未満",
    tone: "さりげなく",
    hoursSinceRead: 0,
    label: "敬語→タメ口 — 職場の気になる人",
  },
];

// ── Mock response database ──
// 4 situations × 2 patterns each = 8 total

type MockEntry = {
  match: (form: ComposeFormData) => boolean;
  response: AIResponse;
};

const MOCK_DB: MockEntry[] = [
  // ═══════════════════════════════════════
  // 既読スルー — パターン1: 24h以上（送る）
  // ═══════════════════════════════════════
  {
    match: (f) => f.situation === "既読スルー" && f.hoursSinceRead >= 12,
    response: {
      decision: "送る",
      best_reply: "そういえばさ、この前話してたカフェ見つけたんだけど😳",
      backup_reply: "最近寒くない？風邪引いてないといいけど",
      ng_reply: "おーい、既読つけて無視？😡",
      next_step: "返信来たら即レスせず30分〜1時間空ける",
      why_it_works:
        "既読スルーを責めず、新しい話題で「返信しやすい口実」を作る。相手のプレッシャーをゼロにするのがコツ。",
      expected_reaction: "えっ気になる！どこのカフェ？📍",
      reaction_followup:
        "写真と場所を送って「今度一緒に行ってみない？」で自然にデートに繋がる展開。",
    },
  },
  // ═══════════════════════════════════════
  // 既読スルー — パターン2: 6h未満（待つ）
  // ═══════════════════════════════════════
  {
    match: (f) => f.situation === "既読スルー" && f.hoursSinceRead < 12,
    response: {
      decision: "待つ",
      best_reply: "（まだ送らない — 相手のペースを尊重）",
      backup_reply: "どうしても送りたいなら: 面白い動画のURLだけポンと送る",
      ng_reply: "返事まだ？忙しいの？",
      next_step: "24時間経っても来なければ、全く別の話題で軽く1通だけ",
      why_it_works:
        "数時間の既読スルーは普通。追いLINEは「重い」認定される最大の原因。待てる余裕が魅力になる。",
      expected_reaction: "（翌日）ごめんバタバタしてた！えっ気になる笑",
      reaction_followup:
        "焦らなかった→「余裕ある人」の印象に。相手から話題を広げてくれる好循環。",
    },
  },
  // ═══════════════════════════════════════
  // デート後 — パターン1: お礼→次の提案
  // ═══════════════════════════════════════
  {
    match: (f) => f.situation === "デート後" && f.tone !== "ユーモア",
    response: {
      decision: "送る",
      best_reply: "今日めっちゃ楽しかった！あのパスタ美味しすぎたね🍝",
      backup_reply: "帰り道気をつけてね！また行きたいお店あったら教えて😊",
      ng_reply: "今日は最高でした。次はいつ会えますか？",
      next_step: "翌日の昼頃に「昨日の店のインスタ見つけた」等で自然に繋ぐ",
      why_it_works:
        "具体的なエピソードを出すと「ちゃんと楽しんでくれてた」が伝わる。次の約束は焦らず翌日以降に。",
      expected_reaction: "ね！私もあのパスタ忘れられない😂 また行こう！",
      reaction_followup:
        "「また行こう」が相手から出た→次のデートは向こうから提案の流れに。",
    },
  },
  // ═══════════════════════════════════════
  // デート後 — パターン2: ユーモア系
  // ═══════════════════════════════════════
  {
    match: (f) => f.situation === "デート後" && f.tone === "ユーモア",
    response: {
      decision: "送る",
      best_reply: "帰り道、もう次どこ行くか考えてる自分がいる笑",
      backup_reply: "今日のお店のレビュー書くなら星7つけるわ笑",
      ng_reply: "会えて幸せでした🥺✨ 運命感じます",
      next_step: "相手のノリに合わせて返信テンポを調整。盛り上がってもダラダラ続けない",
      why_it_works:
        "自虐っぽいユーモアで「好意はあるけど重くない」を演出。笑いの中に本音を忍ばせる高等テク。",
      expected_reaction: "わかる笑 私もなんか楽しかったー！どこがいい？😆",
      reaction_followup:
        "相手が「どこがいい？」と聞いてきた→主導権を持って次のデートをリード。",
    },
  },
  // ═══════════════════════════════════════
  // 温度差 — パターン1: さりげなく/大人っぽく
  // ═══════════════════════════════════════
  {
    match: (f) =>
      f.situation === "温度差" &&
      (f.tone === "さりげなく" || f.tone === "大人っぽく"),
    response: {
      decision: "送る",
      best_reply: "了解！じゃあまた近くなったら声かけるね",
      backup_reply: "忙しそうだね、落ち着いたらご飯でも行こ！",
      ng_reply: "え、行きたくないってこと？はっきり言って？",
      next_step: "1週間は自分からは送らない。相手から来たら温度を合わせる",
      why_it_works:
        "引くのが最強の一手。「追わない人」になると相手の中であなたの存在感が逆に増す。",
      expected_reaction: "（3日後）ごめんね！来週の金曜なら空いてるよ！",
      reaction_followup:
        "引いたら相手から来た。「余裕のある人」ポジション確立。デートの主導権はこちら。",
    },
  },
  // ═══════════════════════════════════════
  // 温度差 — パターン2: ちょい好意/ユーモア
  // ═══════════════════════════════════════
  {
    match: (f) =>
      f.situation === "温度差" &&
      (f.tone === "ちょい好意" || f.tone === "ユーモア"),
    response: {
      decision: "送る",
      best_reply: "おけ！まあ気が向いたらでいいよ〜俺は暇人だから笑",
      backup_reply: "了解了解。じゃあ気分転換したくなったら連絡して😊",
      ng_reply: "もういいよ…脈なしってことだよね…",
      next_step: "インスタのストーリーにさりげなく楽しそうな投稿をする",
      why_it_works:
        "軽く冗談で流すと「この人、追ってこないんだ」と相手の興味が復活する心理。ストーリーで間接アピール。",
      expected_reaction: "暇人とか笑 来週なら会えるかも！",
      reaction_followup:
        "ユーモアで重さを消した→相手がハードル下がって提案してきた。勝ちパターン。",
    },
  },
  // ═══════════════════════════════════════
  // 敬語→タメ口 — パターン1: さりげなく
  // ═══════════════════════════════════════
  {
    match: (f) =>
      f.situation === "敬語→タメ口" &&
      (f.tone === "さりげなく" || f.tone === "大人っぽく"),
    response: {
      decision: "送る",
      best_reply: "お疲れ〜！今日の会議ほんと長かったね笑",
      backup_reply: "おつかれさまです！…ってもうタメ口でよくない？笑",
      ng_reply: "敬語やめません？もっと仲良くなりたいんで",
      next_step: "相手がタメ口で返してきたらそのまま継続。敬語で来たら無理に崩さない",
      why_it_works:
        "「お疲れさまです→お疲れ〜」の一段階だけ崩すのがコツ。全部いきなりタメ口にすると違和感。",
      expected_reaction: "おつかれ〜！ね、長すぎたよね😂",
      reaction_followup:
        "相手も自然にタメ口に。距離が一気に縮まって、プライベートの話題にも展開しやすくなる。",
    },
  },
  // ═══════════════════════════════════════
  // 敬語→タメ口 — パターン2: ちょい好意/ユーモア
  // ═══════════════════════════════════════
  {
    match: (f) =>
      f.situation === "敬語→タメ口" &&
      (f.tone === "ちょい好意" || f.tone === "ユーモア"),
    response: {
      decision: "送る",
      best_reply: "もう敬語キャラ限界なんだけど笑 タメ口にしない？",
      backup_reply: "なんか敬語だと距離感じるな〜もっとラフにいこ！",
      ng_reply: "ねえ、もう敬語いらなくない？俺たちの仲じゃん",
      next_step: "タメ口OKが出たら共通の趣味の話題に切り替えて距離を詰める",
      why_it_works:
        "「自分が限界」という自己開示+笑いで、相手に判断を委ねる。断られてもダメージゼロの聞き方。",
      expected_reaction: "たしかに笑 じゃあタメ口で！よろしく😊",
      reaction_followup:
        "タメ口解禁→LINEの頻度が自然に上がる→ご飯の誘いもハードルが下がる。",
    },
  },
];

// ── Mock generator ──
export function generateReplyMock(form: ComposeFormData): AIResponse {
  // Find best matching mock
  const match = MOCK_DB.find((entry) => entry.match(form));

  if (match) {
    return { ...match.response };
  }

  // Fallback (should never reach here with 8 patterns covering all combos)
  return {
    decision: "送る",
    best_reply: "最近どう？なんか楽しいことあった？",
    backup_reply: "今度時間ある時ご飯行かない？",
    ng_reply: "なんで返事くれないの？",
    next_step: "相手の返信テンポに合わせて、焦らず返す",
    why_it_works:
      "シンプルな質問は返信のハードルが低い。相手が話しやすい空気を作る。",
    expected_reaction: "元気だよ！最近カフェ巡りにハマってる☕",
    reaction_followup: "共通の話題が見つかれば、自然にデートの提案に繋がる。",
  };
}
