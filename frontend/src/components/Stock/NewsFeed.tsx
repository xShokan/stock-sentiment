/* 新闻列表 */
import { ExternalLink, Newspaper } from 'lucide-react';
import type { NewsItem } from '../../types';
import { SENTIMENT_COLORS } from '../../types';

interface Props {
  news: NewsItem[];
}

export default function NewsFeed({ news }: Props) {
  if (!news.length) {
    return <EmptyNews />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {news.map((item) => (
        <div
          key={item.id}
          className="card"
          style={{ padding: 14, cursor: item.url ? 'pointer' : 'default' }}
          onClick={() => item.url && window.open(item.url, '_blank')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                {item.summary}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span>{item.source}</span>
                <span>{item.published_at}</span>
              </div>
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              color: '#fff',
              background: SENTIMENT_COLORS[
                item.sentiment > 0.2 ? 'bullish' : item.sentiment < -0.2 ? 'bearish' : 'neutral'
              ] + '33',
              border: `1px solid ${SENTIMENT_COLORS[
                item.sentiment > 0.2 ? 'bullish' : item.sentiment < -0.2 ? 'bearish' : 'neutral'
              ]}`,
            }}>
              {item.sentiment_label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyNews() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
      <Newspaper size={32} color="var(--text-secondary)" style={{ marginBottom: 8 }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>暂无相关新闻</p>
    </div>
  );
}
