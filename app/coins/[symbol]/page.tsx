'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import SEO from '@/components/SEO'
import { useState, useEffect } from 'react'
import { TradingViewChart } from '@/components/trading-view-chart/trading-view-chart'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from '@/hooks/useTranslation'

interface CoinData {
  name: string
  symbol: string
  currentPrice: number
  image: string
  marketCap: number
  volume24h: number
  priceChange24h: number
  priceChangePercentage24h: number
}

export default function CoinDetailPage() {
  const params = useParams()
  const symbol = params.symbol as string
  const [coinData, setCoinData] = useState<CoinData | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    // This is a placeholder for actual API call
    const fetchCoinData = async () => {
      // Replace this with actual API call
      const data: CoinData = {
        name: symbol.toUpperCase(),
        symbol: symbol.toUpperCase(),
        currentPrice: 50000,
        image: `https://kimchipremium.com/images/${symbol.toLowerCase()}.png`,
        marketCap: 1000000000,
        volume24h: 500000000,
        priceChange24h: 1000,
        priceChangePercentage24h: 2
      }
      setCoinData(data)
    }

    fetchCoinData()
  }, [symbol])

  if (!coinData) {
    return <div>Loading...</div>
  }

  return (
    <NotificationProvider>
      <SEO 
        title={`${coinData.name} (${coinData.symbol}) ${t.common.title}`}
        description={`${coinData.name}${t.common.description}`}
        image={coinData.image}
        coinData={coinData}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Image
            src={coinData.image}
            alt={coinData.name}
            width={64}
            height={64}
            className="rounded-full mr-4"
          />
          <h1 className="text-3xl font-bold">{coinData.name} ({coinData.symbol})</h1>
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.coinDetail.price}</CardTitle>
            </CardHeader>
            <CardContent>
              <TradingViewChart symbol={symbol} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.common.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>{t.coinDetail.price}: ₩{coinData.currentPrice.toLocaleString()}</p>
                <p>{t.coinDetail.marketCap}: ₩{coinData.marketCap.toLocaleString()}</p>
                <p>{t.coinDetail.volume}: ₩{coinData.volume24h.toLocaleString()}</p>
                <p>{t.coinDetail.priceChange}: ₩{coinData.priceChange24h.toLocaleString()} ({coinData.priceChangePercentage24h.toFixed(2)}%)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NotificationProvider>
  )
}

