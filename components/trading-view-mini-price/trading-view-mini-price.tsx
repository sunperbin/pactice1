'use client'

import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewMiniPriceProps {
  symbol: string;
  container: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

export function TradingViewMiniPrice({ symbol, container, interval = '15', theme = 'light' }: TradingViewMiniPriceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "height": "100%",
      "locale": "kr",
      "dateRange": "12H",
      "colorTheme": theme,
      "isTransparent": false,
      "autosize": true,
      "largeChartUrl": "",
      "chartOnly": false,
      "showVolume": false,
      "hideDateRanges": true,
      "hideMarketStatus": false,
      "hideSymbolLogo": false,
      "scalePosition": "right",
      "scaleMode": "Normal",
      "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      "fontSize": "10",
      "noTimeScale": false,
      "valuesTracking": "1",
      "changeMode": "price-and-percent",
      "chartType": "bars",
      "timeHoursFormat": "24-hours",
      "lineWidth": 2,
      "timeInterval": interval
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme]);

  return <div id={container} ref={containerRef} className="w-full h-full" />;
}

