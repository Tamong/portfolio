import "@/styles/globals.css";

import { GeistMono } from "geist/font/mono";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "next-themes";
import { TRPCReactProvider } from "@/trpc/react";
import { PostHogProvider } from "./providers";

import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { metaData } from "@/config";
import ParticleEmitterWrapper from "@/components/effects/particle-emitter-wrapper";

export const experimental_ppr = true;

export const metadata: Metadata = {
  metadataBase: new URL(metaData.baseUrl),
  title: {
    default: metaData.title,
    template: `%s | ${metaData.title}`,
  },
  description: metaData.description,
  openGraph: {
    images: metaData.ogImage,
    title: metaData.title,
    description: metaData.description,
    url: metaData.baseUrl,
    siteName: metaData.name,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: metaData.name,
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistMono.className} suppressHydrationWarning>
      <head>
        <title>Philip Wallis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-background">
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ParticleEmitterWrapper />
            <div className="mx-auto mt-8 flex min-h-[97dvh] max-w-3xl flex-col px-4">
              <Nav />
              <main className="mb-auto">
                <TRPCReactProvider>{children}</TRPCReactProvider>
              </main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
