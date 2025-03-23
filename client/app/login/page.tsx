'use client';

import { useRouter } from 'next/navigation';
import AppShell from '../components/AppShell';
import { LoginForm } from '../components/login-form';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Log in</h1>
          <LoginForm />
        </div>
      </div>
    </AppShell>
  );
}