"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

export function PriceTable() {
  const [prices, setPrices] = useState<CryptoPrice[]>([])

  useEffect(() => {
    // In a real implementation, you would connect to a WebSocket here
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.example.com/prices')
        const data = await response.json()
        setPrices(data)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
            <TableHead className="text-right">24h Volume</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((crypto) => (
            <TableRow key={crypto.symbol}>
              <TableCell className="font-medium">{crypto.symbol}</TableCell>
              <TableCell className="text-right">${crypto.price.toFixed(2)}</TableCell>
              <TableCell className={`text-right ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {crypto.change24h.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">${crypto.volume24h.toLocaleString()}</TableCell>
              <TableCell className="text-right">${crypto.marketCap.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

