/* AI 新闻分析服务 — 通过安全代理调用大模型 */
export interface AIAnalysisResult {
  summary: string;
  sentiment: number;
  sentimentLabel: string;
  reasoning: string;
}

function getProxyUrl(): string {
  return localStorage.getItem('ai_proxy_url') || '';
}

export function saveProxyUrl(url: string) {
  localStorage.setItem('ai_proxy_url', url);
}

export function hasAIProxy(): boolean {
  return !!getProxyUrl();
}

/** 获取公开可用的 worker 代理地址（部署后填入） */
export function getDefaultProxyUrl(): string {
  return ''; // 用户部署 worker 后填入，如 'https://ai-proxy.你的域名.workers.dev'
}

export async function analyzeNewsWithAI(title: string, content: string): Promise<AIAnalysisResult> {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) {
    throw new Error('请先部署 AI 代理（Cloudflare Worker），然后在 AI 设置中填入代理地址');
  }

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`代理错误 (${response.status}): ${err.slice(0, 100)}`);
  }

  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return {
    summary: result.summary || '',
    sentiment: +result.sentiment || 0,
    sentimentLabel: result.sentimentLabel || '中性',
    reasoning: result.reasoning || '',
  };
}
