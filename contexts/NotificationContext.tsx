import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { sendNotification } from '@/utils/notificationManager';
import { Toast } from '@/components/notifications/Toast';

export interface Notification {
  id: string;
  type: 'binancePrice' | 'upbitPrice' | 'kimchiPremium';
  symbol: string;
  condition: 'above' | 'below';
  value: number;
}

interface Price {
  symbol: string;
  upbitPrice: number;
  binancePrice: number;
  premium: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  checkNotifications: (prices: Price[]) => void;
  toasts: string[];
  addToast: (message: string) => void;
  removeToast: (index: number) => void;
  currentPrices: Price[];
  updateCurrentPrices: (prices: Price[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<string[]>([]);
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio('/notification-sound.mp3') : null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentPrices, setCurrentPrices] = useState<Price[]>([]);

  const addToastRef = useRef<(message: string) => void>(() => {});
  const removeNotificationRef = useRef<(id: string) => void>(() => {});
  const playNotificationSoundRef = useRef<() => void>(() => {});

  const addToast = useCallback((message: string) => {
    setToasts(prev => {
      if (!prev.includes(message)) {
        return [...prev, message];
      }
      return prev;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audio && hasInteracted) {
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [audio, hasInteracted]);

  useEffect(() => {
    addToastRef.current = addToast;
    removeNotificationRef.current = removeNotification;
    playNotificationSoundRef.current = playNotificationSound;
  }, [addToast, removeNotification, playNotificationSound]);

  const checkSingleNotification = useCallback((notification: Notification, price: Price): boolean => {
    let currentValue: number;
    let alertTitle: string;
    let alertBody: string;

    switch (notification.type) {
      case 'upbitPrice':
        currentValue = price.upbitPrice;
        alertTitle = `업비트 가격 알림: ${notification.symbol}`;
        alertBody = `${notification.symbol}의 업비트 가격이 ${currentValue.toLocaleString()} KRW에 도달했습니다.`;
        break;
      case 'binancePrice':
        currentValue = price.binancePrice;
        alertTitle = `바이낸스 가격 알림: ${notification.symbol}`;
        alertBody = `${notification.symbol}의 바이낸스 가격이 ${currentValue.toLocaleString()} USDT에 도달했습니다.`;
        break;
      case 'kimchiPremium':
        currentValue = price.premium;
        alertTitle = `김치 프리미엄 알림: ${notification.symbol}`;
        alertBody = `${notification.symbol}의 김치 프리미엄이 ${currentValue.toFixed(2)}%에 도달했습니다.`;
        break;
    }

    if ((notification.condition === 'above' && currentValue >= notification.value) ||
        (notification.condition === 'below' && currentValue <= notification.value)) {
      sendNotification(alertTitle, { body: alertBody });
      addToastRef.current(`${alertTitle}: ${alertBody}`);
      removeNotificationRef.current(notification.id);
      playNotificationSoundRef.current();
      return true;
    }
    return false;
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now().toString() };
    setNotifications(prev => [...prev, newNotification]);
    // Defer the check to the next tick
    setTimeout(() => {
      const matchingPrice = currentPrices.find(price => price.symbol === newNotification.symbol);
      if (matchingPrice) {
        checkSingleNotification(newNotification, matchingPrice);
      }
    }, 0);
  }, [currentPrices, checkSingleNotification]);

  const removeToast = useCallback((index: number) => {
    setToasts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (audio) {
        audio.play().catch(console.error);
      }
    }
  }, [hasInteracted, audio]);

  const checkNotifications = useCallback((prices: Price[]) => {
    setNotifications(prevNotifications => {
      let hasChanges = false;
      const remainingNotifications = prevNotifications.filter(notification => {
        const matchingPrice = prices.find(price => price.symbol === notification.symbol);
        if (matchingPrice) {
          const shouldRemove = checkSingleNotification(notification, matchingPrice);
          if (shouldRemove) {
            hasChanges = true;
          }
          return !shouldRemove;
        }
        return true;
      });
      return hasChanges ? remainingNotifications : prevNotifications;
    });
  }, [checkSingleNotification]);

  const updateCurrentPrices = useCallback((prices: Price[]) => {
    setCurrentPrices(prices);
    // Use setTimeout to defer the checkNotifications call to the next tick
    setTimeout(() => checkNotifications(prices), 0);
  }, [checkNotifications]);

  useEffect(() => {
    if (audio) {
      audio.load();
    }
  }, [audio]);

  useEffect(() => {
    if (!hasInteracted) {
      const interactionEvents = ['click', 'touchstart', 'keydown'];
      interactionEvents.forEach(event =>
        document.addEventListener(event, handleUserInteraction, { once: true })
      );
      return () => {
        interactionEvents.forEach(event =>
          document.removeEventListener(event, handleUserInteraction)
        );
      };
    }
  }, [hasInteracted, handleUserInteraction]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        checkNotifications,
        toasts,
        addToast,
        removeToast,
        currentPrices,
        updateCurrentPrices
      }}
    >
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          message={toast}
          onClose={() => removeToast(index)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

