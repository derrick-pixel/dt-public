import type { Metadata } from "next";
import { Hahmlet, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/marketing/TopNav";
import { Footer } from "@/components/marketing/Footer";

const hahmlet = Hahmlet({
  variable: "--font-hahmlet",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elitezshelf.com"),
  title: {
    default: "ElitezShelf — Every shelf, every week, watched.",
    template: "%s · ElitezShelf",
  },
  description:
    "AI-powered share-on-shelf, on-shelf availability, and planogram compliance intelligence for FMCG suppliers in Singapore and Southeast Asia.",
  openGraph: {
    title: "ElitezShelf",
    description:
      "Turn the supermarkets we already cover into the world's most efficient retail intelligence network.",
    siteName: "ElitezShelf",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${hahmlet.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-bg text-text">
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
