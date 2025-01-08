import { subscribeToUpbitTickers, UpbitTicker } from './upbit-service';
import { BinanceTicker, subscribeToBinanceTickers } from './binance-service';
import { log, error } from '@/utils/logger';
import { coins } from '@/data/coins';

export function createUpbitWebSocket(onMessage: (data: UpbitTicker) => void) {
  log('Connecting to Upbit WebSocket');
  const symbols = coins.map(coin => coin.symbol);
  return subscribeToUpbitTickers(symbols, onMessage);
}

export function createBinanceWebSocket(onMessage: (data: BinanceTicker) => void) {
  const symbols = coins.map(coin => coin.symbol.toLowerCase());
  log('Connecting to Binance WebSocket with symbols:', symbols);
  return subscribeToBinanceTickers(symbols, (data) => {
    onMessage(data);
  });
}

export function initializePriceMonitoring(onPriceUpdate: (prices: { [key: string]: { upbitPrice: number, binancePrice: number } }) => void) {
  const prices: { [key: string]: { upbitPrice: number, binancePrice: number } } = {};

  // Initialize prices with null
  coins.forEach(coin => {
    prices[coin.symbol] = { upbitPrice: 0, binancePrice: 0 };
  });

  const unsubscribeUpbit = createUpbitWebSocket((data) => {
    const symbol = data.code.replace('KRW-', '');
    prices[symbol] = { ...prices[symbol], upbitPrice: data.trade_price };
    onPriceUpdate(prices);
  });

  const unsubscribeBinance = createBinanceWebSocket((data) => {
    const symbol = data.s.replace('USDT', '');
    prices[symbol] = { ...prices[symbol], binancePrice: parseFloat(data.c) };
    onPriceUpdate(prices);
  });

  return () => {
    unsubscribeUpbit();
    unsubscribeBinance();
  };
}

