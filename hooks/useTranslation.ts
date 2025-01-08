import { useRouter } from 'next/router'
import ko from '@/locales/ko'
import en from '@/locales/en'

const translations = { ko, en }

export function useTranslation() {
  const router = useRouter()
  const { locale } = router
  const t = translations[locale as keyof typeof translations] || en

  return { t, locale }
}

