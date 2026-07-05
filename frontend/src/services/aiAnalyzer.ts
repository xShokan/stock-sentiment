/* AI 新闻分析服务 — 调用 OpenAI 兼容的大模型 API */
export interface AIAnalysisResult {
  summary: string;
  sentiment: number;
  sentimentLabel: string;
  reasoning: string;
}

interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
};

function getSettings(): AISettings {
  try {
    const saved = localStorage.getItem('ai_settings');
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(s: Partial<AISettings>) {
  const current = getSettings();
  const updated = { ...current, ...s };
  localStorage.setItem('ai_settings', JSON.stringify(updated));
}

export function getCurrentSettings(): AISettings {
  return getSettings();
}

export function hasAIKey(): boolean {
  return !!getSettings().apiKey;
}

const ANALYSIS_PROMPT = `你是一个专业的金融新闻分析师。请分析以下股票新闻，返回 JSON（不要任何其他内容）：

{
  "summary": "用一句话总结新闻要点（中文，30字以内）",
  "sentiment": 0.5,
  "sentimentLabel": "利好/利空/中性",
  "reasoning": "简短分析理由（50字以内）"
}

sentiment 取值：-1=极大利空 到 +1=极大利好，0=中性

新闻内容：`;

export async function analyzeNewsWithAI(title: string, content: string): Promise<AIAnalysisResult> {
  const settings = getSettings();
  if (!settings.apiKey) {
    throw new Error('请先配置 AI API Key');
  }

  const text = `${title}\n\n${content.slice(0, 500)}`;
  const response = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: '你是一个金融新闻分析助手。只返回 JSON，不要多余内容。' },
        { role: 'user', content: ANALYSIS_PROMPT + text },
      ],
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 错误 (${response.status}): ${err.slice(0, 100)}`);
  }

  const data = await response.json();
  const content_text = data.choices?.[0]?.message?.content || '';
  
  // 提取 JSON
  const jsonMatch = content_text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 返回格式异常，请重试');
  
  const result = JSON.parse(jsonMatch[0]);
  
  return {
    summary: result.summary || '',
    sentiment: +result.sentiment || 0,
    sentimentLabel: result.sentimentLabel || '中性',
    reasoning: result.reasoning || '',
  };
}
