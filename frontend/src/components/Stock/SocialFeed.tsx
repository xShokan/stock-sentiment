/* 社媒讨论列表 */
import { MessageCircle, Heart } from 'lucide-react';
import type { SocialPost } from '../../types';
import { SENTIMENT_COLORS } from '../../types';

interface Props {
  posts: SocialPost[];
}

export default function SocialFeed({ posts }: Props) {
  if (!posts.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <MessageCircle size={32} color="var(--text-secondary)" style={{ marginBottom: 8 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>暂无社交媒体讨论</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {posts.map((post) => (
        <div key={post.id} className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: post.platform === 'Reddit' ? '#ff450022' : '#00a4ff22',
                  color: post.platform === 'Reddit' ? '#ff4500' : '#00a4ff',
                }}>
                  {post.platform}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.author}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{post.published_at}</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                {post.content}
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Heart size={13} /> {post.likes}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <MessageCircle size={13} /> {post.comments}
                </span>
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
                post.sentiment > 0.2 ? 'bullish' : post.sentiment < -0.2 ? 'bearish' : 'neutral'
              ] + '33',
              border: `1px solid ${SENTIMENT_COLORS[
                post.sentiment > 0.2 ? 'bullish' : post.sentiment < -0.2 ? 'bearish' : 'neutral'
              ]}`,
            }}>
              {post.sentiment_label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
