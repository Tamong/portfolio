import "@/styles/globals.css";

import { GeistMono } from "geist/font/mono";
import { type Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import Nav from "./components/nav";
import Footer from "./components/footer";

export const metadata: Metadata = {
  title: "Philip Wallis",
  description: "Learn more about Philip Wallis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      style={{ colorScheme: "light" }}
      className={`${GeistMono.className} light`}
    >
      <head>
        <title>Philip Wallis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learn more about Philip Wallis" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:image" content="http://pwallis.com/api/og" />
      </head>
      <body className="md:mt-8">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-4 text-white">
          <Nav />
          {children}
          <Footer />
        </main>
        <Analytics />
      </body>
    </html>
  );
}
