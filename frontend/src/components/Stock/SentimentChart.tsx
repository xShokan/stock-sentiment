/* 情绪趋势图 - ECharts Line */
import ReactECharts from 'echarts-for-react';
import type { HistoryPoint } from '../../types';

interface Props {
  history: HistoryPoint[];
}

export default function SentimentChart({ history }: Props) {
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1d2e',
      borderColor: '#2a2e45',
      textStyle: { color: '#e8eaed', fontSize: 12 },
    },
    legend: {
      data: ['综合情绪', '新闻情绪', '社媒情绪'],
      bottom: 0,
      textStyle: { color: '#9aa0b0', fontSize: 11 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: history.map((h) => h.date.slice(5)),
      axisLine: { lineStyle: { color: '#2a2e45' } },
      axisLabel: { color: '#9aa0b0', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: -1,
      max: 1,
      splitLine: { lineStyle: { color: '#2a2e4522' } },
      axisLabel: {
        color: '#9aa0b0',
        fontSize: 11,
        formatter: (v: number) => (v > 0 ? '+' : '') + v.toFixed(1),
      },
    },
    series: [
      {
        name: '综合情绪',
        type: 'line',
        data: history.map((h) => h.score),
        smooth: true,
        lineStyle: { width: 3, color: '#448aff' },
        itemStyle: { color: '#448aff' },
        symbol: 'circle',
        symbolSize: 6,
        markLine: {
          silent: true,
          data: [{ yAxis: 0 }],
          lineStyle: { color: '#2a2e45', type: 'dashed' },
        },
      },
      {
        name: '新闻情绪',
        type: 'line',
        data: history.map((h) => h.news_score),
        smooth: true,
        lineStyle: { width: 2, color: '#69f0ae', type: 'dashed' },
        itemStyle: { color: '#69f0ae' },
        symbol: 'diamond',
        symbolSize: 5,
      },
      {
        name: '社媒情绪',
        type: 'line',
        data: history.map((h) => h.social_score),
        smooth: true,
        lineStyle: { width: 2, color: '#ffab00', type: 'dashed' },
        itemStyle: { color: '#ffab00' },
        symbol: 'triangle',
        symbolSize: 6,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 320, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
