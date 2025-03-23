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
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-violet-50 via-white to-violet-50">
      <nav className="w-full">
        <BaseNavBar />
      </nav>
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
          <div className="flex flex-col space-y-2 text-center mb-8">
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