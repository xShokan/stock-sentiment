/* 股票情绪分析 - 核心类型定义 */

export interface SentimentScore {
  overall: number;
  news_score: number;
  social_score: number;
  level: 'extreme_bullish' | 'bullish' | 'neutral' | 'bearish' | 'extreme_bearish';
  label: string;
  confidence: number;
}

export interface StockOverview {
  code: string;
  name: string;
  market: 'a' | 'hk' | 'us';
  price: number;
  change_pct: number;
  sentiment: SentimentScore;
  news_count: number;
  social_count: number;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  published_at: string;
  sentiment: number;
  sentiment_label: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  published_at: string;
  sentiment: number;
  sentiment_label: string;
}

export interface HotStock {
  code: string;
  name: string;
  market: string;
  price: number;
  change_pct: number;
  sentiment: number;
  sentiment_label: string;
}

export interface MarketOverview {
  market: string;
  market_label: string;
  avg_sentiment: number;
  sentiment_label: string;
  bullish_count: number;
  bearish_count: number;
  neutral_count: number;
  total_stocks: number;
}

export interface HotTopic {
  keyword: string;
  mention_count: number;
  avg_sentiment: number;
  related_stocks: string[];
}

export interface SentimentDetail {
  code: string;
  name: string;
  sentiment: SentimentScore;
  news_summary: {
    count: number;
    bullish: number;
    neutral: number;
    bearish: number;
  };
  social_summary: {
    count: number;
    bullish: number;
    neutral: number;
    bearish: number;
  };
}

export interface HistoryPoint {
  date: string;
  score: number;
  news_score: number;
  social_score: number;
}

export const MARKET_LABELS: Record<string, string> = {
  a: 'A股',
  hk: '港股',
  us: '美股',
};

export const SENTIMENT_COLORS: Record<string, string> = {
  extreme_bullish: '#00e676',
  bullish: '#69f0ae',
  neutral: '#ffd740',
  bearish: '#ff6e40',
  extreme_bearish: '#ff1744',
};
