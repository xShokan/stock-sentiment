/* 静态模式模拟数据 — 无需后端即可运行 */
import type { StockOverview, SentimentScore, NewsItem, SocialPost, HotStock, MarketOverview, HotTopic, SentimentDetail, HistoryPoint } from '../types';

// ====== 确定性伪随机（同一股票代码每次生成一致的数据） ======
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}

function createRNG(seed: string) {
  let state = hashCode(seed);
  return function (min = 0, max = 1): number {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return min + (state / 0x7fffffff) * (max - min);
  };
}

// 全局股票 RNG 缓存
const rngCache: Record<string, ReturnType<typeof createRNG>> = {};
function stockRNG(code: string) {
  if (!rngCache[code]) rngCache[code] = createRNG(code);
  return rngCache[code];
}

// 情绪等级随机
function randSentiment(min = -0.5, max = 0.7): number {
  return +(Math.random() * (max - min) + min).toFixed(3);
}
function stockSentiment(code: string, min = -0.5, max = 0.7): number {
  return +stockRNG(code)(min, max).toFixed(3);
}
function label(s: number): string {
  if (s > 0.6) return '🔥 极度乐观';
  if (s > 0.2) return '😊 乐观';
  if (s >= -0.2) return '😐 中性';
  if (s >= -0.6) return '😟 悲观';
  return '❄️ 极度悲观';
}
function level(s: number): SentimentScore['level'] {
  if (s > 0.6) return 'extreme_bullish';
  if (s > 0.2) return 'bullish';
  if (s >= -0.2) return 'neutral';
  if (s >= -0.6) return 'bearish';
  return 'extreme_bearish';
}

// ====== 股票列表 ======
export const STOCKS: { code: string | undefined; name: string; market: string }[] = [
  // A股
  { code: '600519', name: '贵州茅台', market: 'a' }, { code: '000001', name: '平安银行', market: 'a' },
  { code: '300750', name: '宁德时代', market: 'a' }, { code: '000858', name: '五粮液', market: 'a' },
  { code: '601318', name: '中国平安', market: 'a' }, { code: '002594', name: '比亚迪', market: 'a' },
  { code: '688981', name: '中芯国际', market: 'a' }, { code: '600036', name: '招商银行', market: 'a' },
  { code: '000333', name: '美的集团', market: 'a' }, { code: '601012', name: '隆基绿能', market: 'a' },
  { code: '300059', name: '东方财富', market: 'a' }, { code: '002415', name: '海康威视', market: 'a' },
  { code: '688256', name: '寒武纪', market: 'a' }, { code: '000977', name: '浪潮信息', market: 'a' },
  { code: '300033', name: '同花顺', market: 'a' }, { code: '600031', name: '三一重工', market: 'a' },
  { code: '000568', name: '泸州老窖', market: 'a' }, { code: '600887', name: '伊利股份', market: 'a' },
  { code: '600900', name: '长江电力', market: 'a' }, { code: '000625', name: '长安汽车', market: 'a' },
  // 港股
  { code: '00700', name: '腾讯控股', market: 'hk' }, { code: '09988', name: '阿里巴巴-SW', market: 'hk' },
  { code: '01810', name: '小米集团-W', market: 'hk' }, { code: '03690', name: '美团-W', market: 'hk' },
  { code: '09618', name: '京东集团-SW', market: 'hk' }, { code: '01211', name: '比亚迪股份', market: 'hk' },
  { code: '02015', name: '理想汽车-W', market: 'hk' }, { code: '09626', name: '哔哩哔哩-W', market: 'hk' },
  { code: '01024', name: '快手-W', market: 'hk' }, { code: '09961', name: '携程集团-S', market: 'hk' },
  // 美股
  { code: 'AAPL', name: 'Apple Inc.', market: 'us' }, { code: 'TSLA', name: 'Tesla Inc.', market: 'us' },
  { code: 'NVDA', name: 'NVIDIA Corp.', market: 'us' }, { code: 'MSFT', name: 'Microsoft Corp.', market: 'us' },
  { code: 'GOOGL', name: 'Alphabet Inc.', market: 'us' }, { code: 'META', name: 'Meta Platforms', market: 'us' },
  { code: 'AMZN', name: 'Amazon.com Inc.', market: 'us' }, { code: 'AMD', name: 'Advanced Micro Devices', market: 'us' },
  { code: 'NFLX', name: 'Netflix Inc.', market: 'us' }, { code: 'ARM', name: 'Arm Holdings', market: 'us' },
  { code: 'GME', name: 'GameStop Corp.', market: 'us' }, { code: 'UBER', name: 'Uber Technologies', market: 'us' },
  { code: 'PLTR', name: 'Palantir Technologies', market: 'us' }, { code: 'COIN', name: 'Coinbase Global', market: 'us' },
  { code: 'BABA', name: 'Alibaba Group', market: 'us' }, { code: 'SMCI', name: 'Super Micro Computer', market: 'us' },
];

