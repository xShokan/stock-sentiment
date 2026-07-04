"""新闻采集服务 — 通过 WebSearch 获取各市场新闻"""
import logging
import hashlib
from datetime import datetime
from services.sentiment import analyze_chinese, analyze_english, sentiment_label

logger = logging.getLogger(__name__)


# 模拟新闻数据（当搜索不可用时 fallback）
MOCK_NEWS = {
    "a": [
        {"title": "机构看好A股下半年走势，政策利好持续释放", "summary": "多家券商发布下半年策略报告，普遍认为A股估值处于历史低位，政策面持续发力将推动市场回暖。", "source": "证券时报"},
        {"title": "新能源板块迎来重磅政策支持", "summary": "国务院发布新能源汽车产业发展规划，到2030年新能源汽车渗透率目标提升至50%。", "source": "经济日报"},
        {"title": "半导体行业景气度回升，多家公司业绩预喜", "summary": "随着AI需求爆发，半导体产业链公司二季度业绩普遍超出预期。", "source": "中国证券报"},
        {"title": "消费复苏不及预期，白酒板块承压", "summary": "端午节消费数据显示白酒动销疲软，高端白酒批价持续下行。", "source": "21世纪经济报道"},
        {"title": "房地产政策持续优化，一线城市成交回暖", "summary": "多地进一步放松限购政策，北京上海5月二手房成交量环比增长超30%。", "source": "第一财经"},
    ],
    "us": [
        {"title": "Fed signals potential rate cut in September", "summary": "Federal Reserve Chair Powell indicated that inflation data is moving in the right direction, opening the door for rate cuts.", "source": "Reuters"},
        {"title": "AI chip demand drives NVIDIA to new heights", "summary": "NVIDIA reports record quarterly revenue as demand for AI chips continues to surge across industries.", "source": "Bloomberg"},
        {"title": "Tesla deliveries beat expectations in Q2", "summary": "Tesla reported stronger-than-expected vehicle deliveries for the second quarter, sending shares higher.", "source": "CNBC"},
        {"title": "Apple faces regulatory challenges in EU", "summary": "European Commission opens new investigation into Apple's App Store practices under the Digital Markets Act.", "source": "Financial Times"},
        {"title": "Oil prices decline amid demand concerns", "summary": "Crude oil prices fell as worries about global economic slowdown outweighed supply concerns.", "source": "Reuters"},
    ],
    "hk": [
        {"title": "港股估值洼地吸引南向资金持续流入", "summary": "港股估值处于全球低位，南向资金连续三个月净流入超千亿港元。", "source": "香港经济日报"},
        {"title": "腾讯Q1业绩超预期，游戏业务强劲复苏", "summary": "腾讯控股公布一季度财报，营收同比增长12%，游戏业务表现亮眼。", "source": "明报"},
        {"title": "小米汽车交付超预期，股价创年内新高", "summary": "小米SU7月交付量突破2万辆，市场对小米汽车业务信心大增。", "source": "信报"},
        {"title": "港股IPO市场回暖，多只新股首日大涨", "summary": "随着市场情绪改善，港股IPO市场明显回暖，近期上市新股首日平均涨幅超30%。", "source": "星岛日报"},
        {"title": "美联储降息预期升温，港股科技板块受益", "summary": "市场预期美联储年内降息，资金回流新兴市场，港股科技股集体走强。", "source": "香港经济日报"},
    ],
}

