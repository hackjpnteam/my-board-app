import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ThemeRegistry from '@/components/ThemeRegistry';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "掲示板アプリ | マイボード",
  description: "シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。Next.jsとMaterial-UIで構築されたモダンなWebアプリ。",
  keywords: "掲示板, ボード, 投稿, Next.js, React, Material-UI, Webアプリ",
  authors: [{ name: "Hikaru" }],
  creator: "Hikaru",
  publisher: "Hikaru",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://board.huntercity.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "掲示板アプリ | マイボード",
    description: "シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。",
    url: 'https://board.huntercity.org',
    siteName: 'マイボード',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "掲示板アプリ | マイボード",
    description: "シンプルで使いやすい掲示板アプリケーション。",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "掲示板アプリ | マイボード",
    "description": "シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。",
    "url": "https://board.huntercity.org",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "Hikaru"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased`}
      >
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
