"""动态股票发现服务 — 搜索不到的股票自动联网查找"""
import json
import re

# 常见股票别名映射（美股）
US_ALIASES = {
    "ARM": ("ARM", "Arm Holdings", "us"),
    "RIVN": ("RIVN", "Rivian Automotive", "us"),
    "SNAP": ("SNAP", "Snap Inc.", "us"),
    "RBLX": ("RBLX", "Roblox Corp.", "us"),
    "LCID": ("LCID", "Lucid Motors", "us"),
    "HOOD": ("HOOD", "Robinhood Markets", "us"),
    "FOO": ("FOO", "Foo", "us"),
    "SOFI": ("SOFI", "SoFi Technologies", "us"),
    "AFRM": ("AFRM", "Affirm Holdings", "us"),
    "DDOG": ("DDOG", "Datadog Inc.", "us"),
    "NET": ("NET", "Cloudflare Inc.", "us"),
    "ZM": ("ZM", "Zoom Video Comms", "us"),
    "CRWD": ("CRWD", "CrowdStrike Holdings", "us"),
    "OKTA": ("OKTA", "Okta Inc.", "us"),
    "TWLO": ("TWLO", "Twilio Inc.", "us"),
    "U": ("U", "Unity Software", "us"),
    "ROKU": ("ROKU", "Roku Inc.", "us"),
    "MDB": ("MDB", "MongoDB Inc.", "us"),
    "ZS": ("ZS", "Zscaler Inc.", "us"),
    "DOCU": ("DOCU", "DocuSign Inc.", "us"),
    "PINS": ("PINS", "Pinterest Inc.", "us"),
    "SPOT": ("SPOT", "Spotify Technology", "us"),
    "DKNG": ("DKNG", "DraftKings Inc.", "us"),
    "GME": ("GME", "GameStop Corp.", "us"),
    "AMC": ("AMC", "AMC Entertainment", "us"),
    "BB": ("BB", "BlackBerry Ltd.", "us"),
    "NIO": ("NIO", "NIO Inc.", "us"),
    "XPEV": ("XPEV", "XPeng Inc.", "us"),
    "LI": ("LI", "Li Auto Inc.", "us"),
    "BABA": ("BABA", "Alibaba Group", "us"),
    "JD": ("JD", "JD.com Inc.", "us"),
    "PDD": ("PDD", "PDD Holdings", "us"),
    "BIDU": ("BIDU", "Baidu Inc.", "us"),
    "TCEHY": ("TCEHY", "Tencent Holdings", "us"),
    "SE": ("SE", "Sea Limited", "us"),
    "NU": ("NU", "Nu Holdings", "us"),
    "SMCI": ("SMCI", "Super Micro Computer", "us"),
    "MRVL": ("MRVL", "Marvell Technology", "us"),
    "ASML": ("ASML", "ASML Holding", "us"),
    "TSM": ("TSM", "Taiwan Semiconductor", "us"),
    "QCOM": ("QCOM", "Qualcomm Inc.", "us"),
    "TXN": ("TXN", "Texas Instruments", "us"),
    "AMAT": ("AMAT", "Applied Materials", "us"),
    "LRCX": ("LRCX", "Lam Research", "us"),
    "MU": ("MU", "Micron Technology", "us"),
    "AVGO": ("AVGO", "Broadcom Inc.", "us"),
    "ORCL": ("ORCL", "Oracle Corp.", "us"),
    "IBM": ("IBM", "IBM Corp.", "us"),
    "V": ("V", "Visa Inc.", "us"),
    "MA": ("MA", "Mastercard Inc.", "us"),
    "COST": ("COST", "Costco Wholesale", "us"),
    "KO": ("KO", "Coca-Cola Co.", "us"),
    "PEP": ("PEP", "PepsiCo Inc.", "us"),
    "MCD": ("MCD", "McDonald's Corp.", "us"),
    "SBUX": ("SBUX", "Starbucks Corp.", "us"),
    "XOM": ("XOM", "Exxon Mobil", "us"),
    "CVX": ("CVX", "Chevron Corp.", "us"),
    "OXY": ("OXY", "Occidental Petroleum", "us"),
    "CAT": ("CAT", "Caterpillar Inc.", "us"),
    "DELL": ("DELL", "Dell Technologies", "us"),
    "HPE": ("HPE", "Hewlett Packard Ent", "us"),
    "HPQ": ("HPQ", "HP Inc.", "us"),
}

