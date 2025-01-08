'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { PriceTable } from '@/components/price-table/price-table'
import { TabView } from '@/components/tab-view/tab-view'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import SEO from '@/components/SEO'

const DynamicTradingViewChart = dynamic(
  () => import('@/components/trading-view-chart/trading-view-chart').then((mod) => mod.TradingViewChart),
  { ssr: false }
)

const DynamicNotificationManager = dynamic(
  () => import('@/components/notifications/NotificationManager').then((mod) => mod.NotificationManager),
  { ssr: false }
)

export default function HomePage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // 또는 로딩 인디케이터를 표시할 수 있습니다.
  }

  return (
    <NotificationProvider>
      <SEO 
        title="김치프리미엄 - 실시간 암호화폐 가격 비교"
        description="한국과 글로벌 거래소의 실시간 암호화폐 가격을 비교하고 김치 프리미엄을 확인하세요. BTC, ETH 등 주요 코인의 시세를 한눈에 파악할 수 있습니다."
      />
      <div className="container mx-auto px-4 py-6 min-h-screen flex">
        <div className="flex-grow">
          <div className="grid gap-6 grid-cols-1">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="w-full h-[400px] xs:h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]">
                  <DynamicTradingViewChart symbol={selectedCoin} />
                </div>
              </div>
              <div className="lg:col-span-1">
                <TabView />
              </div>
            </div>
            <div>
              <PriceTable onSelectCoin={setSelectedCoin} />
            </div>
          </div>
        </div>
        <div className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-96' : 'w-0'} overflow-hidden`}>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 -left-8 z-10"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <div className="p-4 h-full">
            <DynamicNotificationManager />
          </div>
        </div>
      </div>
    </NotificationProvider>
  )
}

