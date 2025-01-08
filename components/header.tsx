'use client'

import { Gugi } from 'next/font/google'
import { Button } from "@/components/ui/button"
import { Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const gugiFont = Gugi({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export function Header() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState('KO')
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log('Current theme:', theme);
    console.log('Resolved theme:', resolvedTheme);
  }, [theme, resolvedTheme]);

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log('Toggling theme to:', newTheme);
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className={`text-2xl font-bold ${gugiFont.className} text-black dark:text-white`}>
              김치프리미엄
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem] text-white" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] text-black" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('KO')}>
                한국어 {language === 'KO' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('EN')}>
                English {language === 'EN' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

