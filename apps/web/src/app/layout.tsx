import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Syne } from "next/font/google";
import { AppProviders } from "@/presentation/providers/app-providers";
import "./globals.css";

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "student-ai",
  description: "Base inicial do student-ai com Next.js 16, Bun, Prisma, Neon e Auth.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="pt-BR">
      <body className={displayFont.variable}>
        <AppProviders>
          {children}
          <Analytics />
        </AppProviders>
      </body>
    </html>
  );
}
