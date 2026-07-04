"""市场相关 API"""
import random
from datetime import datetime
from fastapi import APIRouter, Query
from services.news_fetcher import get_market_news
from services.social_fetcher import get_hot_topics
from services.aggregator import aggregate
from services.sentiment import sentiment_label
from config import get_settings

router = APIRouter(prefix="/api/market", tags=["market"])
settings = get_settings()


@router.get("/overview")
async def market_overview():
    """市场总览"""
    markets = ["a", "hk", "us"]
    market_labels = {"a": "A股", "hk": "港股", "us": "美股"}

    result = []
    for m in markets:
        # 模拟市场情绪
        avg_s = round(random.uniform(-0.3, 0.5), 3)
        _, label = sentiment_label(avg_s)
        total = random.randint(20, 50)
        bullish = int(total * random.uniform(0.2, 0.5))
        bearish = int(total * random.uniform(0.1, 0.4))
        neutral = total - bullish - bearish

        result.append({
            "market": m,
            "market_label": market_labels[m],
            "avg_sentiment": avg_s,
            "sentiment_label": label,
            "bullish_count": bullish,
            "bearish_count": bearish,
            "neutral_count": neutral,
            "total_stocks": total,
        })
    return {"markets": result}


@router.get("/hot-stocks")
async def hot_stocks(limit: int = Query(10, ge=1, le=20)):
    """热门股票情绪列表"""
    from routers.stocks import STOCK_INFO

    result = []
    stocks = settings.HOT_STOCKS[:limit]
    for s in stocks:
        info = STOCK_INFO.get(s["code"], s)
        price = random.uniform(20, 500)
        change = random.uniform(-5, 5)
        sentiment = round(random.uniform(-0.5, 0.7), 3)
        _, label = sentiment_label(sentiment)

        result.append({
            "code": s["code"],
            "name": info.get("name", s["name"]),
            "market": s["market"],
            "price": round(price, 2),
            "change_pct": round(change, 2),
            "sentiment": sentiment,
            "sentiment_label": label,
        })
    return {"stocks": result}


@router.get("/top-bullish")
async def top_bullish(limit: int = Query(8, ge=1, le=20)):
    """最乐观股票 Top N"""
    stocks = random.sample(settings.HOT_STOCKS, min(limit, len(settings.HOT_STOCKS)))
    result = []
    for s in stocks:
        sentiment = round(random.uniform(0.25, 0.8), 3)
        _, label = sentiment_label(sentiment)
        result.append({
            "code": s["code"],
            "name": s["name"],
            "market": s["market"],
            "sentiment": sentiment,
            "sentiment_label": label,
        })
    result.sort(key=lambda x: x["sentiment"], reverse=True)
    return {"stocks": result}


@router.get("/top-bearish")
async def top_bearish(limit: int = Query(8, ge=1, le=20)):
    """最悲观股票 Top N"""
    stocks = random.sample(settings.HOT_STOCKS, min(limit, len(settings.HOT_STOCKS)))
    result = []
    for s in stocks:
        sentiment = round(random.uniform(-0.8, -0.2), 3)
        _, label = sentiment_label(sentiment)
        result.append({
            "code": s["code"],
            "name": s["name"],
            "market": s["market"],
            "sentiment": sentiment,
            "sentiment_label": label,
        })
    result.sort(key=lambda x: x["sentiment"])
    return {"stocks": result}


@router.get("/hot-topics")
async def hot_topics(market: str = Query("a")):
    """热门讨论话题"""
    topics = await get_hot_topics(market)
    return {"market": market, "topics": topics}


@router.get("/news")
async def market_news(market: str = Query("a"), limit: int = Query(10)):
    """市场新闻"""
    news = get_market_news(market, limit)
    return {"market": market, "news": news}
