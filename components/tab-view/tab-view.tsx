'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketSummary } from '@/components/market-summary/market-summary'
import { Chat } from '@/components/chat/chat'
import { NotificationManager } from '@/components/notifications/NotificationManager'

export function TabView() {
  const [activeTab, setActiveTab] = useState("market")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="market">시장동향</TabsTrigger>
        <TabsTrigger value="chat">채팅</TabsTrigger>
        <TabsTrigger value="notifications">알림</TabsTrigger>
      </TabsList>
      <TabsContent value="market">
        <MarketSummary />
      </TabsContent>
      <TabsContent value="chat">
        <Chat />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationManager />
      </TabsContent>
    </Tabs>
  )
}

