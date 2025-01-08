import { createWebSocket } from '@/lib/websocket';
import { log, error } from '@/utils/logger';

export interface BinanceTicker {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // First trade(F)-1 price
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

const CHUNK_SIZE = 20; // Maximum number of symbols per WebSocket connection

export function subscribeToBinanceTickers(symbols: string[], onUpdate: (ticker: BinanceTicker) => void) {
  const connections: (() => void)[] = [];
  
  // Split symbols into chunks
  for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
    const symbolChunk = symbols.slice(i, i + CHUNK_SIZE);
    const streams = symbolChunk.map(symbol => `${symbol.toLowerCase()}usdt@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    
    log('Connecting to Binance WebSocket with streams:', streams);
    
    const ws = createWebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const ticker: BinanceTicker = JSON.parse(event.data);
        onUpdate(ticker);
      } catch (err) {
        error('Error parsing Binance ticker data:', err);
      }
    };
    
    connections.push(() => ws.close());
  }
  
  // Return cleanup function that closes all connections
  return () => {
    connections.forEach(cleanup => cleanup());
  };
}

