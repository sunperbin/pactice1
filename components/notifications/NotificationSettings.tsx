import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Notification } from './NotificationManager'

interface NotificationSettingsProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export function NotificationSettings({ notifications, removeNotification }: NotificationSettingsProps) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4">설정된 알림</h3>
      <ScrollArea className="flex-grow">
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded flex justify-between items-center">
                <span className="text-sm">
                  {notification.symbol} {notification.type === "binancePrice" ? "바이낸스 가격" : 
                                        notification.type === "upbitPrice" ? "업비트 가격" : 
                                        "김치 프리미엄"} 
                  {notification.condition === "above" ? " 이상 " : " 이하 "}
                  {notification.type === "kimchiPremium" ? `${notification.value}%` : 
                   notification.type === "binancePrice" ? `$${notification.value}` : 
                   `₩${notification.value}`}
                </span>
                <Button variant="destructive" size="sm" onClick={() => removeNotification(notification.id)}>삭제</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>설정된 알림이 없습니다.</p>
        )}
      </ScrollArea>
    </div>
  )
}

