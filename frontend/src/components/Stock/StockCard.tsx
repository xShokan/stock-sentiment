/* 股票卡片 */
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { HotStock } from '../../types';
import { SENTIMENT_COLORS, MARKET_LABELS } from '../../types';

interface Props {
  stock: HotStock;
}

export default function StockCard({ stock }: Props) {
  const navigate = useNavigate();
  const isUp = stock.change_pct >= 0;

  return (
    <div
      className="card"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/stock/${stock.code}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{stock.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {stock.code} · {MARKET_LABELS[stock.market] || stock.market}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>${stock.price.toFixed(2)}</div>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: isUp ? 'var(--green)' : 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            justifyContent: 'flex-end',
          }}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Sentiment bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>市场情绪</span>
          <span style={{ color: SENTIMENT_COLORS[stock.sentiment > 0.2 ? 'bullish' : stock.sentiment < -0.2 ? 'bearish' : 'neutral'] }}>
            {stock.sentiment_label}
          </span>
        </div>
        <div style={{
          height: 4,
          borderRadius: 2,
          background: 'var(--bg-primary)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((stock.sentiment + 1) / 2) * 100}%`,
            borderRadius: 2,
            background: stock.sentiment > 0 ? 'linear-gradient(90deg, #ffd740, #00e676)' : 'linear-gradient(90deg, #ff1744, #ffd740)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  );
}
