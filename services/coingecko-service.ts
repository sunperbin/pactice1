import axios from 'axios';
import { log, error } from '@/utils/logger';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = 'CG-sWcaFNALAdywDiRb9cYBrD2u';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryFetch(url: string, options: any, retries = 3, backoff = 300) {
  try {
    return await axios.get(url, options);
  } catch (err) {
    if (retries > 0) {
      await wait(backoff);
      return retryFetch(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

export async function getCoinInfo(coinIds: string[]) {
  try {
    const response = await retryFetch(`${COINGECKO_API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: coinIds.join(','),
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false,
        locale: 'en'
      },
      headers: {
        'x-cg-demo-api-key': API_KEY
      }
    });

    const foundCoins = response.data;
    const missingCoins = coinIds.filter(id => 
      !foundCoins.find(coin => coin.id === id)
    );

    if (missingCoins.length > 0) {
      const searchPromises = missingCoins.map(async (id) => {
        try {
          const searchResponse = await retryFetch(`${COINGECKO_API_URL}/search`, {
            params: { query: id },
            headers: {
              'x-cg-demo-api-key': API_KEY
            }
          });
          
          if (searchResponse.data.coins.length > 0) {
            const coinId = searchResponse.data.coins[0].id;
            const coinResponse = await retryFetch(`${COINGECKO_API_URL}/coins/${coinId}`, {
              params: { localization: false, tickers: false, community_data: false, developer_data: false },
              headers: {
                'x-cg-demo-api-key': API_KEY
              }
            });
            return {
              id: coinId,
              symbol: coinResponse.data.symbol.toUpperCase(),
              image: coinResponse.data.image.large
            };
          }
        } catch (error) {
          log(`Error searching for coin ${id}:`, error);
        }
        return null;
      });

      const additionalCoins = (await Promise.all(searchPromises)).filter(Boolean);
      return [...foundCoins, ...additionalCoins];
    }

    return foundCoins;
  } catch (error) {
    error('Error fetching coin info from CoinGecko:', error);
    return [];
  }
}

