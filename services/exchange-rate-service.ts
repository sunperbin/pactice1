import { createWebSocket } from '@/lib/websocket';

export interface ExchangeRate {
  currency: string;
  rate: number;
}

export function subscribeToExchangeRates(onUpdate: (rate: ExchangeRate) => void) {
  // 실제 환율 웹소켓 URL로 대체해야 합니다.
  const ws = createWebSocket('wss://example.com/exchange-rate-websocket');

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // 여기서는 USD/KRW 환율만 처리합니다. 필요에 따라 다른 통화도 추가할 수 있습니다.
      if (data.currency === 'USD/KRW') {
        onUpdate({
          currency: data.currency,
          rate: parseFloat(data.rate)
        });
      }
    } catch (error) {
      console.error('Error parsing exchange rate data:', error);
    }
  };

  return () => ws.close();
}

