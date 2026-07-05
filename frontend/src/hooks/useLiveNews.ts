/* 实时新闻抓取 Hook — 从免费 CORS 代理拉取 Google News RSS */
import { useState, useEffect } from 'react';

interface LiveNewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

const STOCK_QUERIES: Record<string, string> = {
  AAPL: 'Apple+stock', TSLA: 'Tesla+stock', NVDA: 'NVIDIA+stock',
  MSFT: 'Microsoft+stock', AMZN: 'Amazon+stock', META: 'Meta+stock',
  GOOGL: 'Alphabet+Google+stock', AMD: 'AMD+stock', ARM: 'ARM+Holdings+stock',
  NFLX: 'Netflix+stock', UBER: 'Uber+stock', PLTR: 'Palantir+stock',
  COIN: 'Coinbase+stock', GME: 'GameStop+stock', BABA: 'Alibaba+stock',
  '600519': '贵州茅台', '300750': '宁德时代', '002594': '比亚迪',
  '000858': '五粮液', '601318': '中国平安', '688981': '中芯国际',
  '00700': '腾讯控股', '09988': '阿里巴巴', '01810': '小米集团',
  '03690': '美团', '09618': '京东',
};

// RSS2JSON 免费 API
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

function buildRSSUrl(code: string): string {
  const query = STOCK_QUERIES[code] || `${code}+stock`;
  const lang = /^\d/.test(code) ? 'zh-CN&gl=CN' : 'en-US&gl=US';
  return `https://news.google.com/rss/search?q=${query}&hl=${lang}&ceid=${lang === 'en-US&gl=US' ? 'US:en' : 'CN:zh-Hans'}`;
}

function cleanHtml(s: string): string {
  return (s || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<a[^>]*>.*?<\/a>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRSS2JSON(data: any): LiveNewsItem[] {
  if (!data?.items) return [];
  return data.items.slice(0, 8).map((item: any) => ({
    title: cleanHtml(item.title || ''),
    link: item.link || '',
    pubDate: item.pubDate || '',
    source: cleanHtml(item.author || '').slice(0, 30) || 'News',
    snippet: cleanHtml(item.description || '').slice(0, 250),
  }));
}

export function useLiveNews(code: string | undefined) {
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    // 检查缓存（5 分钟内不重复请求）
    const cacheKey = `liveNews_${code}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 5 * 60 * 1000) {
          setNews(data);
          return;
        }
      } catch {}
    }

    setLoading(true);
    setError('');

    const rssUrl = buildRSSUrl(code);
    const apiUrl = RSS2JSON_API + encodeURIComponent(rssUrl);

    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const items = parseRSS2JSON(data);
        setNews(items);
        setLoading(false);
        localStorage.setItem(cacheKey, JSON.stringify({ data: items, ts: Date.now() }));
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [code]);

  return { news, loading, error };
}
