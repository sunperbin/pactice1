import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { ScrollArea } from "@/components/ui/scroll-area"
import { subscribeUserToPush, requestNotificationPermission } from '../../utils/notificationManager'
import { Notification } from './NotificationManager'
import { searchCoins } from '../../utils/coinSearch'
import { Coin } from '@/data/coins'

interface AddNotificationProps {
  addNotification: (newNotification: Omit<Notification, 'id'>) => void;
}

export function AddNotification({ addNotification }: AddNotificationProps) {
  const [symbol, setSymbol] = useState('')
  const [alertType, setAlertType] = useState<'binancePrice' | 'upbitPrice' | 'kimchiPremium'>('binancePrice')
  const [targetValue, setTargetValue] = useState('')
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Coin[]>([])
  const [premiumSign, setPremiumSign] = useState<'+' | '-'>('+');

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error('Error checking subscription:', error)
        toast.error('알림 구독 상태를 확인하는 중 오류가 발생했습니다.')
      }
    }

    checkSubscription()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const results = searchCoins(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleAddAlert = () => {
    if (!symbol || !targetValue) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const value = alertType === 'kimchiPremium' 
        ? (premiumSign === '-' ? -parseFloat(targetValue) : parseFloat(targetValue))
        : parseFloat(targetValue);

      addNotification({
        type: alertType,
        symbol,
        condition,
        value
      });

      toast.success('알림이 성공적으로 추가되었습니다.');

      // Reset form
      setSymbol('');
      setTargetValue('');
      setSearchQuery('');
      setPremiumSign('+');
    } catch (error) {
      console.error('Error adding alert:', error);
      toast.error('알림 추가 중 오류가 발생했습니다.');
    }
  };

  const handleSubscribe = async () => {
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        const subscription = await subscribeUserToPush();
        if (subscription) {
          setIsSubscribed(true);
          toast.success('알림 구독이 완료되었습니다.');
        } else {
          throw new Error('Failed to subscribe the user');
        }
      } else {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error(`알림 구독 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3 pr-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">알림 추가</h3>
          <Button
            onClick={handleSubscribe}
            disabled={isSubscribed}
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            className={`ml-2 ${isSubscribed ? 'text-gray-500 cursor-not-allowed' : ''}`}
          >
            알림 권한 요청
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol">코인 심볼</Label>
          <div className="relative">
            <Input
              id="symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="코인 검색 (심볼, 이름, 초성)"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((coin) => (
                  <div
                    key={coin.symbol}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSymbol(coin.symbol)
                      setSearchQuery('')
                    }}
                  >
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{coin.koreanName} ({coin.englishName})</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {symbol && (
            <div className="text-sm text-blue-600 dark:text-blue-400">선택된 코인: {symbol}</div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="alertType">알림 유형</Label>
          <Select value={alertType} onValueChange={(value: 'binancePrice' | 'upbitPrice' | 'kimchiPremium') => setAlertType(value)}>
            <SelectTrigger id="alertType">
              <SelectValue placeholder="알림 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="binancePrice">바이낸스 가격</SelectItem>
              <SelectItem value="upbitPrice">업비트 가격</SelectItem>
              <SelectItem value="kimchiPremium">김치 프리미엄</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetValue">
            목표 {alertType === 'kimchiPremium' ? '프리미엄' : '가격'}
          </Label>
          <div className="relative flex items-center">
            {alertType === 'binancePrice' && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
            )}
            {alertType === 'upbitPrice' && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₩</span>
            )}
            {alertType === 'kimchiPremium' && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">%</span>
            )}
            <Input
              id="targetValue"
              type="number"
              value={targetValue}
              onChange={(e) => {
                if (alertType === 'kimchiPremium' && premiumSign === '-') {
                  const value = Math.abs(parseFloat(e.target.value || '0')) * -1;
                  setTargetValue(value.toString());
                } else {
                  setTargetValue(e.target.value);
                }
              }}
              placeholder={alertType === 'kimchiPremium' ? "프리미엄 값 입력" : "가격 값 입력"}
              className={`w-full ${alertType === 'kimchiPremium' ? 'pl-7 pr-16' : 'pl-7'}`}
            />
            {alertType === 'kimchiPremium' && (
              <Select
                value={premiumSign}
                onValueChange={(value: '+' | '-') => {
                  setPremiumSign(value);
                  if (targetValue) {
                    const numValue = parseFloat(targetValue);
                    if (value === '-' && numValue > 0) {
                      setTargetValue((-numValue).toString());
                    } else if (value === '+' && numValue < 0) {
                      setTargetValue(Math.abs(numValue).toString());
                    }
                  }
                }}
                className="absolute right-0 w-14"
              >
                <SelectTrigger className="h-9 w-14">
                  <SelectValue placeholder="+" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+">+</SelectItem>
                  <SelectItem value="-">-</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">조건</Label>
          <Select value={condition} onValueChange={(value: 'above' | 'below') => setCondition(value)}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="조건 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="above">이상</SelectItem>
              <SelectItem value="below">이하</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddAlert} className="mt-4">알림 추가</Button>
      </div>
    </ScrollArea>
  )
}

