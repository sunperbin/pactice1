import React, { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

interface NotificationHistoryItem {
  title: string;
  body: string;
  timestamp: string;
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    setNotifications(storedNotifications);
  }, []);

  const resetNotificationHistory = () => {
    localStorage.setItem('notificationHistory', '[]');
    setNotifications([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">알림 내역</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={resetNotificationHistory}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          초기화
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification, index) => (
              <li key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm">{notification.body}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>아직 알림 내역이 없습니다.</p>
        )}
      </ScrollArea>
    </div>
  )
}

