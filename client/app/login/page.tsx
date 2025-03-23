"use client";

import { Metadata } from 'next';
import { LoginForm } from '../components/login-form';
import BaseNavBar from '../components/baseNavBar';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const token = localStorage.getItem('token');
  if (token) {
    router.push('/dashboard');
  }
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="w-full">
        <BaseNavBar />
      </nav>
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="w-full max-w-[400px] px-4 py-8">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-600">
              Log in to your Clash of Plans account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}