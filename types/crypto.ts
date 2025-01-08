export interface CryptoPrice {
  symbol: string
  koreanName: string  // 추가: 한글 이름
  upbitPrice: number
  binancePrice: number
  upbitVolume: number
  binanceVolume: number
  premium: number
}

