import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: TableSettings
  onSettingsChange: (newSettings: TableSettings) => void
}

export interface TableSettings {
  showCoin: boolean
  showUpbitPrice: boolean
  showBinancePrice: boolean
  showPremium: boolean
  showChange24h: boolean
  showUpbitVolume: boolean
  showBinanceVolume: boolean
  priceDisplay: 'KRW' | 'USD' | 'BOTH'
}

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<TableSettings>(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleToggle = (key: keyof TableSettings) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] }
      onSettingsChange(newSettings)
      return newSettings
    })
  }

  const handlePriceDisplayChange = (value: 'KRW' | 'USD' | 'BOTH') => {
    setLocalSettings(prev => {
      const newSettings = { ...prev, priceDisplay: value }
      onSettingsChange(newSettings)
      return newSettings
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>테이블 설정</DialogTitle>
          <DialogDescription>
            표시할 정보를 선택하세요
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-coin">코인</Label>
            <Switch
              id="show-coin"
              checked={localSettings.showCoin}
              onCheckedChange={() => handleToggle('showCoin')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-upbit-price">업비트 가격</Label>
            <Switch
              id="show-upbit-price"
              checked={localSettings.showUpbitPrice}
              onCheckedChange={() => handleToggle('showUpbitPrice')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-binance-price">바이낸스 가격</Label>
            <Switch
              id="show-binance-price"
              checked={localSettings.showBinancePrice}
              onCheckedChange={() => handleToggle('showBinancePrice')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-premium">김프</Label>
            <Switch
              id="show-premium"
              checked={localSettings.showPremium}
              onCheckedChange={() => handleToggle('showPremium')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-change24h">변동률</Label>
            <Switch
              id="show-change24h"
              checked={localSettings.showChange24h}
              onCheckedChange={() => handleToggle('showChange24h')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-upbit-volume">업비트 거래대금</Label>
            <Switch
              id="show-upbit-volume"
              checked={localSettings.showUpbitVolume}
              onCheckedChange={() => handleToggle('showUpbitVolume')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-binance-volume">바이낸스 거래대금</Label>
            <Switch
              id="show-binance-volume"
              checked={localSettings.showBinanceVolume}
              onCheckedChange={() => handleToggle('showBinanceVolume')}
            />
          </div>
          <div className="space-y-2">
            <Label>가격 표시</Label>
            <RadioGroup
              value={localSettings.priceDisplay}
              onValueChange={(value: 'KRW' | 'USD' | 'BOTH') => handlePriceDisplayChange(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="KRW" id="krw" />
                <Label htmlFor="krw">원화만</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="usd" />
                <Label htmlFor="usd">달러만</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BOTH" id="both" />
                <Label htmlFor="both">모두 표시</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

