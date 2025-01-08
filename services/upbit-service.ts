import axios from 'axios';
import { log, error } from '@/utils/logger';

const UPBIT_API_URL = 'https://api.upbit.com/v1';
const UPBIT_WEBSOCKET_URL = 'wss://api.upbit.com/websocket/v1';

export interface UpbitCoinInfo {
  market: string;
  korean_name: string;
  english_name: string;
}

export interface UpbitTicker {
  type: string;
  code: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: string;
  change_price: number;
  signed_change_price: number;
  change_rate: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  ask_bid: string;
  acc_ask_volume: number;
  acc_bid_volume: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  market_state: string;
  is_trading_suspended: boolean;
  delisting_date: string | null;
  market_warning: string;
  timestamp: number;
  stream_type: string;
}

export async function getUpbitMarkets(): Promise<UpbitCoinInfo[]> {
  try {
    const response = await axios.get(`${UPBIT_API_URL}/market/all?isDetails=true`);
    return response.data.filter((coin: UpbitCoinInfo) => coin.market.startsWith('KRW-'));
  } catch (error) {
    console.error('Error fetching Upbit markets:', error);
    return [];
  }
}

export async function getUpbitTickers(markets: string[]): Promise<any[]> {
  try {
    const marketsParam = markets.join(',');
    const response = await axios.get(`${UPBIT_API_URL}/ticker?markets=${marketsParam}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Upbit tickers:', error);
    return [];
  }
}

export function subscribeToUpbitTickers(symbols: string[], onUpdate: (ticker: UpbitTicker) => void) {
  let ws: WebSocket;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  function connect() {
    ws = new WebSocket(UPBIT_WEBSOCKET_URL);
    
    ws.onopen = () => {
      log('Upbit WebSocket connected');
      reconnectAttempts = 0;
      const message = [
        { ticket: "UNIQUE_TICKET" },
        { type: "ticker", codes: symbols.map(symbol => `KRW-${symbol}`) },
      ];
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonData = reader.result as string;
            if (!jsonData) {
              throw new Error('Empty data received from Upbit WebSocket');
            }
            const ticker: UpbitTicker = JSON.parse(jsonData);
            if (!ticker || !ticker.code) {
              throw new Error('Invalid ticker data received from Upbit');
            }
            onUpdate(ticker);
          } catch (parseError) {
            error('Error parsing Upbit ticker data:', parseError, 'Raw data:', reader.result);
          }
        };
        reader.onerror = (readerError) => {
          error('Error reading Blob data from Upbit WebSocket:', readerError);
        };
        reader.readAsText(event.data);
      } else {
        error('Unexpected data type from Upbit WebSocket:', typeof event.data);
      }
    };

    ws.onerror = (wsError) => {
      error('Upbit WebSocket error:', wsError);
    };

    ws.onclose = (event) => {
      error('Upbit WebSocket closed:', event.code, event.reason);
      attemptReconnect();
    };
  }

  function attemptReconnect() {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      log(`Attempting to reconnect to Upbit WebSocket (${reconnectAttempts}/${maxReconnectAttempts})...`);
      setTimeout(connect, reconnectDelay);
    } else {
      error('Max reconnection attempts reached for Upbit WebSocket. Please check your connection and try again later.');
    }
  }

  connect();

  return () => {
    if (ws) {
      ws.close();
    }
  };
}