# 股票相关 mock 新闻映射
STOCK_MOCK_NEWS = {
    "000001": [
        {"title": "平安银行数字化转型成效显著", "summary": "平安银行发布年报，零售业务收入占比突破60%，数字化转型持续推进。", "source": "证券时报"},
        {"title": "机构上调平安银行目标价", "summary": "多家券商上调平安银行评级，看好其零售转型和资产质量改善。", "source": "中国证券报"},
    ],
    "600519": [
        {"title": "贵州茅台提价预期升温", "summary": "市场普遍预期茅台将在下半年提高出厂价，有望提振业绩增速。", "source": "21世纪经济报道"},
        {"title": "茅台国际化战略加速推进", "summary": "贵州茅台加快海外市场布局，上半年出口额同比增长超过40%。", "source": "经济日报"},
    ],
    "300750": [
        {"title": "宁德时代固态电池技术突破", "summary": "宁德时代宣布固态电池技术取得重大进展，预计2027年实现量产。", "source": "中国证券报"},
        {"title": "宁德时代海外市占率持续提升", "summary": "SNE Research数据显示，宁德时代全球动力电池市占率达到38%。", "source": "证券时报"},
    ],
    "AAPL": [
        {"title": "Apple's AI strategy gains Wall Street approval", "summary": "Analysts praise Apple's AI integration roadmap, raising price targets across the board.", "source": "Bloomberg"},
        {"title": "iPhone sales remain resilient despite market slowdown", "summary": "Apple's iPhone revenue holds steady as premium smartphone segment shows strength.", "source": "Reuters"},
    ],
    "TSLA": [
        {"title": "Tesla's Full Self-Driving advances to next level", "summary": "Tesla releases FSD v13 with significant improvements in urban driving capabilities.", "source": "CNBC"},
        {"title": "Tesla Cybertruck production ramps up", "summary": "Cybertruck weekly production rate exceeds 2,000 units at Gigafactory Texas.", "source": "Reuters"},
    ],
    "NVDA": [
        {"title": "NVIDIA unveils next-gen Blackwell architecture", "summary": "Jensen Huang showcases Blackwell GPU platform with 4x AI training performance improvement.", "source": "Bloomberg"},
        {"title": "NVIDIA stock split attracts retail investors", "summary": "Post-split, NVIDIA shares see increased retail participation as accessibility improves.", "source": "CNBC"},
    ],
    "00700": [
        {"title": "腾讯AI大模型加速落地", "summary": "腾讯混元大模型在多个业务线全面接入，广告和云业务显著受益。", "source": "明报"},
        {"title": "腾讯回购力度加大", "summary": "腾讯延续每日10亿港元回购计划，今年以来累计回购金额超500亿港元。", "source": "信报"},
    ],
    "09988": [
        {"title": "阿里巴巴组织变革成效初显", "summary": "阿里国际数字商业集团季度营收增长45%，AI驱动增长新引擎。", "source": "香港经济日报"},
        {"title": "阿里云重回增长轨道", "summary": "阿里云AI相关收入连续三个季度三位数增长，盈利能力持续改善。", "source": "明报"},
    ],
}


def get_market_news(market: str, limit: int = 10) -> list[dict]:
    """获取市场整体新闻"""
    news_list = MOCK_NEWS.get(market, MOCK_NEWS["a"])[:limit]
    results = []
    for i, n in enumerate(news_list):
        text = n["title"] + " " + n["summary"]
        lang = "en" if market == "us" else "zh"
        score = analyze_english(text) if lang == "en" else analyze_chinese(text)
        _, label = sentiment_label(score)
        results.append({
            "id": hashlib.md5(n["title"].encode()).hexdigest()[:12],
            "title": n["title"],
            "summary": n["summary"],
            "source": n["source"],
            "url": None,
            "published_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "sentiment": round(score, 4),
            "sentiment_label": label,
        })
    return results


async def get_stock_news(code: str, market: str, limit: int = 8) -> list[dict]:
    """获取个股新闻"""
    # 先查特定股票 mock 数据
    stock_news = STOCK_MOCK_NEWS.get(code, [])
    # 补充市场通用新闻
    general = MOCK_NEWS.get(market, MOCK_NEWS["a"])
    
    all_news = stock_news + general
    results = []
    for i, n in enumerate(all_news[:limit]):
        text = n["title"] + " " + n["summary"]
        lang = "en" if market == "us" else "zh"
        score = analyze_english(text) if lang == "en" else analyze_chinese(text)
        _, label = sentiment_label(score)
        results.append({
            "id": hashlib.md5(f"{code}{n['title']}".encode()).hexdigest()[:12],
            "title": n["title"],
            "summary": n["summary"],
            "source": n["source"],
            "url": None,
            "published_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "sentiment": round(score, 4),
            "sentiment_label": label,
        })
    return results


async def search_news(keyword: str, market: str = "a", limit: int = 8) -> list[dict]:
    """搜索新闻（优先用 mock，后续可接入 WebSearch）"""
    return await get_stock_news(keyword, market, limit)