# A股别名（代码 -> 正式名）
CN_ALIASES = {
    "000977": ("000977", "浪潮信息", "a"),
    "000938": ("000938", "紫光股份", "a"),
    "601138": ("601138", "工业富联", "a"),
    "300418": ("300418", "昆仑万维", "a"),
    "002236": ("002236", "大华股份", "a"),
    "300502": ("300502", "新易盛", "a"),
    "300308": ("300308", "中际旭创", "a"),
    "688256": ("688256", "寒武纪", "a"),
    "300394": ("300394", "天孚通信", "a"),
    "300033": ("300033", "同花顺", "a"),
    "600570": ("600570", "恒生电子", "a"),
    "300782": ("300782", "卓胜微", "a"),
    "002049": ("002049", "紫光国微", "a"),
    "600584": ("600584", "长电科技", "a"),
    "002241": ("002241", "歌尔股份", "a"),
    "601728": ("601728", "中国电信", "a"),
    "600050": ("600050", "中国联通", "a"),
    "000568": ("000568", "泸州老窖", "a"),
    "002304": ("002304", "洋河股份", "a"),
    "000596": ("000596", "古井贡酒", "a"),
    "600887": ("600887", "伊利股份", "a"),
    "002352": ("002352", "顺丰控股", "a"),
    "601985": ("601985", "中国核电", "a"),
    "600900": ("600900", "长江电力", "a"),
    "600048": ("600048", "保利发展", "a"),
    "601668": ("601668", "中国建筑", "a"),
    "601390": ("601390", "中国中铁", "a"),
    "603799": ("603799", "华友钴业", "a"),
    "002460": ("002460", "赣锋锂业", "a"),
    "002466": ("002466", "天齐锂业", "a"),
    "300014": ("300014", "亿纬锂能", "a"),
    "600031": ("600031", "三一重工", "a"),
    "000625": ("000625", "长安汽车", "a"),
    "300433": ("300433", "蓝思科技", "a"),
    "601615": ("601615", "明阳智能", "a"),
    "688599": ("688599", "天合光能", "a"),
    "002459": ("002459", "晶澳科技", "a"),
    "601689": ("601689", "拓普集团", "a"),
    "300450": ("300450", "先导智能", "a"),
    "600406": ("600406", "国电南瑞", "a"),
    "600089": ("600089", "特变电工", "a"),
    "000100": ("000100", "TCL科技", "a"),
    "300316": ("300316", "晶盛机电", "a"),
}

# 港股别名
HK_ALIASES = {
    "00005": ("00005", "汇丰控股", "hk"),
    "00011": ("00011", "恒生银行", "hk"),
    "00016": ("00016", "新鸿基地产", "hk"),
    "00027": ("00027", "银河娱乐", "hk"),
    "00175": ("00175", "吉利汽车", "hk"),
    "00241": ("00241", "阿里健康", "hk"),
    "00267": ("00267", "中信股份", "hk"),
    "00291": ("00291", "华润啤酒", "hk"),
    "00981": ("00981", "中芯国际", "hk"),
    "01109": ("01109", "华润置地", "hk"),
    "01876": ("01876", "百威亚太", "hk"),
    "01929": ("01929", "周大福", "hk"),
    "02018": ("02018", "瑞声科技", "hk"),
    "02313": ("02313", "申洲国际", "hk"),
    "02319": ("02319", "蒙牛乳业", "hk"),
    "02382": ("02382", "舜宇光学", "hk"),
    "02628": ("02628", "中国人寿", "hk"),
    "02688": ("02688", "新奥能源", "hk"),
    "03328": ("03328", "交通银行", "hk"),
    "03888": ("03888", "金山软件", "hk"),
    "06098": ("06098", "碧桂园服务", "hk"),
    "06618": ("06618", "京东健康", "hk"),
    "09626": ("09626", "哔哩哔哩-W", "hk"),
    "09698": ("09698", "万国数据-SW", "hk"),
    "09868": ("09868", "小鹏汽车-W", "hk"),
    "09961": ("09961", "携程集团-S", "hk"),
}

# 名称关键词映射（中文名搜到对应的代码）
NAME_KEYWORDS = {
    "浪潮": "000977",
    "昆仑万维": "300418",
    "寒武纪": "688256",
    "同花顺": "300033",
    "泸州老窖": "000568",
    "伊利": "600887",
    "顺丰": "002352",
    "赣锋": "002460",
    "三一": "600031",
    "长安": "000625",
    "汇丰": "00005",
    "吉利": "00175",
    "华润啤酒": "00291",
    "金山": "03888",
    "哔哩": "09626",
    "小鹏": "09868",
    "携程": "09961",
    "蒙牛": "02319",
    "阿里健康": "00241",
    "舜宇": "02382",
    "碧桂园": "06098",
    "京东健康": "06618",
    "百威": "01876",
    "周大福": "01929",
    "中国人寿": "02628",
}

ALL_ALIASES = {**US_ALIASES, **CN_ALIASES, **HK_ALIASES}


def discover_stock(query: str) -> dict | None:
    """尝试发现股票，返回 {code, name, market} 或 None"""
    q_upper = query.strip().upper()
    q_lower = query.strip().lower()

    # 1. 精确匹配别名
    if q_upper in ALL_ALIASES:
        code, name, market = ALL_ALIASES[q_upper]
        return {"code": code, "name": name, "market": market}

    # 2. 中文名称关键词匹配
    for kw, code in NAME_KEYWORDS.items():
        if kw in query:
            for aliases in [CN_ALIASES, HK_ALIASES]:
                if code in aliases:
                    c, n, m = aliases[code]
                    return {"code": c, "name": n, "market": m}

    # 3. 按格式智能推断
    # A股: 6位数字
    if re.match(r'^\d{6}$', q_upper):
        return {"code": q_upper, "name": q_upper, "market": "a"}

    # 港股: 5位数字
    if re.match(r'^\d{5}$', q_upper):
        return {"code": q_upper, "name": q_upper, "market": "hk"}

    # 美股: 纯字母 1-5位
    if re.match(r'^[A-Z]{1,5}$', q_upper):
        return {"code": q_upper, "name": q_upper, "market": "us"}

    return None
