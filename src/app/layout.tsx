import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from '@/components/ThemeRegistry'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '掲示板アプリ | マイボード',
  description: 'シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。Next.jsとMaterial-UIで構築されたモダンなWebアプリ。',
  authors: [{ name: 'Hikaru' }],
  keywords: ['掲示板', 'ボード', '投稿', 'Next.js', 'React', 'Material-UI', 'Webアプリ'],
  creator: 'Hikaru',
  publisher: 'Hikaru',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://board.huntercity.org',
  },
  openGraph: {
    title: '掲示板アプリ | マイボード',
    description: 'シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。',
    url: 'https://board.huntercity.org',
    siteName: 'マイボード',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '掲示板アプリ | マイボード',
    description: 'シンプルで使いやすい掲示板アプリケーション。',
  },
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'format-detection': 'telephone=no, address=no, email=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '掲示板アプリ | マイボード',
              description: 'シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。',
              url: 'https://board.huntercity.org',
              applicationCategory: 'SocialNetworkingApplication',
              operatingSystem: 'Web Browser',
              author: {
                '@type': 'Person',
                name: 'Hikaru',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'JPY',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