const MARKET_LABELS: Record<string, string> = { a: 'A股', hk: '港股', us: '美股' };

// 新闻模板
const NEWS_TEMPLATES: Record<string, { title: string; summary: string; source: string }[]> = {
  bullish: [
    { title: '机构上调目标价，看好后市表现', summary: '多家券商发布研报，上调该公司目标价，认为当前估值具有吸引力。', source: '证券时报' },
    { title: '业绩超预期，主营业务强劲增长', summary: '公司最新财报显示营收和利润均超出市场预期，核心业务表现亮眼。', source: '中国证券报' },
    { title: '政策利好持续释放，行业景气度回升', summary: '国家出台多项支持政策，行业内公司普遍受益，市场信心明显增强。', source: '经济日报' },
    { title: '技术创新取得突破，打开新增长空间', summary: '公司在核心技术领域实现突破，新产品有望带来显著增量收入。', source: '21世纪经济报道' },
    { title: '外资持续加仓，北向资金净流入', summary: '北向资金连续多日净买入，外资机构对中国资产信心增强。', source: '第一财经' },
  ],
  bearish: [
    { title: '业绩不及预期，估值面临回调压力', summary: '最新财报显示业绩增速放缓，市场对高估值产生担忧。', source: '证券时报' },
    { title: '行业竞争加剧，利润率承压', summary: '随着新进入者增多，行业竞争白热化，公司毛利率持续下降。', source: '21世纪经济报道' },
    { title: '大股东减持计划引发市场担忧', summary: '大股东披露减持计划，市场情绪受到一定影响。', source: '中国证券报' },
    { title: '宏观经济不确定性增加', summary: '全球经济复苏步伐放缓，外部需求减弱，给出口型企业带来压力。', source: '经济日报' },
    { title: '监管政策收紧，行业面临调整', summary: '监管部门出台新规，行业面临阶段性调整压力。', source: '第一财经' },
  ],
};

function genNews(code: string, count: number, baseSentiment: number): NewsItem[] {
  const rng = stockRNG(code + 'news');
  const results: NewsItem[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const mood = baseSentiment > 0.1 ? 'bullish' : baseSentiment < -0.1 ? 'bearish' : (rng() > 0.5 ? 'bullish' : 'bearish');
    const pool = [...NEWS_TEMPLATES.bullish, ...NEWS_TEMPLATES.bearish];
    const tpl = pool[i % pool.length];
    const s = +(baseSentiment + (rng(-0.2, 0.2))).toFixed(3);
    results.push({
      id: `news-${Date.now()}-${i}`,
      title: tpl.title,
      summary: tpl.summary,
      source: tpl.source,
      published_at: new Date(now.getTime() - i * 86400000).toISOString().slice(0, 16).replace('T', ' '),
      sentiment: s,
      sentiment_label: label(s),
    });
  }
  return results;
}

