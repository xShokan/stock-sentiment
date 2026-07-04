/* 情绪仪表盘 - ECharts Gauge */
import ReactECharts from 'echarts-for-react';
import type { SentimentScore } from '../../types';

interface Props {
  sentiment: SentimentScore;
  size?: 'small' | 'large';
}

export default function SentimentGauge({ sentiment, size = 'large' }: Props) {
  const value = sentiment.overall; // -1 ~ +1
  const normalizedValue = ((value + 1) / 2) * 100; // 0~100

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        center: ['50%', '60%'],
        radius: size === 'large' ? '85%' : '75%',
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: size === 'large' ? 20 : 14,
            color: [
              [0.2, '#ff1744'],
              [0.4, '#ff6e40'],
              [0.5, '#ffd740'],
              [0.6, '#ffd740'],
              [0.8, '#69f0ae'],
              [1, '#00e676'],
            ],
          },
        },
        pointer: {
          icon: `path://M12.8,0.7l12,40.1H0.7L12.8,0.7z`,
          length: size === 'large' ? '60%' : '50%',
          width: 6,
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: '#e8eaed',
          fontSize: size === 'large' ? 28 : 20,
          offsetCenter: [0, '10%'],
          fontWeight: 'bold',
        },
        title: {
          offsetCenter: [0, '35%'],
          fontSize: size === 'large' ? 14 : 11,
          color: '#9aa0b0',
        },
        data: [
          {
            value: normalizedValue.toFixed(0),
            name: sentiment.label,
          },
        ],
      },
    ],
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ReactECharts
        option={option}
        style={{ height: size === 'large' ? 240 : 180, width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
      <div style={{ marginTop: -10, fontSize: 12, color: 'var(--text-secondary)' }}>
        置信度 {(sentiment.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}
