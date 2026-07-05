#!/usr/bin/env node
/**
 * 自动新闻抓取脚本 — 从 Google News RSS 抓取最新财经新闻
 * 运行: node scripts/fetch-news.js
 * 输出: frontend/src/services/realNews.ts
 */
const fs = require('fs');
const https = require('https');

const OUTPUT = 'frontend/src/services/realNews.ts';

// 目标股票
const STOCKS = [
  // A股
  '600519', '300750', '002594', '688981', '000001', '000858', '601318', '600036',
  // 港股
  '00700', '09988', '01810', '03690',
  // 美股
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'AMD', 'ARM', 'NFLX',
];

const STOCK_NAMES = {
  '600519': '贵州茅台', '300750': '宁德时代', '002594': '比亚迪', '688981': '中芯国际',
  '000001': '平安银行', '000858': '五粮液', '601318': '中国平安', '600036': '招商银行',
  '00700': '腾讯控股', '09988': '阿里巴巴', '01810': '小米集团', '03690': '美团',
  'AAPL': 'Apple', 'TSLA': 'Tesla', 'NVDA': 'NVIDIA', 'MSFT': 'Microsoft',
  'AMZN': 'Amazon', 'META': 'Meta', 'GOOGL': 'Google', 'AMD': 'AMD',
  'ARM': 'Arm Holdings', 'NFLX': 'Netflix',
};

function fetchRSS(query) {
  return new Promise((resolve, reject) => {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+stock&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (e) => {
      // Try English fallback
      const enURL = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+stock&hl=en-US&gl=US&ceid=US:en`;
      https.get(enURL, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => resolve(data2));
      }).on('error', () => resolve(''));
    });
  });
}

function cleanHtml(s) {
  return (s || '')
    // 先解码 HTML 实体（Google News CN 用双编码）
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // 移除整个 a 标签及内容
    .replace(/<a[^>]*>.*?<\/a>/gi, '')
    // 移除所有剩余 HTML 标签
    .replace(/<[^>]*>/g, '')
    // 再次清理可能残留的实体
    .replace(/&[a-z]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSummary(title, desc) {
  // 从 description 提取纯文本摘要
  let text = cleanHtml(desc);
  // 如果摘要和标题差不多，说明没实际内容
  if (!text || text.length < 10 || title.includes(text.slice(0, 15))) {
    return '';
  }
  return text.slice(0, 250).trim();
}

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemXml.match(/<title>(.*?)<\/title>/))?.[1] || '';
    const desc = (itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemXml.match(/<description>(.*?)<\/description>/))?.[1] || '';
    const source = (itemXml.match(/<source[^>]*>(.*?)<\/source>/))?.[1] || '';
    const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/))?.[1] || '';

    const cleanTitle = cleanHtml(title);
    const cleanDesc = desc; // keep raw for extractSummary
    const cleanSource = cleanHtml(source);

    if (cleanTitle) {
      const summary = extractSummary(cleanTitle, cleanDesc) || cleanTitle;
      items.push({
        title: cleanTitle.slice(0, 120),
        summary: summary,
        source: cleanSource || '财经媒体',
        date: pubDate,
      });
    }
  }
  return items.slice(0, 2); // 每只股票最多 2 条
}

function escape(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
}

async function main() {
  console.log('📰 开始抓取最新新闻...\n');
  const results = {};

  for (let i = 0; i < STOCKS.length; i++) {
    const code = STOCKS[i];
    const name = STOCK_NAMES[code] || code;
    const isUS = ['AAPL','TSLA','NVDA','MSFT','AMZN','META','GOOGL','AMD','ARM','NFLX'].includes(code);

    const query = isUS ? `${name} stock` : `${name} 股票`;
    process.stdout.write(`  [${i+1}/${STOCKS.length}] ${code} ${name} ... `);

    try {
      const xml = await fetchRSS(query);
      const items = parseRSSItems(xml);
      if (items.length > 0) {
        results[code] = items;
        console.log(`✓ ${items.length} 条`);
      } else {
        console.log('✗ 无结果');
      }
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }

    // 避免限流
    if (i < STOCKS.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  // 生成 TypeScript
  const stockCount = Object.keys(results).length;
  const newsCount = Object.values(results).flat().length;

  let ts = `// ====== 自动抓取的真实新闻数据（生成时间: ${new Date().toISOString()}） ======\n`;
  ts += `// 覆盖 ${stockCount} 只股票，共 ${newsCount} 条新闻\n`;
  ts += 'export const REAL_NEWS: Record<string, {title:string;summary:string;source:string}[]> = {\n';

  for (const code of STOCKS) {
    const items = results[code];
    if (!items || items.length === 0) continue;
    ts += `  '${code}': [\n`;
    for (const item of items) {
      ts += `    {title:'${escape(item.title)}', summary:'${escape(item.summary)}', source:'${escape(item.source)}'},\n`;
    }
    ts += '  ],\n';
  }
  ts += '};\n';

  fs.writeFileSync(OUTPUT, ts, 'utf-8');
  console.log(`\n✅ 已生成 ${OUTPUT} (${stockCount} 只股票, ${newsCount} 条新闻)`);
}

main().catch(e => {
  console.error('❌ 抓取失败:', e.message);
  process.exit(1);
});
