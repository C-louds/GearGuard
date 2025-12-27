import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GearGuard - Maintenance Management System",
  description: "Track and manage equipment maintenance requests",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar activeTab="equipment" />
          {children}
          </SessionProvider>

      </body>
    </html>
  );
}