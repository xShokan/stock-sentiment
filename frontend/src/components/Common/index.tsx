/* 通用组件 */
import { Loader2 } from 'lucide-react';

export function Loading({ text = '加载中...' }: { text?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 60,
      color: 'var(--text-secondary)',
      gap: 12,
    }}>
      <Loader2 size={32} className="animate-spin" />
      <span style={{ fontSize: 14 }}>{text}</span>
    </div>
  );
}

export function EmptyState({ text = '暂无数据' }: { text?: string }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 40,
      color: 'var(--text-secondary)',
      fontSize: 14,
    }}>
      {text}
    </div>
  );
}

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="card" style={{ borderColor: 'var(--red)', textAlign: 'center', padding: 30 }}>
      <p style={{ color: 'var(--red)', fontSize: 14 }}>⚠️ {message}</p>
    </div>
  );
}
