import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { NotificationHistory } from './NotificationHistory'
import { NotificationSettings } from './NotificationSettings'
import { AddNotification } from './AddNotification'
import { Toaster } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { useNotificationContext } from '@/contexts/NotificationContext'
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Notification {
  id: string;
  type: 'binancePrice' | 'upbitPrice' | 'kimchiPremium';
  symbol: string;
  condition: 'above' | 'below';
  value: number;
}

export function NotificationManager() {
  const { notifications, addNotification, removeNotification } = useNotificationContext();
  const [activeTab, setActiveTab] = useState("history");

  return (
    <Card className="h-[400px] relative dark:bg-gray-800 dark:text-white flex">
      <CardContent className="p-0 flex-grow">
        <Toaster position="top-right" />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">알림 내역</TabsTrigger>
            <TabsTrigger value="settings">설정 알림</TabsTrigger>
            <TabsTrigger value="add">알림 추가</TabsTrigger>
          </TabsList>
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-[calc(400px-40px)]">
              <div className="p-4">
                <TabsContent value="history" className="h-full">
                  <NotificationHistory />
                </TabsContent>
                <TabsContent value="settings" className="h-full">
                  <NotificationSettings notifications={notifications} removeNotification={removeNotification} />
                </TabsContent>
                <TabsContent value="add" className="h-full">
                  <AddNotification addNotification={addNotification} />
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

