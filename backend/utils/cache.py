"""简易内存缓存"""
from cachetools import TTLCache
from config import get_settings

settings = get_settings()

# 情绪评分缓存
sentiment_cache = TTLCache(maxsize=500, ttl=settings.SENTIMENT_CACHE_TTL)
# 新闻缓存
news_cache = TTLCache(maxsize=200, ttl=settings.NEWS_CACHE_TTL)
# 行情缓存
quote_cache = TTLCache(maxsize=200, ttl=settings.QUOTE_CACHE_TTL)


def cached(cache: TTLCache):
    """缓存装饰器"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # 用 stock_code 作为 key
            key = args[0] if args else kwargs.get("code", "default")
            if key in cache:
                return cache[key]
            result = await func(*args, **kwargs)
            if result is not None:
                cache[key] = result
            return result
        return wrapper
    return decorator
