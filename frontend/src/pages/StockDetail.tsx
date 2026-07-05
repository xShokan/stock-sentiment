/* StockDetail — 含情绪来源详情 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Newspaper, MessageCircle, TrendingUp, Radio } from 'lucide-react';
import { getStockOverview, getStockNews, getStockSocial, getStockSentiment } from '../services/api';
import type { StockOverview, NewsItem, SocialPost, SentimentDetail } from '../types';
import { SENTIMENT_COLORS } from '../types';
import { useLiveNews } from '../hooks/useLiveNews';

export default function StockDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StockOverview | null>(null);
  const [detail, setDetail] = useState<SentimentDetail | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [social, setSocial] = useState<SocialPost[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound'>('loading');
  const [tab, setTab] = useState<'news' | 'live' | 'social'>('news');
  const { news: liveNews, loading: liveLoading, error: liveError } = useLiveNews(code);

  useEffect(() => {
    if (!code) return;
    setStatus('loading');
    Promise.all([
      getStockOverview(code),
      getStockNews(code, 8),
      getStockSocial(code, 10),
      getStockSentiment(code),
    ])
      .then(([ov, nw, sc, dt]) => {
        setData(ov); setNews(nw); setSocial(sc); setDetail(dt);
        setStatus('ok');
      })
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
          试试搜索 NVDA、TSLA、600519、00700 等热门股票。
        </p>
        <button onClick={() => navigate('/')} style={{
          padding: '10px 24px', borderRadius: 8, background: '#448aff',
          color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer',
        }}>
          <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          返回首页
        </button>
      </div>
    );
  }

  const isUp = (data.change_pct ?? 0) >= 0;
  const sentLevel = data.sentiment.level;
  const sentColor = SENTIMENT_COLORS[sentLevel] || '#ffd740';

  return (
    <div style={{ padding: 24, background: '#0f1117', color: '#e8eaed', minHeight: '100vh', maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '6px 14px', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 13, marginBottom: 16,
      }}>
        <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: -2 }} />返回
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>{data.name}</h1>
          <p style={{ color: '#9aa0b0', fontSize: 14 }}>{data.code} · {data.market === 'a' ? 'A股' : data.market === 'hk' ? '港股' : '美股'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>${data.price?.toFixed(2)}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: isUp ? '#00c853' : '#ff1744' }}>
            {isUp ? '+' : ''}{data.change_pct?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Sentiment summary card */}
      <div style={{
        background: `linear-gradient(135deg, ${sentColor}22, ${sentColor}08)`,
        border: `1px solid ${sentColor}44`,
        borderRadius: 12, padding: 24, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 40 }}>{sentLevel.includes('bullish') ? '🔥' : sentLevel.includes('bearish') ? '❄️' : '😐'}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: sentColor }}>{data.sentiment.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              综合情绪得分 {data.sentiment.overall.toFixed(2)} · 置信度 {((data.sentiment.confidence ?? 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Score breakdown bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>📰 新闻情绪</span>
              <span style={{ fontWeight: 600, color: data.sentiment.news_score >= 0 ? '#69f0ae' : '#ff6e40' }}>
                {(data.sentiment.news_score * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-primary)' }}>
              <div style={{ height: '100%', width: `${((data.sentiment.news_score + 1) / 2) * 100}%`,
                borderRadius: 2, background: data.sentiment.news_score >= 0 ? 'linear-gradient(90deg, #ffd740, #00e676)' : 'linear-gradient(90deg, #ff1744, #ffd740)',
              }} />
            </div>
            {detail && (
              <div style={{ fontSize: 11, marginTop: 4, display: 'flex', gap: 10 }}>
                <span style={{ color: '#69f0ae' }}>😊{detail.news_summary.bullish}</span>
                <span style={{ color: '#ffd740' }}>😐{detail.news_summary.neutral}</span>
                <span style={{ color: '#ff6e40' }}>😟{detail.news_summary.bearish}</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>💬 社媒情绪</span>
              <span style={{ fontWeight: 600, color: data.sentiment.social_score >= 0 ? '#69f0ae' : '#ff6e40' }}>
                {(data.sentiment.social_score * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-primary)' }}>
              <div style={{ height: '100%', width: `${((data.sentiment.social_score + 1) / 2) * 100}%`,
                borderRadius: 2, background: data.sentiment.social_score >= 0 ? 'linear-gradient(90deg, #ffd740, #00e676)' : 'linear-gradient(90deg, #ff1744, #ffd740)',
              }} />
            </div>
            {detail && (
              <div style={{ fontSize: 11, marginTop: 4, display: 'flex', gap: 10 }}>
                <span style={{ color: '#69f0ae' }}>😊{detail.social_summary.bullish}</span>
                <span style={{ color: '#ffd740' }}>😐{detail.social_summary.neutral}</span>
                <span style={{ color: '#ff6e40' }}>😟{detail.social_summary.bearish}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <button onClick={() => setTab('news')} style={{
          padding: '10px 16px', background: 'none', border: 'none',
          borderBottom: tab === 'news' ? '2px solid var(--blue)' : '2px solid transparent',
          color: tab === 'news' ? '#e8eaed' : 'var(--text-secondary)',
          fontSize: 13, fontWeight: tab === 'news' ? 600 : 400, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          <Newspaper size={14} /> 静态新闻 ({news.length})
        </button>
        <button onClick={() => setTab('live')} style={{
          padding: '10px 16px', background: 'none', border: 'none',
          borderBottom: tab === 'live' ? '2px solid #00e676' : '2px solid transparent',
          color: tab === 'live' ? '#e8eaed' : 'var(--text-secondary)',
          fontSize: 13, fontWeight: tab === 'live' ? 600 : 400, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          <Radio size={14} color="#00e676" /> 实时新闻 {liveNews.length > 0 ? `(${liveNews.length})` : ''}
        </button>
        <button onClick={() => setTab('social')} style={{
          padding: '10px 16px', background: 'none', border: 'none',
          borderBottom: tab === 'social' ? '2px solid var(--blue)' : '2px solid transparent',
          color: tab === 'social' ? '#e8eaed' : 'var(--text-secondary)',
          fontSize: 13, fontWeight: tab === 'social' ? 600 : 400, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          <MessageCircle size={14} /> 社媒讨论 ({social.length})
        </button>
      </div>

      {/* Tab content */}
      {tab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {news.map((item) => {
            const sColor = SENTIMENT_COLORS[item.sentiment > 0.2 ? 'bullish' : item.sentiment < -0.2 ? 'bearish' : 'neutral'];
            return (
              <div key={item.id} style={{
                background: 'var(--bg-card)', borderRadius: 10, padding: 14,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                      {item.summary}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>{item.source}</span>
                      <span>{item.published_at}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                    whiteSpace: 'nowrap', height: 'fit-content',
                    color: sColor, background: sColor + '22', border: `1px solid ${sColor}44`,
                  }}>
                    {item.sentiment_label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 实时新闻 Tab */}
      {tab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {liveLoading && (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)', fontSize: 13 }}>
              📡 正在从 Google News 拉取最新消息...
            </div>
          )}
          {liveError && (
            <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: '#ff6e40' }}>
              ⚠️ 实时新闻加载失败，请查看「静态新闻」Tab。({liveError})
            </div>
          )}
          {!liveLoading && !liveError && liveNews.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              暂无实时新闻
            </div>
          )}
          {liveNews.map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', borderRadius: 10, padding: 14,
              border: '1px solid #00e67633',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                  background: '#00e67622', color: '#00e676', whiteSpace: 'nowrap',
                  flexShrink: 0, marginTop: 2,
                }}>
                  实时
                </span>
                <div style={{ flex: 1 }}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#e8eaed', textDecoration: 'none', fontSize: 14, fontWeight: 500, lineHeight: 1.4, display: 'block', marginBottom: 4 }}
                  >
                    {item.title}
                  </a>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                    {item.snippet}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>{item.source}</span>
                    <span>{item.pubDate?.slice(0, 16)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#555', textAlign: 'center', marginTop: 8 }}>
            实时数据来自 Google News RSS · 点击标题查看原文 · {liveLoading ? '加载中...' : `5分钟内缓存有效`}
          </div>
        </div>
      )}

      {tab === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {social.map((post) => {
            const sColor = SENTIMENT_COLORS[post.sentiment > 0.2 ? 'bullish' : post.sentiment < -0.2 ? 'bearish' : 'neutral'];
            return (
              <div key={post.id} style={{
                background: 'var(--bg-card)', borderRadius: 10, padding: 14,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        background: post.platform === 'Reddit' ? '#ff450022' : '#00a4ff22',
                        color: post.platform === 'Reddit' ? '#ff4500' : '#00a4ff',
                      }}>
                        {post.platform}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.author}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>
                      {post.content}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>👍 {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>{post.published_at}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                    whiteSpace: 'nowrap', height: 'fit-content',
                    color: sColor, background: sColor + '22', border: `1px solid ${sColor}44`,
                  }}>
                    {post.sentiment_label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: '#555' }}>
        情绪评分由新闻情绪（60%）和社媒情绪（40%）加权聚合而成。新闻来源包括财经媒体、券商研报；社媒数据来自雪球、微博、Reddit 等平台。
      </div>
    </div>
  );
}
