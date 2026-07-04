/* StockDetail */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { getStockOverview } from '../services/api';
import type { StockOverview } from '../types';

export default function StockDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StockOverview | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound'>('loading');

  useEffect(() => {
    if (!code) return;
    setStatus('loading');
    getStockOverview(code)
      .then(d => { setData(d); setStatus('ok'); })
      .catch(() => setStatus('notfound'));
  }, [code]);

  if (status === 'loading') {
    return (
      <div style={{ padding: 40, background: '#0f1117', color: '#9aa0b0', minHeight: '100vh', textAlign: 'center' }}>
        加载中...
      </div>
    );
  }

  if (status === 'notfound' || !data) {
    return (
      <div style={{
        padding: 40, background: '#0f1117', color: '#e8eaed',
        minHeight: '100vh', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <Search size={48} color="#9aa0b0" />
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>未找到股票 "{code}"</h2>
        <p style={{ fontSize: 13, color: '#9aa0b0', maxWidth: 300, lineHeight: 1.6 }}>
          目前仅支持预设热门股票。试试搜索 NVDA、TSLA、600519、00700 等。
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 24px', borderRadius: 8, background: '#448aff',
            color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#0f1117', color: '#e8eaed', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 14px', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: 13, marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
        返回
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700 }}>{data.name}</h1>
      <p style={{ color: '#9aa0b0', fontSize: 14, marginTop: 4 }}>{data.code} · {data.market === 'a' ? 'A股' : data.market === 'hk' ? '港股' : '美股'}</p>

      <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 24, marginTop: 16 }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>${data.price?.toFixed(2)}</div>
        <div style={{ fontSize: 18, color: (data.change_pct ?? 0) >= 0 ? '#00c853' : '#ff1744' }}>
          {(data.change_pct ?? 0) >= 0 ? '+' : ''}{data.change_pct?.toFixed(2)}%
        </div>
      </div>

      <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>综合情绪</h2>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{data.sentiment.label}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, flexWrap: 'wrap' }}>
          <span>新闻: {data.sentiment.news_score?.toFixed(2)}</span>
          <span>社媒: {data.sentiment.social_score?.toFixed(2)}</span>
          <span>置信度: {((data.sentiment.confidence ?? 0) * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 13, color: '#9aa0b0' }}>
        数据更新时间: {data.updated_at}
      </div>
    </div>
  );
}
