'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingScreen from '../components/OnboardingScreen';
import AppShell from '../components/AppShell';

export default function OnboardingPage() {
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <AppShell>
      <div className="h-screen w-full">
        <OnboardingScreen />
      </div>
    </AppShell>
  );
}