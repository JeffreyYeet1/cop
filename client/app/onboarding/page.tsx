'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingScreen from '../components/OnboardingScreen';
import AppShell from '../components/AppShell';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    // Check authentication on the client side
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show loading state or nothing while checking authentication
  if (isLoading) {
    return (
      <AppShell>
        <div className="h-screen w-full flex items-center justify-center">
          {/* Optional loading spinner */}
        </div>
      </AppShell>
    );
  }

  // Only render content if authenticated
  if (!isAuthenticated) {
    return null; // Return nothing while redirecting
  }

  // User is authenticated, show onboarding
  return (
    <AppShell>
      <div className="h-screen w-full">
        <OnboardingScreen />
      </div>
    </AppShell>
  );
}