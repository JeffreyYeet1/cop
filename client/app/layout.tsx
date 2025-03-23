import React from 'react'
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import "./globals.css";
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const geistSans = GeistSans;
const geistMono = GeistMono;
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "COP - Your Productivity Companion",
  description: "AI-powered productivity and task management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${inter.className}`}>
      <body className="antialiased min-h-screen flex flex-col items-center bg-background">
        <Providers>
          <div className="page-transition-wrapper">
            <div className="flex flex-col w-full">
              {children}
            </div>
          </div>
          <div id="modal-root" />
        </Providers>
      </body>
    </html>
  );
}
