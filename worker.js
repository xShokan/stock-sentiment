/**
 * Cloudflare Worker — AI API 安全代理
 * 部署: npx wrangler deploy
 * 密钥: npx wrangler secret put AI_API_KEY
 *        npx wrangler secret put AI_BASE_URL  (可选，默认 OpenAI)
 *        npx wrangler secret put AI_MODEL     (可选，默认 gpt-4o-mini)
 */
export default {
  async fetch(request, env) {
    // 只允许 POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const apiKey = env.AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const baseUrl = env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = env.AI_MODEL || 'gpt-4o-mini';

    try {
      const body = await request.json();
      const { title, content } = body;

      if (!title) {
        return new Response(JSON.stringify({ error: 'Missing title' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const text = `${title}\n\n${(content || '').slice(0, 500)}`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是金融新闻分析助手。只返回JSON，不要多余内容。' },
            { role: 'user', content: `分析以下股票新闻，返回JSON：\n{"summary":"一句话要点(30字)","sentiment":0.5,"sentimentLabel":"利好/利空/中性","reasoning":"理由(50字)"}\n\nsentiment: -1极大利空 到 +1极大利好\n\n新闻：${text}` },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      const msg = data.choices?.[0]?.message?.content || '';
      const jsonMatch = msg.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Invalid response' };

      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