function genSocial(code: string, count: number, baseSentiment: number): SocialPost[] {
  const rng = stockRNG(code + 'social');
  const platforms = ['雪球', '微博', 'Reddit'];
  const authors = ['投资达人老王', '价值投资者', '趋势猎手', '韭菜变镰刀', 'u/WSB_YOLO'];
  const contents = [
    '今天走势太强了，主力资金明显在加仓，坚定看好后市！',
    '业绩超预期，估值还有很大空间，继续持有。',
    '技术面已经突破年线压制，MACD金叉确认，短期看涨。',
    '最近消息面偏空，短期回避，等趋势明朗再进场。',
    '估值已经很高了，追高风险大，我选择观望。',
    '主力出货迹象明显，大单持续流出，建议减仓。',
    'To the moon! Diamond hands baby 🚀',
    'Bearish divergence on RSI, smart money is selling.',
  ];
  const results: SocialPost[] = [];
  for (let i = 0; i < count; i++) {
    const s = +(baseSentiment + (rng(-0.3, 0.3))).toFixed(3);
    results.push({
      id: `social-${Date.now()}-${i}`,
      platform: platforms[i % 3],
      content: contents[i % contents.length],
      author: authors[i % authors.length],
      likes: Math.floor(rng(0, 500)),
      comments: Math.floor(rng(0, 100)),
      published_at: new Date(Date.now() - i * 3600000).toISOString().slice(0, 16).replace('T', ' '),
      sentiment: s,
      sentiment_label: label(s),
    });
  }
  return results;
}

// ====== 模拟 API 实现 ======

export function mockSearchStocks(q: string) {
  const ql = q.toLowerCase();
  return STOCKS.filter(s => 
    s.code.toLowerCase().includes(ql) || s.name.toLowerCase().includes(ql)
  ).slice(0, 10).map(s => ({
    code: s.code, name: s.name, market: s.market,
    market_label: MARKET_LABELS[s.market] || s.market,
  }));
}

