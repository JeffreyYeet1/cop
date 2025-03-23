import React from 'react';
import PekaCommandPalette from '../components/PekaCommandPalette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PekaCommandPalette />
    </>
  );
} 