import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/ui";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "../components/ui/toast-provider";
import { ThemeProvider } from "../components/ui/theme-provider";
import { MobileNav } from "../components/ui/mobile-nav";
import { Footer } from "../components/ui/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ErgoTask AI",
  description: "- by Mumin Bhat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(58,16,115,.15),transparent_60%)] pb-16 md:pb-0 transition-colors flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Toaster richColors />
              <MobileNav />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
