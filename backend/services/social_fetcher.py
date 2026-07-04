"""社交媒体数据采集 — 模拟数据 + Reddit 接口"""
import logging
import hashlib
import random
from datetime import datetime, timedelta
from services.sentiment import analyze_chinese, analyze_english, sentiment_label

logger = logging.getLogger(__name__)

# 雪球风格模拟帖子
XUEQIU_MOCK = [
    "今天的走势太强了，主力资金明显在加仓，坚定看好后市！目标价看高一线。",
    "业绩超预期，这个估值水平还有很大空间，继续持有。",
    "利空出尽是利好，回调就是上车机会，长线逻辑不变。",
    "缩量调整很正常，大盘无忧，这票基本面扎实，拿着放心。",
    "技术面已经突破年线压制，MACD金叉确认，短期看涨。",
    "最近消息面偏空，短期回避，等趋势明朗再进场。",
    "估值已经很高了，追高风险大，我选择观望。",
    "主力出货迹象明显，大单持续流出，建议减仓。",
    "业绩不及预期，下游需求疲软，行业拐点未到，谨慎。",
    "海外市场不确定性加大，短期可能还有一跌，控制仓位。",
    "政策利好叠加业绩反转，戴维斯双击行情即将启动。",
    "北向资金连续净买入，外资看好中国资产，跟上节奏。",
    "这个位置抛压很重，短期很难突破，做T为主。",
    "产品竞争力强，市场份额持续提升，中长期成长逻辑清晰。",
    "警惕解禁压力，近期大股东减持计划公告较多，注意风险。",
]

# Reddit WSB 风格模拟帖子
REDDIT_MOCK = [
    "YOLO all in! This stock is going to the moon 🚀🚀🚀 Diamond hands baby!",
    "Earnings were insane, guidance raised, 50% upside from here minimum. Loading up more calls.",
    "The turnaround story is real, management is executing perfectly, long term hold.",
    "Technicals looking bullish, golden cross on the weekly chart, this is the breakout.",
    "Solid company with great fundamentals, buying the dip here.",
    "Not touching this with a ten foot pole, way too overvalued right now.",
    "Bag holding since January, this is going nowhere, cutting losses.",
    "Bearish divergence on RSI, smart money is selling, I'm out.",
    "Guidance cut is a major red flag, macro headwinds too strong.",
    "Competition is eating their lunch, losing market share fast, avoid.",
    "Short interest is through the roof, squeeze potential is massive! 💎🙌",
    "Institutions loading up, check the 13F filings, follow the smart money.",
    "Puts printing! This thing is a falling knife, don't catch it.",
    "Regulatory risk is being completely ignored by the market, this is a ticking time bomb.",
    "Moonshot or zero, YOLO. Let's gooooo! 🎰",
]

# 微博风格模拟帖子
WEIBO_MOCK = [
    "这票今天放量大涨，资金明显在抢筹，回调就加仓！",
    "业绩暴雷了，明天大概率跌停，还好昨天跑了。",
    "政策太给力了，这个板块春天来了，满仓干！",
    "大股东减持公告出来了，短期利空，回避吧。",
    "技术面走的很漂亮，量价配合完美，继续看多。",
]


def _random_date(days_back: int = 3) -> str:
    """生成随机日期"""
    dt = datetime.now() - timedelta(days=random.randint(0, days_back), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    return dt.strftime("%Y-%m-%d %H:%M")


def _random_author() -> str:
    authors = ["投资达人老王", "价值投资者", "趋势猎手", "基本面研究员", "量化小散",
               "金融民工小明", "韭菜变镰刀", "长线佛系投资"]
    return random.choice(authors)


async def get_social_posts(code: str, name: str, market: str, limit: int = 10) -> list[dict]:
    """获取个股社交媒体讨论"""
    results = []
    
    if market == "us":
        # 美股: 模拟 Reddit + Twitter 数据
        sources = REDDIT_MOCK
        platform = "Reddit"
    else:
        # A股/港股: 模拟雪球 + 微博数据
        sources = XUEQIU_MOCK + WEIBO_MOCK
        platform = random.choice(["雪球", "微博"])

    selected = random.sample(sources, min(limit, len(sources)))
    
    for content in selected:
        lang = "en" if market == "us" else "zh"
        score = analyze_english(content) if lang == "en" else analyze_chinese(content)
        _, label = sentiment_label(score)
        
        results.append({
            "id": hashlib.md5(f"{code}{content[:20]}".encode()).hexdigest()[:12],
            "platform": "Reddit" if market == "us" else random.choice(["雪球", "雪球", "微博"]),
            "content": content if market == "us" else f"${name}$ {content}",
            "author": f"u/{_random_author().replace(' ', '_')}" if market == "us" else _random_author(),
            "likes": random.randint(0, 500),
            "comments": random.randint(0, 100),
            "published_at": _random_date(2),
            "sentiment": round(score, 4),
            "sentiment_label": label,
        })

    # 按互动量排序
    results.sort(key=lambda x: x["likes"] + x["comments"], reverse=True)
    return results


async def get_hot_topics(market: str = "a", limit: int = 8) -> list[dict]:
    """获取热门讨论话题"""
    topics = {
        "a": [
            ("AI人工智能", ["300750", "688981", "002230"]),
            ("新能源汽车", ["002594", "300750", "000625"]),
            ("半导体芯片", ["688981", "002049", "603986"]),
            ("白酒消费", ["600519", "000858", "002304"]),
            ("光伏储能", ["601012", "688599", "002459"]),
            ("房地产政策", ["000002", "001979", "600048"]),
            ("医药创新", ["300760", "600276", "000963"]),
            ("券商金融", ["600030", "300059", "000776"]),
        ],
        "us": [
            ("AI & Machine Learning", ["NVDA", "MSFT", "GOOGL"]),
            ("Electric Vehicles", ["TSLA", "RIVN", "LCID"]),
            ("Semiconductor", ["NVDA", "AMD", "INTC"]),
            ("Cloud Computing", ["AMZN", "MSFT", "GOOGL"]),
            ("Fed Rate Cuts", ["SPY", "QQQ", "TLT"]),
            ("Cybersecurity", ["CRWD", "PANW", "ZS"]),
            ("Crypto & Blockchain", ["COIN", "MARA", "MSTR"]),
            ("Healthcare Innovation", ["LLY", "UNH", "ABBV"]),
        ],
        "hk": [
            ("科网股反弹", ["00700", "09988", "03690"]),
            ("新能源汽车", ["01211", "02015", "09866"]),
            ("内房股政策", ["00688", "01109", "00823"]),
            ("生物医药", ["02269", "01801", "06160"]),
            ("高股息策略", ["00883", "00941", "00386"]),
        ],
    }

    topic_list = topics.get(market, topics["a"])
    results = []
    for keyword, stocks in topic_list[:limit]:
        # 模拟话题情绪
        avg_score = round(random.uniform(-0.5, 0.7), 3)
        results.append({
            "keyword": keyword,
            "mention_count": random.randint(100, 5000),
            "avg_sentiment": avg_score,
            "related_stocks": stocks,
        })
    return results
