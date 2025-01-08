'use client'

import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewMiniChartProps {
  symbol: string;
  container: string;
}

export function TradingViewMiniChart({ symbol, container }: TradingViewMiniChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window.TradingView !== 'undefined' && chartRef.current) {
      new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "kr",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: container,
        hide_top_toolbar: true,
        hide_legend: true,
        save_image: false,
        height: 150,
        hideideas: true,
      });
    }
  }, [symbol, container]);

  return <div id={container} ref={chartRef} />;
}

