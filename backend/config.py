"""应用配置"""
from functools import lru_cache


class Settings:
    APP_NAME = "Stock Sentiment Analyzer"
    VERSION = "0.1.0"
    DEBUG = True

    # 缓存时间（秒）
    SENTIMENT_CACHE_TTL = 300  # 情绪评分 5 分钟
    NEWS_CACHE_TTL = 900  # 新闻 15 分钟
    QUOTE_CACHE_TTL = 60  # 行情 1 分钟

    # 情绪聚合权重
    NEWS_WEIGHT = 0.6
    SOCIAL_WEIGHT = 0.4

    # 时效衰减系数
    DECAY_LAMBDA = 0.3

    # 预设股票池
    HOT_STOCKS = [
        # === A股 ===
        {"code": "600519", "name": "贵州茅台", "market": "a"},
        {"code": "000001", "name": "平安银行", "market": "a"},
        {"code": "300750", "name": "宁德时代", "market": "a"},
        {"code": "000858", "name": "五粮液", "market": "a"},
        {"code": "601318", "name": "中国平安", "market": "a"},
        {"code": "002594", "name": "比亚迪", "market": "a"},
        {"code": "688981", "name": "中芯国际", "market": "a"},
        {"code": "600036", "name": "招商银行", "market": "a"},
        {"code": "000333", "name": "美的集团", "market": "a"},
        {"code": "000651", "name": "格力电器", "market": "a"},
        {"code": "601012", "name": "隆基绿能", "market": "a"},
        {"code": "603259", "name": "药明康德", "market": "a"},
        {"code": "600030", "name": "中信证券", "market": "a"},
        {"code": "002415", "name": "海康威视", "market": "a"},
        {"code": "300059", "name": "东方财富", "market": "a"},
        {"code": "600941", "name": "中国移动", "market": "a"},
        {"code": "601398", "name": "工商银行", "market": "a"},
        {"code": "601939", "name": "建设银行", "market": "a"},
        {"code": "601857", "name": "中国石油", "market": "a"},
        {"code": "601088", "name": "中国神华", "market": "a"},
        {"code": "601899", "name": "紫金矿业", "market": "a"},
        {"code": "300274", "name": "阳光电源", "market": "a"},
        {"code": "000063", "name": "中兴通讯", "market": "a"},
        {"code": "000725", "name": "京东方A", "market": "a"},
        {"code": "002475", "name": "立讯精密", "market": "a"},
        {"code": "688111", "name": "金山办公", "market": "a"},
        {"code": "002230", "name": "科大讯飞", "market": "a"},
        {"code": "300124", "name": "汇川技术", "market": "a"},
        {"code": "601888", "name": "中国中免", "market": "a"},
        {"code": "002371", "name": "北方华创", "market": "a"},
        {"code": "688041", "name": "海光信息", "market": "a"},
        {"code": "601899", "name": "紫金矿业", "market": "a"},
        {"code": "600809", "name": "山西汾酒", "market": "a"},
        {"code": "002714", "name": "牧原股份", "market": "a"},
        {"code": "601166", "name": "兴业银行", "market": "a"},
        {"code": "600276", "name": "恒瑞医药", "market": "a"},
        {"code": "300760", "name": "迈瑞医疗", "market": "a"},
        {"code": "000002", "name": "万科A", "market": "a"},
        {"code": "600585", "name": "海螺水泥", "market": "a"},
        {"code": "603986", "name": "兆易创新", "market": "a"},
        # === 港股 ===
        {"code": "00700", "name": "腾讯控股", "market": "hk"},
        {"code": "09988", "name": "阿里巴巴-SW", "market": "hk"},
        {"code": "01810", "name": "小米集团-W", "market": "hk"},
        {"code": "03690", "name": "美团-W", "market": "hk"},
        {"code": "09618", "name": "京东集团-SW", "market": "hk"},
        {"code": "09999", "name": "网易-S", "market": "hk"},
        {"code": "09888", "name": "百度集团-SW", "market": "hk"},
        {"code": "01211", "name": "比亚迪股份", "market": "hk"},
        {"code": "02015", "name": "理想汽车-W", "market": "hk"},
        {"code": "09866", "name": "蔚来-SW", "market": "hk"},
        {"code": "01299", "name": "友邦保险", "market": "hk"},
        {"code": "00388", "name": "香港交易所", "market": "hk"},
        {"code": "00941", "name": "中国移动", "market": "hk"},
        {"code": "02318", "name": "中国平安", "market": "hk"},
        {"code": "03968", "name": "招商银行", "market": "hk"},
        {"code": "02269", "name": "药明生物", "market": "hk"},
        {"code": "00883", "name": "中国海洋石油", "market": "hk"},
        {"code": "01024", "name": "快手-W", "market": "hk"},
        {"code": "02020", "name": "安踏体育", "market": "hk"},
        {"code": "00669", "name": "创科实业", "market": "hk"},
        # === 美股 ===
        {"code": "AAPL", "name": "Apple Inc.", "market": "us"},
        {"code": "TSLA", "name": "Tesla Inc.", "market": "us"},
        {"code": "NVDA", "name": "NVIDIA Corp.", "market": "us"},
        {"code": "MSFT", "name": "Microsoft Corp.", "market": "us"},
        {"code": "GOOGL", "name": "Alphabet Inc.", "market": "us"},
        {"code": "META", "name": "Meta Platforms", "market": "us"},
        {"code": "AMZN", "name": "Amazon.com Inc.", "market": "us"},
        {"code": "AMD", "name": "Advanced Micro Devices", "market": "us"},
        {"code": "ARM", "name": "Arm Holdings", "market": "us"},
        {"code": "NFLX", "name": "Netflix Inc.", "market": "us"},
        {"code": "INTC", "name": "Intel Corp.", "market": "us"},
        {"code": "CRM", "name": "Salesforce Inc.", "market": "us"},
        {"code": "ADBE", "name": "Adobe Inc.", "market": "us"},
        {"code": "PYPL", "name": "PayPal Holdings", "market": "us"},
        {"code": "DIS", "name": "Walt Disney Co.", "market": "us"},
        {"code": "UBER", "name": "Uber Technologies", "market": "us"},
        {"code": "COIN", "name": "Coinbase Global", "market": "us"},
        {"code": "PLTR", "name": "Palantir Technologies", "market": "us"},
        {"code": "SNOW", "name": "Snowflake Inc.", "market": "us"},
        {"code": "SHOP", "name": "Shopify Inc.", "market": "us"},
        {"code": "SQ", "name": "Block Inc.", "market": "us"},
        {"code": "JPM", "name": "JPMorgan Chase", "market": "us"},
        {"code": "BA", "name": "Boeing Co.", "market": "us"},
        {"code": "NKE", "name": "Nike Inc.", "market": "us"},
        {"code": "WMT", "name": "Walmart Inc.", "market": "us"},
    ]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
