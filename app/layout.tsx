import React from 'react'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata = {
  title: 'COP - Your Productivity Companion',
  description: 'AI-powered productivity and task management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  )
} 