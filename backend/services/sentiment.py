"""NLP 情感分析引擎 — SnowNLP(中文) + VADER(英文)"""
import logging
from snownlp import SnowNLP
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

logger = logging.getLogger(__name__)

# 下载 VADER 词典（首次运行）
try:
    nltk.data.find("sentiment/vader_lexicon.zip")
except LookupError:
    nltk.download("vader_lexicon", quiet=True)

_sia = SentimentIntensityAnalyzer()


def analyze_chinese(text: str) -> float:
    """
    SnowNLP 中文情感分析
    返回: -1 ~ +1 (负数=负面, 正数=正面)
    """
    if not text or len(text.strip()) < 2:
        return 0.0
    try:
        s = SnowNLP(text)
        raw = s.sentiments  # 0~1, 越接近 1 越正面
        # 映射到 -1 ~ +1
        return (raw - 0.5) * 2
    except Exception:
        return 0.0


def analyze_english(text: str) -> float:
    """
    VADER 英文情感分析
    返回: -1 ~ +1
    """
    if not text or len(text.strip()) < 2:
        return 0.0
    try:
        scores = _sia.polarity_scores(text)
        return scores["compound"]  # 已经是 -1~+1
    except Exception:
        return 0.0


def analyze(text: str, lang: str = "zh") -> float:
    """统一入口，根据语言选择分析器"""
    if lang == "en":
        return analyze_english(text)
    else:
        return analyze_chinese(text)


def sentiment_label(score: float) -> tuple[str, str]:
    """
    情绪标签映射
    返回: (level, label)
    """
    if score > 0.6:
        return ("extreme_bullish", "🔥 极度乐观")
    elif score > 0.2:
        return ("bullish", "😊 乐观")
    elif score >= -0.2:
        return ("neutral", "😐 中性")
    elif score >= -0.6:
        return ("bearish", "😟 悲观")
    else:
        return ("extreme_bearish", "❄️ 极度悲观")


def batch_analyze(texts: list[dict]) -> list[dict]:
    """
    批量分析，每个 dict 需含 "text" 和可选的 "lang" 字段
    返回添加了 "sentiment" 和 "sentiment_label" 的 dict
    """
    results = []
    for item in texts:
        text = item.get("text", "")
        lang = item.get("lang", "zh")
        score = analyze(text, lang)
        level, label = sentiment_label(score)
        item["sentiment"] = round(score, 4)
        item["sentiment_label"] = label
        results.append(item)
    return results
