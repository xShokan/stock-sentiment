"""Pydantic 数据模型"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SentimentScore(BaseModel):
    """情绪评分"""
    overall: float  # -1 ~ +1
    news_score: float
    social_score: float
    level: str  # extreme_bullish / bullish / neutral / bearish / extreme_bearish
    label: str  # 🔥极度乐观 / 😊乐观 / 😐中性 / 😟悲观 / ❄️极度悲观
    confidence: float  # 0~1, 基于数据量


class NewsItem(BaseModel):
    """新闻条目"""
    id: str
    title: str
    summary: str
    source: str
    url: Optional[str] = None
    published_at: Optional[str] = None
    sentiment: float  # -1 ~ +1
    sentiment_label: str


class SocialPost(BaseModel):
    """社媒帖子"""
    id: str
    platform: str  # reddit / xueqiu / weibo
    content: str
    author: str
    likes: int = 0
    comments: int = 0
    published_at: Optional[str] = None
    sentiment: float
    sentiment_label: str


class StockOverview(BaseModel):
    """股票概览"""
    code: str
    name: str
    market: str  # a / hk / us
    price: Optional[float] = None
    change_pct: Optional[float] = None
    sentiment: SentimentScore
    news_count: int
    social_count: int
    updated_at: str


class StockSearchResult(BaseModel):
    """搜索结果"""
    code: str
    name: str
    market: str
    market_label: str


class MarketSentiment(BaseModel):
    """市场情绪"""
    market: str
    market_label: str
    avg_sentiment: float
    bullish_count: int
    bearish_count: int
    neutral_count: int
    total_stocks: int


class HotTopic(BaseModel):
    """热门话题"""
    keyword: str
    mention_count: int
    avg_sentiment: float
    related_stocks: list[str]
