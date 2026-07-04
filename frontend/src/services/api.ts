/* API 服务层 */
import axios from 'axios';
import type {
  StockOverview,
  SentimentDetail,
  NewsItem,
  SocialPost,
  HotStock,
  MarketOverview,
  HotTopic,
  HistoryPoint,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 股票相关
export async function searchStocks(q: string): Promise<{ code: string; name: string; market: string; market_label: string }[]> {
  const res = await api.get('/stocks/search', { params: { q } });
  return res.data.results;
}

export async function getStockOverview(code: string): Promise<StockOverview> {
  const res = await api.get(`/stocks/${code}/overview`);
  return res.data;
}

export async function getStockSentiment(code: string): Promise<SentimentDetail> {
  const res = await api.get(`/stocks/${code}/sentiment`);
  return res.data;
}

export async function getStockNews(code: string, limit = 8): Promise<NewsItem[]> {
  const res = await api.get(`/stocks/${code}/news`, { params: { limit } });
  return res.data.news;
}

export async function getStockSocial(code: string, limit = 10): Promise<SocialPost[]> {
  const res = await api.get(`/stocks/${code}/social`, { params: { limit } });
  return res.data.social;
}

export async function getStockHistory(code: string, days = 7): Promise<HistoryPoint[]> {
  const res = await api.get(`/stocks/${code}/history`, { params: { days } });
  return res.data.history;
}

// 市场相关
export async function getMarketOverview(): Promise<MarketOverview[]> {
  const res = await api.get('/market/overview');
  return res.data.markets;
}

export async function getHotStocks(limit = 10): Promise<HotStock[]> {
  const res = await api.get('/market/hot-stocks', { params: { limit } });
  return res.data.stocks;
}

export async function getTopBullish(limit = 8): Promise<HotStock[]> {
  const res = await api.get('/market/top-bullish', { params: { limit } });
  return res.data.stocks;
}

export async function getTopBearish(limit = 8): Promise<HotStock[]> {
  const res = await api.get('/market/top-bearish', { params: { limit } });
  return res.data.stocks;
}

export async function getHotTopics(market = 'a'): Promise<HotTopic[]> {
  const res = await api.get('/market/hot-topics', { params: { market } });
  return res.data.topics;
}

export async function getMarketNews(market = 'a', limit = 10): Promise<NewsItem[]> {
  const res = await api.get('/market/news', { params: { market, limit } });
  return res.data.news;
}

// 自定义股票
export async function addCustomStock(code: string, name: string, market: string) {
  const res = await api.post('/stocks/custom', { code, name, market });
  return res.data;
}

export async function removeCustomStock(code: string) {
  const res = await api.delete(`/stocks/custom/${code}`);
  return res.data;
}

export async function listCustomStocks() {
  const res = await api.get('/stocks/custom');
  return res.data.stocks;
}
