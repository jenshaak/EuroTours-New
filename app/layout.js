import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EuroTours - European Bus Tickets',
  description: 'Find and book bus tickets across Europe with the best prices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
