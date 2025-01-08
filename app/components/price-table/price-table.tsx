'use client'

import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CryptoPrice } from '@/app/services/price-service'

interface PriceTableProps {
  initialPrices: CryptoPrice[]
}

export function PriceTable({ initialPrices }: PriceTableProps) {
  const [prices, setPrices] = useState<CryptoPrice[]>(initialPrices)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'marketCap',
    direction: 'desc'
  })
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorites') || '[]')
    }
    return []
  })

  useEffect(() => {
    const ws = new WebSocket('wss://your-websocket-server.com')
    
    ws.onmessage = (event) => {
      const newPrices = JSON.parse(event.data)
      setPrices(newPrices)
    }

    return () => ws.close()
  }, [])

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(symbol)
        ? prev.filter(f => f !== symbol)
        : [...prev, symbol]
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const sortedPrices = [...prices].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof CryptoPrice]
    const bValue = b[sortConfig.key as keyof CryptoPrice]
    return sortConfig.direction === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (bValue > aValue ? 1 : -1)
  })

  const filteredPrices = sortedPrices.filter(price => 
    price.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Favorite</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Price (USD)</TableHead>
            <TableHead className="text-right">Price (KRW)</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">Premium</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPrices.map((price) => (
            <TableRow key={price.symbol}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(price.symbol)}
                >
                  <Star
                    className={favorites.includes(price.symbol) ? 'fill-yellow-400' : ''}
                  />
                </Button>
              </TableCell>
              <TableCell className="font-medium">{price.symbol}</TableCell>
              <TableCell className="text-right">
                ${price.priceUSD.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                ₩{price.priceKRW.toLocaleString()}
              </TableCell>
              <TableCell className={`text-right ${price.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {price.change24h > 0 ? <ArrowUp className="inline" /> : <ArrowDown className="inline" />}
                {price.change24h.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                ${(price.volume24h / 1000000).toFixed(2)}M
              </TableCell>
              <TableCell className="text-right">
                ${(price.marketCap / 1000000000).toFixed(2)}B
              </TableCell>
              <TableCell className={`text-right ${price.premium >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {price.premium.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

