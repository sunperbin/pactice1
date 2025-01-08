'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from "next-themes"

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  exchange?: string;
  interval?: string;
}

export function TradingViewChart({ symbol, exchange = 'BINANCE', interval = '60' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initChart;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [symbol, exchange, interval, resolvedTheme]);

  const initChart = () => {
    if (typeof window.TradingView !== 'undefined' && containerRef.current) {
      new window.TradingView.widget({
        fullscreen: false,
        autosize: true,
        symbol: `${exchange}:${symbol}USDT`,
        interval: interval,
        container_id: containerRef.current.id,
        width: '100%',
        height: '100%',
        library_path: '/charting_library/',
        locale: 'ko',
        timezone: 'Asia/Seoul',
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
        style: '1',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        save_image: false,
        hideideas: true,
        studies: [
          "MACD@tv-basicstudies",
          "RSI@tv-basicstudies",
          "VolumeMACrossover@tv-basicstudies"
        ],
        responsive: true,
      });
    }
  };

  return <div id="tradingview_chart_container" ref={containerRef} className="w-full h-full" />;
}

