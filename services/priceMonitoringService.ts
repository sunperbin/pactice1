import { sendNotification } from '../utils/notificationManager';

interface PriceAlert {
  symbol: string;
  targetPrice: number;
  isAbove: boolean;
}

interface KimchiPremiumAlert {
  symbol: string;
  targetPremium: number;
  isAbove: boolean;
}

let priceAlerts: PriceAlert[] = [];
let kimchiPremiumAlerts: KimchiPremiumAlert[] = [];

export function addPriceAlert(alert: PriceAlert) {
  priceAlerts.push(alert);
}

export function addKimchiPremiumAlert(alert: KimchiPremiumAlert) {
  kimchiPremiumAlerts.push(alert);
}

export function removePriceAlert(symbol: string, targetPrice: number) {
  priceAlerts = priceAlerts.filter(
    alert => alert.symbol !== symbol || alert.targetPrice !== targetPrice
  );
}

export function removeKimchiPremiumAlert(symbol: string, targetPremium: number) {
  kimchiPremiumAlerts = kimchiPremiumAlerts.filter(
    alert => alert.symbol !== symbol || alert.targetPremium !== targetPremium
  );
}

export function checkPriceAlerts(symbol: string, currentPrice: number) {
  priceAlerts.forEach(alert => {
    if (alert.symbol === symbol) {
      if ((alert.isAbove && currentPrice >= alert.targetPrice) ||
          (!alert.isAbove && currentPrice <= alert.targetPrice)) {
        sendNotification(
          `Price Alert: ${symbol}`,
          { body: `${symbol} has reached ${currentPrice}` }
        );
        removePriceAlert(symbol, alert.targetPrice);
      }
    }
  });
}

export function checkKimchiPremiumAlerts(symbol: string, currentPremium: number) {
  kimchiPremiumAlerts.forEach(alert => {
    if (alert.symbol === symbol) {
      if ((alert.isAbove && currentPremium >= alert.targetPremium) ||
          (!alert.isAbove && currentPremium <= alert.targetPremium)) {
        sendNotification(
          `Kimchi Premium Alert: ${symbol}`,
          { body: `${symbol} kimchi premium has reached ${currentPremium.toFixed(2)}%` }
        );
        removeKimchiPremiumAlert(symbol, alert.targetPremium);
      }
    }
  });
}

