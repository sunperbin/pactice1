import { Notification } from '../components/notifications/NotificationManager'
import { sendNotification } from '../utils/notificationManager'

let ws: WebSocket | null = null;
let activeNotifications: Notification[] = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_INTERVAL = 1000;
let reconnectInterval = INITIAL_RECONNECT_INTERVAL;

export function connectToWebSocket(notifications: Notification[]) {
  activeNotifications = notifications;
  if (ws) {
    ws.close();
  }
  ws = new WebSocket('wss://your-websocket-endpoint.com');

  ws.onopen = () => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0;
    reconnectInterval = INITIAL_RECONNECT_INTERVAL;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'priceUpdate') {
      checkAlerts(data);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    reconnect();
  };

  ws.onclose = (event) => {
    if (event.wasClean) {
      console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
      console.error('WebSocket connection abruptly closed');
    }
    reconnect();
  };
}

function reconnect() {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    setTimeout(() => connectToWebSocket(activeNotifications), reconnectInterval);
    reconnectInterval = Math.min(reconnectInterval * 2, 30000); // Max 30 seconds
  } else {
    console.error('Max reconnection attempts reached. Please check your connection.');
  }
}

export function updateNotifications(notifications: Notification[]) {
  activeNotifications = notifications;
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
  }
}

export function manualReconnect() {
  reconnectAttempts = 0;
  reconnectInterval = INITIAL_RECONNECT_INTERVAL;
  connectToWebSocket(activeNotifications);
}

function checkAlerts(data: any) {
  const { symbol, upbitPrice, binancePrice } = data;
  const kimchiPremium = ((upbitPrice / binancePrice) - 1) * 100;

  activeNotifications.forEach(notification => {
    if (notification.symbol === symbol) {
      let currentValue: number;
      let alertTitle: string;
      let alertBody: string;

      switch (notification.type) {
        case 'upbitPrice':
          currentValue = upbitPrice;
          alertTitle = `업비트 가격 알림: ${symbol}`;
          alertBody = `${symbol}의 업비트 가격이 ${upbitPrice.toLocaleString()} KRW에 도달했습니다.`;
          break;
        case 'binancePrice':
          currentValue = binancePrice;
          alertTitle = `바이낸스 가격 알림: ${symbol}`;
          alertBody = `${symbol}의 바이낸스 가격이 ${binancePrice.toLocaleString()} USDT에 도달했습니다.`;
          break;
        case 'kimchiPremium':
          currentValue = kimchiPremium;
          alertTitle = `김치 프리미엄 알림: ${symbol}`;
          alertBody = `${symbol}의 김치 프리미엄이 ${kimchiPremium.toFixed(2)}%에 도달했습니다.`;
          break;
      }

      if ((notification.condition === 'above' && currentValue >= notification.value) ||
          (notification.condition === 'below' && currentValue <= notification.value)) {
        sendNotification(alertTitle, { body: alertBody });
        // 알림이 트리거된 후 해당 알림을 제거합니다.
        removeNotification(notification.id);
      }
    }
  });
}

// 알림 제거 함수 추가
function removeNotification(id: string) {
  activeNotifications = activeNotifications.filter(notification => notification.id !== id);
  // NotificationManager 컴포넌트의 상태를 업데이트하기 위해 이벤트를 발생시킵니다.
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'removeNotification', id }));
  }
}

