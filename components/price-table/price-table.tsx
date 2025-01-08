'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUpbitWebSocket, createBinanceWebSocket } from '@/services/websocket-service'
import { Search, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown, Star, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { getCoinInfo } from '@/services/coingecko-service' // Removed as per update 1
import { coins, Coin } from '@/data/coins'
import { SettingsModal, TableSettings } from './settings-modal'
import { useNotificationContext } from '@/contexts/NotificationContext';
import { getUpbitMarkets, getUpbitTickers, UpbitCoinInfo } from '@/services/upbit-service';

// Exchange logos mapping
const exchangeLogos = {
  upbit: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upbit-mbWhiWTSQoaJqzPIbweR43DMVtcoMX.svg',
  bithumb: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bithumb-HloI8mvcqdAmjMWiUYqWe1L0nn197z.svg',
  binance: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/binance-7yvwnwqAWOsHnFYjJfLKwu8OnyNLze.svg',
  bybit: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bybit-Se0G52Dse1Fh8DDqbqVlISECNbEPaJ.svg',
  okx: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/okx-bejAfIv4rQkcrkHHZU8dr5w55D2882.svg',
  bitget: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bitget-CpVmgevsmEtGoBecIuxcTaYKia75Q3.svg',
  coinone: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coinone-22ugN5oAFCe8Ku4bPiNnE5wmGNDWs7.svg'
}

const koreanExchanges = [
  { value: 'upbit', label: '업비트 KRW' },
  { value: 'bithumb', label: '빗썸 KRW' },
  { value: 'coinone', label: '코인원 KRW' },
]

const foreignExchanges = [
  { value: 'binance', label: '바이낸스 USDT' },
  { value: 'bybit', label: '바이비트 USDT' },
  { value: 'okx', label: 'OKX USDT' },
  { value: 'bitget', label: '비트겟 USDT' },
]

interface Ticker extends Coin {
  upbitPrice: number
  binancePrice: number
  upbitVolume: number
  binanceVolume: number
  premium: number
  change24h: number
  // logoUrl: string
}

type SortField = 'upbitPrice' | 'binancePrice' | 'change24h' | 'upbitVolume' | 'binanceVolume' | 'premium';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const initialTickers: Ticker[] = coins.map(coin => ({
  ...coin,
  upbitPrice: 0,
  binancePrice: 0,
  upbitVolume: 0,
  binanceVolume: 0,
  premium: 0,
  change24h: 0,
  // logoUrl: ''
}));

interface PriceTableProps {
  onSelectCoin: (symbol: string) => void
}

// Add this after the imports
const ExchangeOption = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-center gap-2">
    {exchangeLogos[value as keyof typeof exchangeLogos] ? (
      <div className="relative w-5 h-5">
        <Image
          src={exchangeLogos[value as keyof typeof exchangeLogos]}
          alt={label}
          fill
          className="object-contain"
        />
      </div>
    ) : (
      <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
    )}
    <span>{label}</span>
  </div>
)

