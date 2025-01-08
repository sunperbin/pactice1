import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ErrorBoundary from '@/components/ErrorBoundary'
import "./globals.css"

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata = {
  metadataBase: new URL('https://kimchipremium.com'),
  title: {
    default: '김치프리미엄 - 실시간 암호화폐 가격 비교',
    template: '%s | 김치프리미엄'
  },
  description: '한국과 글로벌 거래소의 실시간 암호화폐 가격을 비교하고 김치 프리미엄을 확인하세요. BTC, ETH 등 주요 코인의 시세를 한눈에 파악할 수 있습니다.',
  keywords: ['김치프리미엄', '암호화폐', '비트코인', '이더리움', '업비트', '바이낸스', '코인 가격', '실시간 시세'],
  authors: [{ name: '김치프리미엄' }],
  creator: '김치프리미엄',
  publisher: '김치프리미엄',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: '김치프리미엄 - 실시간 암호화폐 가격 비교',
    description: '한국과 글로벌 거래소의 실시간 암호화폐 가격을 비교하고 김치 프리미엄을 확인하세요.',
    url: 'https://kimchipremium.com',
    siteName: '김치프리미엄',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '김치프리미엄 - 실시간 암호화폐 가격 비교',
    description: '한국과 글로벌 거래소의 실시간 암호화폐 가격을 비교하고 김치 프리미엄을 확인하세요.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://kimchipremium.com',
    languages: {
      'ko': 'https://kimchipremium.com',
      'en': 'https://kimchipremium.com/en',
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-4772054140165349'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="naver-site-verification" content="your-naver-verification-code" />
        <meta name="google-adsense-account" content="ca-pub-4772054140165349" />
        <link rel="canonical" href="https://kimchipremium.com" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

