/* 市场情绪对比页 */
import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { Loading } from '../components/Common';
// import SentimentChart from '../components/Stock/SentimentChart';
import { getMarketOverview, getHotTopics, getTopBullish, getTopBearish } from '../services/api';
import type { MarketOverview, HotTopic, HotStock } from '../types';
import { SENTIMENT_COLORS } from '../types';

export default function MarketOverviewPage() {
  const [markets, setMarkets] = useState<MarketOverview[]>([]);
  const [topics, setTopics] = useState<Record<string, HotTopic[]>>({});
  const [bullish, setBullish] = useState<HotStock[]>([]);
  const [bearish, setBearish] = useState<HotStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMarket, setActiveMarket] = useState('a');

  useEffect(() => {
    async function fetchData() {
      try {
        const [mkt, bull, bear, topA, topHk, topUs] = await Promise.all([
          getMarketOverview(),
          getTopBullish(6),
          getTopBearish(6),
          getHotTopics('a'),
          getHotTopics('hk'),
          getHotTopics('us'),
        ]);
        setMarkets(mkt);
        setBullish(bull);
        setBearish(bear);
        setTopics({ a: topA, hk: topHk, us: topUs });
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loading text="加载市场数据..." />;

  const marketLabels: Record<string, string> = { a: 'A股', hk: '港股', us: '美股' };

  return (
    <div className="animate-fade-in" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>三市场情绪对比</h2>

      {/* Market selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['a', 'hk', 'us'].map((m) => (
          <button
            key={m}
            className={`btn ${activeMarket === m ? 'btn-primary' : ''}`}
            onClick={() => setActiveMarket(m)}
          >
            <Globe size={14} /> {marketLabels[m]}
          </button>
        ))}
      </div>

      {/* Market cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {markets.map((m) => (
          <div key={m.market} className="card" style={{
            borderColor: activeMarket === m.market ? 'var(--blue)' : 'var(--border)',
            borderWidth: activeMarket === m.market ? 2 : 1,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{m.market_label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, color: SENTIMENT_COLORS[
              m.avg_sentiment > 0.2 ? 'bullish' : m.avg_sentiment < -0.2 ? 'bearish' : 'neutral'
            ] }}>
              {m.sentiment_label}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>覆盖 {m.total_stocks} 只股票</span>
              <span style={{ color: 'var(--green)' }}>😊{m.bullish_count} 😐{m.neutral_count} 😟{m.bearish_count}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Hot topics */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
            🔥 {marketLabels[activeMarket]} 热门话题
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(topics[activeMarket] || []).map((t) => (
              <div key={t.keyword} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--bg-primary)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.keyword}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    讨论 {t.mention_count.toLocaleString()} · 关联 {t.related_stocks.join(', ')}
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: SENTIMENT_COLORS[
                    t.avg_sentiment > 0.2 ? 'bullish' : t.avg_sentiment < -0.2 ? 'bearish' : 'neutral'
                  ],
                }}>
                  {(t.avg_sentiment * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top movers */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} color="var(--green)" /> 情绪最乐观
            </h3>
            {bullish.slice(0, 5).map((s) => (
              <div key={s.code} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 14px', borderRadius: 6, marginBottom: 4,
                background: 'var(--bg-card)',
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{s.code}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                  {s.sentiment_label}
                </span>
              </div>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingDown size={15} color="var(--red)" /> 情绪最悲观
            </h3>
            {bearish.slice(0, 5).map((s) => (
              <div key={s.code} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 14px', borderRadius: 6, marginBottom: 4,
                background: 'var(--bg-card)',
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{s.code}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>
                  {s.sentiment_label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
