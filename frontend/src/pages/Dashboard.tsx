/* Dashboard - 逐步恢复，先测 API */
import { useEffect, useState } from 'react';
import { getHotStocks, getMarketOverview } from '../services/api';
import type { HotStock, MarketOverview } from '../types';

export default function Dashboard() {
  const [stocks, setStocks] = useState<HotStock[]>([]);
  const [markets, setMarkets] = useState<MarketOverview[]>([]);
  const [status, setStatus] = useState('加载中...');

  useEffect(() => {
    async function load() {
      try {
        const [s, m] = await Promise.all([getHotStocks(6), getMarketOverview()]);
        setStocks(s);
        setMarkets(m);
        setStatus('ok');
      } catch (e: any) {
        setStatus('API 错误: ' + (e?.message || '未知'));
      }
    }
    load();
  }, []);

  return (
    <div style={{
      padding: 24, background: '#0f1117', color: '#e8eaed',
      minHeight: '100vh',
    }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>StockSense 股票情绪</h1>

      {status !== 'ok' ? (
        <p style={{ color: '#9aa0b0' }}>{status}</p>
      ) : (
        <>
          {/* 市场概览 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {markets.map(m => (
              <div key={m.market} style={{
                background: '#1a1d2e', borderRadius: 10, padding: 16, minWidth: 140,
              }}>
                <div style={{ fontSize: 12, color: '#9aa0b0' }}>{m.market_label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{m.sentiment_label}</div>
                <div style={{ fontSize: 11, color: '#9aa0b0', marginTop: 4 }}>
                  😊{m.bullish_count} 😐{m.neutral_count} 😟{m.bearish_count}
                </div>
              </div>
            ))}
          </div>

          {/* 热门股票 */}
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>热门股票</h2>
          {stocks.map(s => (
            <div key={s.code} style={{
              background: '#1a1d2e', borderRadius: 8, padding: '10px 16px',
              marginBottom: 8, display: 'flex', justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: '#9aa0b0', fontSize: 12, marginLeft: 8 }}>{s.code}</span>
              </div>
              <div>
                <span style={{ marginRight: 16 }}>${s.price?.toFixed?.(2) ?? '--'}</span>
                <span style={{ color: s.sentiment > 0 ? '#69f0ae' : '#ff6e40' }}>
                  {s.sentiment_label}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
