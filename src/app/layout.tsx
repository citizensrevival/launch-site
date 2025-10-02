import { type Metadata } from 'next'
import clsx from 'clsx'

import { Providers } from '@/app/providers'

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: 'Commit - Open-source Git client for macOS minimalists',
  description: 'Commit is a lightweight Git client you can open from anywhere any time you are ready to commit your work with a single keyboard shortcut. It is fast, beautiful, and completely unnecessary.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx('h-full antialiased')}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white dark:bg-gray-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
