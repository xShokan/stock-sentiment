"""情绪聚合引擎 — 综合新闻+社媒情绪"""
import logging
import math
from datetime import datetime, timedelta
from typing import Optional
from services.sentiment import sentiment_label, analyze_chinese, analyze_english

logger = logging.getLogger(__name__)

NEWS_WEIGHT = 0.6
SOCIAL_WEIGHT = 0.4
DECAY_LAMBDA = 0.3


def compute_decay(published_at: Optional[str]) -> float:
    """计算时效衰减系数: e^(-λ × 距今天数)"""
    if not published_at:
        return 0.5
    try:
        pub_date = datetime.strptime(published_at[:10], "%Y-%m-%d")
        days = (datetime.now() - pub_date).days
        return math.exp(-DECAY_LAMBDA * max(days, 0))
    except (ValueError, TypeError):
        return 0.5


def aggregate(news_items: list[dict], social_items: list[dict]) -> dict:
    """
    聚合新闻和社媒情绪
    news_items: 带 sentiment 字段的新闻列表
    social_items: 带 sentiment, likes, comments 字段的社媒列表
    """
    # 新闻情绪
    news_score = 0.0
    if news_items:
        total_weight = 0.0
        weighted_sum = 0.0
        for n in news_items:
            decay = compute_decay(n.get("published_at"))
            weighted_sum += n.get("sentiment", 0) * decay
            total_weight += decay
        news_score = weighted_sum / total_weight if total_weight > 0 else 0.0

    # 社媒情绪（按互动量加权）
    social_score = 0.0
    if social_items:
        total_interact = 0.0
        weighted_sum = 0.0
        for s in social_items:
            interaction = 1 + math.log(1 + s.get("likes", 0) + s.get("comments", 0))
            weighted_sum += s.get("sentiment", 0) * interaction
            total_interact += interaction
        social_score = weighted_sum / total_interact if total_interact > 0 else 0.0

    # 综合
    has_news = len(news_items) > 0
    has_social = len(social_items) > 0

    if has_news and has_social:
        overall = NEWS_WEIGHT * news_score + SOCIAL_WEIGHT * social_score
        confidence = min(1.0, (len(news_items) + len(social_items)) / 15)
    elif has_news:
        overall = news_score
        confidence = min(0.7, len(news_items) / 10)
    elif has_social:
        overall = social_score
        confidence = min(0.5, len(social_items) / 10)
    else:
        overall = 0.0
        confidence = 0.0

    level, label = sentiment_label(overall)

    return {
        "overall": round(overall, 4),
        "news_score": round(news_score, 4),
        "social_score": round(social_score, 4),
        "level": level,
        "label": label,
        "confidence": round(confidence, 4),
    }
