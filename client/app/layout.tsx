import React from 'react'
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "COP - Your Productivity Companion",
  description: "AI-powered productivity and task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col items-center bg-background">
        <div className="flex flex-col w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
