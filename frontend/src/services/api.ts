/* 统一 API 层 — 开发模式用后端，生产静态模式用 mock 数据 */
import axios from 'axios';
import type {
  StockOverview, SentimentDetail, NewsItem, SocialPost,
  HotStock, MarketOverview, HotTopic, HistoryPoint,
} from '../types';
import {
  mockSearchStocks, mockGetStockOverview, mockGetStockNews, mockGetStockSocial,
  mockGetHotStocks, mockGetMarketOverview, mockGetTopBullish, mockGetTopBearish,
  mockGetHotTopics, mockGetMarketNews, mockGetSentimentDetail, mockGetHistory,
} from './mockData';

// 静态模式：无后端时用模拟数据
const IS_STATIC = import.meta.env.VITE_STATIC === 'true' || window.location.hostname.includes('github.io');

const api = axios.create({ baseURL: '/api', timeout: 15000 });

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// ====== 股票搜索 ======
export async function searchStocks(q: string) {
  if (IS_STATIC) {
    await sleep(150);
    return mockSearchStocks(q);
  }
  const res = await api.get('/stocks/search', { params: { q } });
  return res.data.results;
}

// ====== 股票概览 ======
export async function getStockOverview(code: string): Promise<StockOverview> {
  if (IS_STATIC) {
    await sleep(200);
    const data = mockGetStockOverview(code);
    if (!data) throw new Error('Not found');
    return data;
  }
  const res = await api.get(`/stocks/${code}/overview`);
  return res.data;
}

// ====== 情绪详情 ======
export async function getStockSentiment(code: string): Promise<SentimentDetail> {
  if (IS_STATIC) {
    await sleep(150);
    const data = mockGetSentimentDetail(code);
    if (!data) throw new Error('Not found');
    return data;
  }
  const res = await api.get(`/stocks/${code}/sentiment`);
  return res.data;
}

// ====== 新闻 ======
export async function getStockNews(code: string, limit = 8): Promise<NewsItem[]> {
  if (IS_STATIC) {
    await sleep(100);
    return mockGetStockNews(code);
  }
  const res = await api.get(`/stocks/${code}/news`, { params: { limit } });
  return res.data.news;
}

// ====== 社媒 ======
export async function getStockSocial(code: string, limit = 10): Promise<SocialPost[]> {
  if (IS_STATIC) {
    await sleep(100);
    return mockGetStockSocial(code);
  }
  const res = await api.get(`/stocks/${code}/social`, { params: { limit } });
  return res.data.social;
}

// ====== 历史趋势 ======
export async function getStockHistory(code: string, days = 7): Promise<HistoryPoint[]> {
  if (IS_STATIC) {
    await sleep(80);
    return mockGetHistory();
  }
  const res = await api.get(`/stocks/${code}/history`, { params: { days } });
  return res.data.history;
}

// ====== 热门股票 ======
export async function getHotStocks(limit = 10): Promise<HotStock[]> {
  if (IS_STATIC) {
    await sleep(200);
    return mockGetHotStocks();
  }
  const res = await api.get('/market/hot-stocks', { params: { limit } });
  return res.data.stocks;
}

// ====== 市场概览 ======
export async function getMarketOverview(): Promise<MarketOverview[]> {
  if (IS_STATIC) {
    await sleep(150);
    return mockGetMarketOverview();
  }
  const res = await api.get('/market/overview');
  return res.data.markets;
}

// ====== Top 乐观/悲观 ======
export async function getTopBullish(limit = 8): Promise<HotStock[]> {
  if (IS_STATIC) {
    await sleep(100);
    return mockGetTopBullish();
  }
  const res = await api.get('/market/top-bullish', { params: { limit } });
  return res.data.stocks;
}

export async function getTopBearish(limit = 8): Promise<HotStock[]> {
  if (IS_STATIC) {
    await sleep(100);
    return mockGetTopBearish();
  }
  const res = await api.get('/market/top-bearish', { params: { limit } });
  return res.data.stocks;
}

// ====== 热门话题 ======
export async function getHotTopics(market = 'a'): Promise<HotTopic[]> {
  if (IS_STATIC) {
    await sleep(80);
    return mockGetHotTopics();
  }
  const res = await api.get('/market/hot-topics', { params: { market } });
  return res.data.topics;
}

// ====== 市场新闻 ======
export async function getMarketNews(market = 'a', limit = 10): Promise<NewsItem[]> {
  if (IS_STATIC) {
    await sleep(100);
    return mockGetMarketNews();
  }
  const res = await api.get('/market/news', { params: { market, limit } });
  return res.data.news;
}

// ====== 自定义股票（静态模式仅存本地） ======
let localCustom: { code: string; name: string; market: string }[] = [];

export async function addCustomStock(code: string, name: string, market: string) {
  if (IS_STATIC) {
    localCustom.push({ code: code.toUpperCase(), name, market });
    return { ok: true, code: code.toUpperCase(), name };
  }
  const res = await api.post('/stocks/custom', { code, name, market });
  return res.data;
}

export async function removeCustomStock(code: string) {
  if (IS_STATIC) {
    localCustom = localCustom.filter(s => s.code !== code.toUpperCase());
    return { ok: true };
  }
  const res = await api.delete(`/stocks/custom/${code}`);
  return res.data;
}

export async function listCustomStocks() {
  if (IS_STATIC) return localCustom;
  const res = await api.get('/stocks/custom');
  return res.data.stocks;
}
