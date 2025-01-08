import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  coinData?: any
  marketData?: any
}

export default function SEO({ 
  title, 
  description, 
  image,
  coinData,
  marketData 
}: SEOProps) {
  const pathname = usePathname()
  const defaultTitle = '김치프리미엄 - 실시간 암호화폐 가격 비교'
  const defaultDescription = '한국과 글로벌 거래소의 실시간 암호화폐 가격을 비교하고 김치 프리미엄을 확인하세요.'
  const defaultImage = 'https://kimchipremium.com/og-image.png'
  const canonicalUrl = `https://kimchipremium.com${pathname}`

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: image || defaultImage,
    url: canonicalUrl,
  }

  function generateStructuredData() {
    if (coinData) {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": coinData.name,
        "description": `${coinData.name} (${coinData.symbol}) 실시간 가격 정보`,
        "image": coinData.image,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "KRW",
          "price": coinData.currentPrice,
          "availability": "https://schema.org/InStock"
        }
      }
    }

    if (marketData) {
      return {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "암호화폐 시장 데이터",
        "description": "실시간 암호화폐 시장 데이터 및 김치 프리미엄 정보",
        "keywords": ["암호화폐", "비트코인", "이더리움", "김치 프리미엄"],
        "url": "https://kimchipremium.com",
        "provider": {
          "@type": "Organization",
          "name": "김치프리미엄",
          "url": "https://kimchipremium.com"
        }
      }
    }

    return null
  }

  const structuredData = generateStructuredData()

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="김치프리미엄" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      <link rel="canonical" href={canonicalUrl} />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  )
}