export function PriceTable({ onSelectCoin }: PriceTableProps) {
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers)
  const [exchangeRate, setExchangeRate] = useState<number>(1470)
  const [searchQuery, setSearchQuery] = useState('')
  const [baseExchange, setBaseExchange] = useState('upbit')
  const [compareExchange, setCompareExchange] = useState('binance')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'upbitPrice', direction: 'desc' })
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [currentPage, setCurrentPage] = useState(1)
  const coinsPerPage = 10
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tableSettings, setTableSettings] = useState<TableSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('tableSettings')
      return savedSettings ? JSON.parse(savedSettings) : {
        showCoin: true,
        showUpbitPrice: true,
        showBinancePrice: true,
        showPremium: true,
        showChange24h: true,
        showUpbitVolume: true,
        showBinanceVolume: true,
        priceDisplay: 'BOTH'
      }
    }
    return {
      showCoin: true,
      showUpbitPrice: true,
      showBinancePrice: true,
      showPremium: true,
      showChange24h: true,
      showUpbitVolume: true,
      showBinanceVolume: true,
      priceDisplay: 'BOTH'
    }
  })
  const { checkNotifications } = useNotificationContext();

  useEffect(() => {
    const unsubscribeUpbit = createUpbitWebSocket((data) => {
      setTickers(prevTickers => {
        const updatedTickers = prevTickers.map(ticker => {
          if (ticker.symbol === data.code.replace('KRW-', '')) {
            const upbitPrice = data.trade_price
            return {
              ...ticker,
              upbitPrice,
              upbitVolume: data.acc_trade_volume_24h,
              change24h: data.signed_change_rate * 100,
              premium: calculatePremium(upbitPrice, ticker.binancePrice, exchangeRate)
            }
          }
          return ticker
        })
        return updatedTickers;
      })
    })

    const unsubscribeBinance = createBinanceWebSocket((data) => {
      setTickers(prevTickers => {
        const updatedTickers = prevTickers.map(ticker => {
          if (ticker.symbol === data.s.replace('USDT', '')) {
            const binancePrice = parseFloat(data.c)
            return {
              ...ticker,
              binancePrice,
              binanceVolume: parseFloat(data.v),
              premium: calculatePremium(ticker.upbitPrice, binancePrice, exchangeRate)
            }
          }
          return ticker
        })
        return updatedTickers;
      })
    })

    return () => {
      unsubscribeUpbit()
      unsubscribeBinance()
    }
  }, [exchangeRate])

  const calculatePremium = (upbitPrice: number, binancePrice: number, rate: number) => {
    if (binancePrice === 0 || rate === 0 || upbitPrice === 0) return 0;
    return ((upbitPrice / (binancePrice * rate)) - 1) * 100;
  }

  const getInitialConsonant = (str: string) => {
    const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    return str.split('').map(char => {
      const code = char.charCodeAt(0) - 44032;
      if (code > -1 && code < 11172) return consonants[Math.floor(code / 588)];
      return char;
    }).join('');
  };

  const filteredTickers = tickers.filter(ticker => 
    ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticker.koreanName.includes(searchQuery) ||
    ticker.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getInitialConsonant(ticker.koreanName).includes(getInitialConsonant(searchQuery))
  );

  const sortedTickers = [...filteredTickers].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.symbol);
    const bIsFavorite = favorites.includes(b.symbol);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    if (aIsFavorite && bIsFavorite) {
      return favorites.indexOf(a.symbol) - favorites.indexOf(b.symbol);
    }
    
    const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
    
    if (sortConfig.field === 'binancePrice' || sortConfig.field === 'premium') {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      if (aValue === 0 && bValue === 0) return 0;
      if (aValue === 0) return 1;
      if (bValue === 0) return -1;
    }
    
    return ((a[sortConfig.field] || 0) - (b[sortConfig.field] || 0)) * multiplier;
  });

  const formatVolume = (volume: number, price: number) => {
    const volumeInKRW = volume * price / 100000000; 
    if (volumeInKRW >= 1000) {
      return `${(volumeInKRW / 1000).toFixed(1)}조`;
    } else if (volumeInKRW >= 1) {
      return `${volumeInKRW.toFixed(1)}억`;
    } else {
      return `${(volumeInKRW * 100).toFixed(1)}백만`;
    }
  }

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'desc' ? 
      <ArrowDown className="h-4 w-4" /> : 
      <ArrowUp className="h-4 w-4" />
  }


  useEffect(() => {
    const fetchCoinInfo = async () => {
      const upbitMarkets = await getUpbitMarkets();
      const upbitTickers = await getUpbitTickers(upbitMarkets.map(market => market.market));

      setTickers(prevTickers => 
        prevTickers.map(ticker => {
          const upbitInfo = upbitMarkets.find(market => market.market === `KRW-${ticker.symbol}`);
          const upbitTickerInfo = upbitTickers.find(t => t.market === `KRW-${ticker.symbol}`);
          
          if (upbitInfo && upbitTickerInfo) {
            return {
              ...ticker,
              koreanName: upbitInfo.korean_name,
              englishName: upbitInfo.english_name,
              // logoUrl: `https://static.upbit.com/logos/${ticker.symbol}.png`,
              upbitPrice: upbitTickerInfo.trade_price,
              upbitVolume: upbitTickerInfo.acc_trade_price_24h,
              change24h: upbitTickerInfo.signed_change_rate * 100,
            };
          }
          return ticker;
        })
      );
    };

    fetchCoinInfo();
  }, []);

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  const indexOfLastCoin = currentPage * coinsPerPage
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage
  const currentCoins = sortedTickers.slice(indexOfFirstCoin, indexOfLastCoin)

  const totalPages = Math.ceil(sortedTickers.length / coinsPerPage)

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSettingsChange = (newSettings: TableSettings) => {
    setTableSettings(newSettings)
    localStorage.setItem('tableSettings', JSON.stringify(newSettings))
  }

  useEffect(() => {
    const checkNotificationsForPrices = () => {
      const currentPrices = tickers.map(ticker => ({
        symbol: ticker.symbol,
        upbitPrice: ticker.upbitPrice,
        binancePrice: ticker.binancePrice,
        premium: ticker.premium
      }));
      checkNotifications(currentPrices);
    };

    // Call checkNotifications after the component has rendered
    const timeoutId = setTimeout(checkNotificationsForPrices, 0);

    return () => clearTimeout(timeoutId);
  }, [tickers, checkNotifications]);


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-row items-center gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">기준 거래소</span>
            <Select value={baseExchange} onValueChange={setBaseExchange}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-8 md:h-10 text-xs md:text-sm">
                <SelectValue>
                  {baseExchange && (
                    <ExchangeOption
                      value={baseExchange}
                      label={koreanExchanges.find(e => e.value === baseExchange)?.label || ''}
                    />
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {koreanExchanges.map((exchange) => (
                  <SelectItem key={exchange.value} value={exchange.value}>
                    <ExchangeOption value={exchange.value} label={exchange.label} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">해외 거래소</span>
            <Select value={compareExchange} onValueChange={setCompareExchange}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-8 md:h-10 text-xs md:text-sm">
                <SelectValue>
                  {compareExchange && (
                    <ExchangeOption
                      value={compareExchange}
                      label={foreignExchanges.find(e => e.value === compareExchange)?.label || ''}
                    />
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {foreignExchanges.map((exchange) => (
                  <SelectItem key={exchange.value} value={exchange.value}>
                    <ExchangeOption value={exchange.value} label={exchange.label} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[10px] md:text-xs text-gray-500 break-keep">*이외 거래소 추후 업데이트 예정</span>
          </div>
        </div>
        <div className="flex items-center justify-end w-full gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <div className="relative flex-grow md:max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="티커, 한글/영문 이름, 초성으로 검색"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 pr-4 w-full"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {tableSettings.showCoin && (
                <TableHead className="w-[120px] px-1 md:px-2 py-1 md:py-2 text-[10px] md:text-xs text-center">코인</TableHead>
              )}
              {tableSettings.showUpbitPrice && (
                <TableHead className="w-[120px] px-1 md:px-2 text-[10px] md:text-xs">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('upbitPrice')}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs"
                  >
                    업비트 가격
                    <SortIcon field="upbitPrice" />
                  </Button>
                </TableHead>
              )}
              {tableSettings.showBinancePrice && (
                <TableHead className="w-[120px] px-1 md:px-2 text-[10px] md:text-xs">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('binancePrice')}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs"
                  >
                    바이낸스 가격
                    <SortIcon field="binancePrice" />
                  </Button>
                </TableHead>
              )}
              {tableSettings.showPremium && (
                <TableHead className="w-[70px] px-1 md:px-2 text-[10px] md:text-xs">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('premium')}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs"
                  >
                    김프 (%)
                    <SortIcon field="premium" />
                  </Button>
                </TableHead>
              )}
              {tableSettings.showChange24h && (
                <TableHead className="w-[70px] px-1 md:px-2 text-[10px] md:text-xs">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('change24h')}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs"
                  >
                    변동률 (24h)
                    <SortIcon field="change24h" />
                  </Button>
                </TableHead>
              )}
              {tableSettings.showUpbitVolume && (
                <TableHead className="w-[100px] px-1 md:px-2 text-[10px] md:text-xs">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('upbitVolume')}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs"
                  >
                    업비트 거래대금
                    <SortIcon field="upbitVolume" />
                  </Button>
                </TableHead>
              )}
              {tableSettings.showBinanceVolume && (
                <TableHead className="w-[100px] px-1 md:px-2 text-[10px] md:text-xs">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('binanceVolume')}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs"
                  >
                    바이낸스 거래대금
                    <SortIcon field="binanceVolume" />
                  </Button>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCoins.map((ticker) => (
              <TableRow 
                key={ticker.symbol} 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 h-14 transition-colors duration-150"
                onClick={() => onSelectCoin(ticker.symbol)}
              >
                {tableSettings.showCoin && (
                  <TableCell className="font-medium text-left align-middle h-14 overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(ticker.symbol);
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${favorites.includes(ticker.symbol) ? 'fill-yellow-400' : 'fill-gray-300'}`}
                        />
                      </Button>
                      <div className="relative w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                        <div className="w-full h-full relative rounded-full overflow-hidden bg-white">
                          <Image
                            src={`https://static.upbit.com/logos/${ticker.symbol}.png`}
                            alt={ticker.symbol}
                            fill
                            className="object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">
                                  ${ticker.symbol.charAt(0)}
                                </div>
                              `;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs font-medium">{ticker.koreanName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{ticker.symbol}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{ticker.englishName}</div>
                      </div>
                    </div>
                  </TableCell>
                )}
                {tableSettings.showUpbitPrice && (
                  <TableCell className="text-center align-middle px-1 md:px-2 w-[120px] h-14 overflow-hidden">
                    <div className="flex flex-col justify-center h-full space-y-1">
                      {(tableSettings.priceDisplay === 'KRW' || tableSettings.priceDisplay === 'BOTH') && (
                        <div className="text-xs md:text-sm truncate">₩{ticker.upbitPrice.toLocaleString()}</div>
                      )}
                      {(tableSettings.priceDisplay === 'USD' || tableSettings.priceDisplay === 'BOTH') && (
                        <div className="text-xs md:text-sm truncate">${(ticker.upbitPrice / exchangeRate).toFixed(2)}</div>
                      )}
                    </div>
                  </TableCell>
                )}
                {tableSettings.showBinancePrice && (
                  <TableCell className="text-center align-middle px-1 md:px-2 w-[120px] h-14 overflow-hidden">
                    <div className="flex flex-col justify-center h-full space-y-1">
                      {(tableSettings.priceDisplay === 'KRW' || tableSettings.priceDisplay === 'BOTH') && (
                        <div className="text-xs md:text-sm truncate">
                          {ticker.binancePrice ? `₩${(ticker.binancePrice * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}` : '-'}
                        </div>
                      )}
                      {(tableSettings.priceDisplay === 'USD' || tableSettings.priceDisplay === 'BOTH') && (
                        <div className="text-xs md:text-sm truncate">
                          {ticker.binancePrice ? `$${ticker.binancePrice.toFixed(2)}` : '-'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                )}
                {tableSettings.showPremium && (
                  <TableCell className={`text-center align-middle px-1 md:px-2 w-[70px] h-14 overflow-hidden ${ticker.premium > 0 ? 'text-green-600' : ticker.premium < 0 ? 'text-red-600' : ''}`}>
                    <div className="text-xs md:text-sm truncate">
                      {ticker.binancePrice && ticker.upbitPrice ? `${ticker.premium.toFixed(2)}%` : '-'}
                    </div>
                  </TableCell>
                )}
                {tableSettings.showChange24h && (
                  <TableCell className={`text-center align-middle px-1 md:px-2 w-[70px] h-14 overflow-hidden ${ticker.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex justify-center items-center gap-0.5 md:gap-1">
                      {ticker.change24h >= 0 ? 
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" /> : 
                        <TrendingDown className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      }
                      <span className="text-xs md:text-sm truncate">{ticker.change24h.toFixed(2)}%</span>
                    </div>
                  </TableCell>
                )}
                {tableSettings.showUpbitVolume && (
                  <TableCell className="text-center align-middle px-1 md:px-2 w-[100px] h-14 overflow-hidden">
                    <div className="text-xs md:text-sm truncate">{formatVolume(ticker.upbitVolume, ticker.upbitPrice)}</div>
                  </TableCell>
                )}
                {tableSettings.showBinanceVolume && (
                  <TableCell className="text-center align-middle px-1 md:px-2 w-[100px] h-14 overflow-hidden">
                    <div className="text-xs md:text-sm truncate">{formatVolume(ticker.binanceVolume, ticker.binancePrice * exchangeRate)}</div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm mx-4">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={tableSettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}

