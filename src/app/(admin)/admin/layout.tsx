import "@/styles/globals.css";

import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AdminNav } from "./nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <html lang="en" className={GeistMono.className} suppressHydrationWarning>
      <head>
        <title>Admin · Philip Wallis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <div className="flex min-h-screen">
              <aside className="bg-card/50 sticky top-0 flex h-screen w-52 shrink-0 flex-col border-r p-3">
                <Link href="/admin" className="mb-6 px-3 pt-2">
                  <span className="text-sm font-semibold tracking-tight">
                    pwallis / admin
                  </span>
                </Link>
                <AdminNav />
                <div className="mt-auto flex items-center gap-2 border-t px-3 pt-3 pb-1">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      width={64}
                      height={64}
                      alt={session.user.name ?? "User"}
                      className="h-7 w-7 rounded-full"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {session.user.name}
                    </p>
                    <Link
                      href="/api/auth/signout"
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              </aside>
              <main className="min-w-0 flex-1">
                <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
              </main>
            </div>
            <Toaster />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
