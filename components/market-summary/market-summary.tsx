'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TradingViewMiniPrice } from '@/components/trading-view-mini-price/trading-view-mini-price'
import { Gugi } from 'next/font/google'
import { useTheme } from 'next-themes'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface MarketSummary {
  totalMarketCap: number
  totalMarketCapChange24h: number
  totalVolume24h: number
  exchangeRate: number
  lastUpdated: Date
}

const gugiFont = Gugi({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const API_KEY = 'CG-sWcaFNALAdywDiRb9cYBrD2u'
const BASE_URL = 'https://api.coingecko.com/api/v3'
const CACHE_KEY = 'marketSummaryCache'
const UPDATE_INTERVAL = 30 * 60 * 1000 // 30 minutes

export function MarketSummary() {
  const [marketData, setMarketData] = useState<MarketSummary | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const fetchMarketData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        const lastUpdated = new Date(parsedData.lastUpdated)
        if (new Date().getTime() - lastUpdated.getTime() < UPDATE_INTERVAL) {
          setMarketData(parsedData)
          return
        }
      }

      try {
        const globalResponse = await axios.get(`${BASE_URL}/global`, {
          headers: { 'x-cg-demo-api-key': API_KEY },
        });

        const globalData = globalResponse.data.data;

        const newMarketData: MarketSummary = {
          totalMarketCap: globalData.total_market_cap.usd,
          totalMarketCapChange24h: globalData.market_cap_change_percentage_24h_usd,
          totalVolume24h: globalData.total_volume.usd,
          exchangeRate: globalData.total_market_cap.krw / globalData.total_market_cap.usd,
          lastUpdated: new Date()
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(newMarketData))
        setMarketData(newMarketData)
      } catch (error) {
        console.error('Error fetching market data:', error)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  if (!marketData) {
    return <div>Loading market data...</div>
  }

  const formatChange = (change: number) => {
    const formattedChange = change.toFixed(2)
    const Icon = change >= 0 ? ArrowUpIcon : ArrowDownIcon
    const colorClass = change >= 0 ? 'text-green-600' : 'text-red-600'
    return (
      <span className={`flex items-center ${colorClass} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {Math.abs(parseFloat(formattedChange))}%
      </span>
    )
  }

  return (
    <Card className="h-[400px] relative dark:bg-gray-800 dark:text-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className={`${gugiFont.className} text-left dark:text-white`}>시장 동향 요약</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full pt-2 px-4 space-y-4">
        <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs">
            <p className="font-medium dark:text-gray-300">총 시가총액</p>
            <div className="flex items-center">
              <p className="font-bold">${marketData.totalMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <span className="ml-2">{formatChange(marketData.totalMarketCapChange24h)}</span>
            </div>
          </div>
          <div className="text-xs">
            <p className="font-medium dark:text-gray-300">24시간 거래량</p>
            <p className="font-bold">${marketData.totalVolume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="text-xs">
            <p className="font-medium dark:text-gray-300">환율 (USD/KRW)</p>
            <p className="font-bold">₩{marketData.exchangeRate.toFixed(2)}</p>
          </div>
        </div>
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-4 h-[180px] mb-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-1 text-[#f7931a]">비트코인 도미넌스</p>
              <div className="h-[160px]">
                <TradingViewMiniPrice symbol="BTC.D" container="btc-dominance-price" interval="15" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-1 text-[#26a17b]">테더(USDT)</p>
              <div className="h-[160px]">
                <TradingViewMiniPrice symbol="USDTUSD" container="tether-price" interval="15" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

