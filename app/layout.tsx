import { Geist, Geist_Mono } from "next/font/google";
import { Providers, rootMetadata, rootViewport } from "@/app";
import "@/app/styles/globals.css";
import { Analytics, CookieBanner } from "@/features/cookie-consent";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-surface px-4 py-2 shadow-popover focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Перейти к содержимому
          </a>
          <SiteHeader />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
          <CookieBanner />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
