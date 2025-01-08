import Link from 'next/link'
import Image from 'next/image'
import { QrCode } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              Kimchi Premium, All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <nav className="text-sm text-muted-foreground">
              <a href="https://t.me/kimchi_premium" target="_blank" rel="noopener noreferrer">
                광고 및 문의 : https://t.me/kimchi_premium
              </a>
            </nav>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oaLBN9WNMGD0hK2vyzxmvDGI4gHQpy.png"
                  alt="Telegram QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </footer>
  )
}

