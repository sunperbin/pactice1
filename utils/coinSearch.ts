import { coins, Coin } from '@/data/coins'

export function searchCoins(query: string): Coin[] {
  const lowercaseQuery = query.toLowerCase();
  
  const getInitialConsonant = (str: string) => {
    const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    return str.split('').map(char => {
      const code = char.charCodeAt(0) - 44032;
      if (code > -1 && code < 11172) return consonants[Math.floor(code / 588)];
      return char;
    }).join('');
  };

  return coins.filter(coin => 
    coin.symbol.toLowerCase().includes(lowercaseQuery) ||
    coin.koreanName.includes(query) ||
    coin.englishName.toLowerCase().includes(lowercaseQuery) ||
    getInitialConsonant(coin.koreanName).includes(getInitialConsonant(query))
  );
}

