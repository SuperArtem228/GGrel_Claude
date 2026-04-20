import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistrar } from "@/components/pwa-installer";
import "./globals.css";

export const metadata: Metadata = {
  title: "BondGame — игра для двоих",
  description: "Мягкая кооперативная игра для пары: задачи, челленджи, награды и приватный режим.",
  applicationName: "BondGame",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BondGame",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F4F2EC" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-[100dvh] bg-bg text-ink antialiased">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
