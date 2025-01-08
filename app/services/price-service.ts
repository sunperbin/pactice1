import { createWebSocket } from '@/lib/websocket'

export type CryptoPrice = {
  symbol: string
  price: number
  priceUSD: number
  priceKRW: number
  change24h: number
  volume24h: number
  marketCap: number
  btcPrice: number
  premium: number
}

export function subscribeToPrices(onUpdate: (prices: CryptoPrice[]) => void) {
  const ws = createWebSocket('wss://your-websocket-server.com')
  
  ws.onmessage = (event) => {
    const prices = JSON.parse(event.data)
    onUpdate(prices)
  }

  return () => ws.close()
}

export async function getPrices(): Promise<CryptoPrice[]> {
  const response = await fetch('https://api.your-server.com/prices', {
    next: { revalidate: 10 } // Revalidate every 10 seconds
  })
  return response.json()
}