export function mockGetStockOverview(code: string): StockOverview | null {
  const stock = STOCKS.find(s => s.code === code.toUpperCase());
  if (!stock) return null;
  const rng = stockRNG(code);
  const s = +rng(-0.35, 0.65).toFixed(3);
  const ns = +rng(-0.3, 0.6).toFixed(3);
  const ss = +rng(-0.4, 0.7).toFixed(3);
  return {
    code: stock.code,
    name: stock.name,
    market: stock.market as 'a' | 'hk' | 'us',
    price: +rng(20, 500).toFixed(2),
    change_pct: +rng(-5, 5).toFixed(2),
    sentiment: { overall: s, news_score: ns, social_score: ss, level: level(s), label: label(s), confidence: 0.85 },
    news_count: 8,
    social_count: 10,
    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
}

export function mockGetStockNews(code: string): NewsItem[] {
  const s = stockSentiment(code, -0.4, 0.6);
  return genNews(code, 8, s);
}

export function mockGetStockSocial(code: string): SocialPost[] {
  const s = stockSentiment(code, -0.5, 0.7);
  return genSocial(code, 10, s);
}

export function mockGetHotStocks(): HotStock[] {
  return STOCKS.slice(0, 12).map(s => {
    const sent = randSentiment(-0.4, 0.7);
    return {
      code: s.code, name: s.name, market: s.market,
      price: +(Math.random() * 400 + 20).toFixed(2),
      change_pct: +((Math.random() - 0.5) * 10).toFixed(2),
      sentiment: sent,
      sentiment_label: label(sent),
    };
  });
}

export function mockGetMarketOverview(): MarketOverview[] {
  return [
    { market: 'a', market_label: 'A股', avg_sentiment: randSentiment(-0.2, 0.5), sentiment_label: label(randSentiment(-0.2, 0.5)), bullish_count: 18, bearish_count: 7, neutral_count: 15, total_stocks: 40 },
    { market: 'hk', market_label: '港股', avg_sentiment: randSentiment(-0.2, 0.4), sentiment_label: label(randSentiment(-0.2, 0.4)), bullish_count: 10, bearish_count: 5, neutral_count: 15, total_stocks: 30 },
    { market: 'us', market_label: '美股', avg_sentiment: randSentiment(-0.1, 0.5), sentiment_label: label(randSentiment(-0.1, 0.5)), bullish_count: 14, bearish_count: 6, neutral_count: 10, total_stocks: 30 },
  ];
}

export function mockGetTopBullish(): HotStock[] {
  return STOCKS.slice(0, 6).map(s => {
    const sent = randSentiment(0.25, 0.8);
    return { code: s.code, name: s.name, market: s.market, price: +(Math.random() * 400 + 20).toFixed(2), change_pct: (Math.random() * 6).toFixed(2), sentiment: sent, sentiment_label: label(sent) } as any;
  });
}

export function mockGetTopBearish(): HotStock[] {
  return STOCKS.slice(6, 12).map(s => {
    const sent = randSentiment(-0.8, -0.2);
    return { code: s.code, name: s.name, market: s.market, price: +(Math.random() * 400 + 20).toFixed(2), change_pct: (-Math.random() * 6).toFixed(2), sentiment: sent, sentiment_label: label(sent) } as any;
  });
}

export function mockGetHotTopics(): HotTopic[] {
  return [
    { keyword: 'AI人工智能', mention_count: 4521, avg_sentiment: 0.45, related_stocks: ['NVDA', '688981', '300750'] },
    { keyword: '新能源汽车', mention_count: 3821, avg_sentiment: 0.32, related_stocks: ['TSLA', '002594', '01211'] },
    { keyword: '半导体芯片', mention_count: 3120, avg_sentiment: 0.28, related_stocks: ['688981', 'AMD', 'ARM'] },
    { keyword: '白酒消费', mention_count: 2105, avg_sentiment: -0.15, related_stocks: ['600519', '000858'] },
    { keyword: '光伏储能', mention_count: 1890, avg_sentiment: 0.18, related_stocks: ['601012', '300274'] },
    { keyword: '美联储降息', mention_count: 3450, avg_sentiment: 0.35, related_stocks: ['AAPL', 'MSFT', 'TSLA'] },
    { keyword: '房地产政策', mention_count: 1560, avg_sentiment: -0.08, related_stocks: ['000002', '00688'] },
    { keyword: '医药创新', mention_count: 1234, avg_sentiment: 0.12, related_stocks: ['603259', '300760'] },
  ];
}

export function mockGetMarketNews(): NewsItem[] {
  return genNews('market', 6, randSentiment(-0.3, 0.5));
}

export function mockGetSentimentDetail(code: string): SentimentDetail | null {
  const stock = STOCKS.find(s => s.code === code.toUpperCase());
  if (!stock) return null;
  const rng = stockRNG(code);
  const s = +rng(-0.35, 0.65).toFixed(3);
  const ns = +rng(-0.3, 0.6).toFixed(3);
  const ss = +rng(-0.4, 0.7).toFixed(3);
  return {
    code: stock.code, name: stock.name,
    sentiment: { overall: s, news_score: ns, social_score: ss, level: level(s), label: label(s), confidence: 0.85 },
    news_summary: { count: 8, bullish: 4, neutral: 2, bearish: 2 },
    social_summary: { count: 10, bullish: 5, neutral: 3, bearish: 2 },
  };
}

export function mockGetHistory(): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const now = new Date();
  let base = randSentiment(-0.2, 0.5);
  for (let i = 7; i >= 0; i--) {
    base += (Math.random() - 0.5) * 0.15;
    base = Math.max(-0.8, Math.min(0.8, base));
    points.push({
      date: new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10),
      score: +base.toFixed(3),
      news_score: +(base + (Math.random() - 0.5) * 0.2).toFixed(3),
      social_score: +(base + (Math.random() - 0.5) * 0.3).toFixed(3),
    });
  }
  return points;
}
