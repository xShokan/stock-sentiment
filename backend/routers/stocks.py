"""股票相关 API"""
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from models.schemas import StockOverview, StockSearchResult, SentimentScore
from services.news_fetcher import get_stock_news
from services.social_fetcher import get_social_posts
from services.aggregator import aggregate
from services.stock_discovery import discover_stock
from config import get_settings

router = APIRouter(prefix="/api/stocks", tags=["stocks"])
settings = get_settings()

# 股票信息映射
STOCK_INFO = {}
for s in settings.HOT_STOCKS:
    STOCK_INFO[s["code"].upper()] = s

# 自定义股票存储（内存）
CUSTOM_STOCKS: dict[str, dict] = {}


class AddStockRequest(BaseModel):
    code: str
    name: str
    market: str  # a / hk / us


@router.get("/search")
async def search_stocks(q: str = Query("", min_length=1)):
    """搜索股票（本地池 + 自动发现）"""
    all_stocks = {**STOCK_INFO, **CUSTOM_STOCKS}
    results = []
    q_upper = q.strip().upper()
    q_lower = q.strip().lower()

    for code, info in all_stocks.items():
        if q_upper in code.upper() or q_lower in info["name"].lower():
            market_label = {"a": "A股", "hk": "港股", "us": "美股"}.get(info["market"], "")
            results.append({
                "code": code,
                "name": info["name"],
                "market": info["market"],
                "market_label": market_label,
            })

    # 本地没找到 → 自动发现
    if not results:
        discovered = discover_stock(q.strip())
        if discovered:
            code = discovered["code"].upper()
            # 加入自定义池（不覆盖已有）
            if code not in STOCK_INFO and code not in CUSTOM_STOCKS:
                CUSTOM_STOCKS[code] = discovered
            market_label = {"a": "A股", "hk": "港股", "us": "美股"}.get(discovered["market"], "")
            results.append({
                "code": code,
                "name": discovered["name"],
                "market": discovered["market"],
                "market_label": market_label,
            })

    return {"results": results[:10]}


def _get_stock(code: str) -> dict | None:
    """查找股票（预设 + 自定义）"""
    return STOCK_INFO.get(code.upper()) or CUSTOM_STOCKS.get(code.upper())


@router.post("/custom")
async def add_custom_stock(req: AddStockRequest):
    """添加自定义股票"""
    code = req.code.upper().strip()
    if not code:
        raise HTTPException(status_code=400, detail="代码不能为空")
    if code in STOCK_INFO:
        raise HTTPException(status_code=409, detail="该股票已在预设列表中")
    if req.market not in ("a", "hk", "us"):
        raise HTTPException(status_code=400, detail="市场类型无效，可选 a/hk/us")
    CUSTOM_STOCKS[code] = {"code": req.code, "name": req.name, "market": req.market}
    return {"ok": True, "code": code, "name": req.name}


@router.delete("/custom/{code}")
async def remove_custom_stock(code: str):
    """删除自定义股票"""
    c = code.upper()
    if c in STOCK_INFO:
        raise HTTPException(status_code=400, detail="预设股票不能删除")
    if c not in CUSTOM_STOCKS:
        raise HTTPException(status_code=404, detail="未找到该自定义股票")
    del CUSTOM_STOCKS[c]
    return {"ok": True}


@router.get("/custom")
async def list_custom_stocks():
    """列出所有自定义股票"""
    return {"stocks": list(CUSTOM_STOCKS.values())}


@router.get("/{code}/overview")
async def stock_overview(code: str):
    """股票概览（行情+情绪摘要）"""
    info = _get_stock(code)
    if not info:
        raise HTTPException(status_code=404, detail="股票未找到")

    news = await get_stock_news(code, info["market"])
    social = await get_social_posts(code, info["name"], info["market"])
    sentiment = aggregate(news, social)

    price_base = random.uniform(20, 500)
    change_pct = random.uniform(-5, 5)

    return StockOverview(
        code=code.upper(),
        name=info["name"],
        market=info["market"],
        price=round(price_base, 2),
        change_pct=round(change_pct, 2),
        sentiment=SentimentScore(**sentiment),
        news_count=len(news),
        social_count=len(social),
        updated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )


@router.get("/{code}/sentiment")
async def stock_sentiment(code: str):
    """情绪详情"""
    info = _get_stock(code)
    if not info:
        raise HTTPException(status_code=404, detail="股票未找到")

    news = await get_stock_news(code, info["market"])
    social = await get_social_posts(code, info["name"], info["market"])
    sentiment = aggregate(news, social)

    return {
        "code": code,
        "name": info["name"],
        "sentiment": sentiment,
        "news_summary": {
            "count": len(news),
            "bullish": sum(1 for n in news if n["sentiment"] > 0.2),
            "neutral": sum(1 for n in news if -0.2 <= n["sentiment"] <= 0.2),
            "bearish": sum(1 for n in news if n["sentiment"] < -0.2),
        },
        "social_summary": {
            "count": len(social),
            "bullish": sum(1 for s in social if s["sentiment"] > 0.2),
            "neutral": sum(1 for s in social if -0.2 <= s["sentiment"] <= 0.2),
            "bearish": sum(1 for s in social if s["sentiment"] < -0.2),
        },
    }


@router.get("/{code}/news")
async def stock_news(code: str, limit: int = Query(8, ge=1, le=20)):
    """个股新闻列表"""
    info = _get_stock(code)
    if not info:
        raise HTTPException(status_code=404, detail="股票未找到")
    return {"code": code, "news": await get_stock_news(code, info["market"], limit)}


@router.get("/{code}/social")
async def stock_social(code: str, limit: int = Query(10, ge=1, le=30)):
    """社媒讨论列表"""
    info = _get_stock(code)
    if not info:
        raise HTTPException(status_code=404, detail="股票未找到")
    return {"code": code, "social": await get_social_posts(code, info["name"], info["market"], limit)}


@router.get("/{code}/history")
async def stock_history(code: str, days: int = Query(7, ge=1, le=30)):
    """历史情绪趋势"""
    info = _get_stock(code)
    if not info:
        raise HTTPException(status_code=404, detail="股票未找到")

    from datetime import timedelta
    history = []
    for i in range(days, -1, -1):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        # 模拟历史情绪数据（实际应查数据库）
        base = random.uniform(-0.3, 0.5)
        history.append({
            "date": date,
            "score": round(base + random.uniform(-0.2, 0.2), 4),
            "news_score": round(base + random.uniform(-0.15, 0.15), 4),
            "social_score": round(base + random.uniform(-0.25, 0.25), 4),
        })
    return {"code": code, "history": history}
