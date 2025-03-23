"use client";

import { SignUpForm } from "../components/signup-form";
import { Metadata } from "next";
import BaseNavBar from "../components/baseNavBar";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const token = localStorage.getItem('token');
  if (token) {
    router.push('/dashboard');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-white to-sky-100">
      <nav className="w-full">
        <BaseNavBar />
      </nav>
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign Up</h1>
            <p className="text-sm text-gray-600">
              Create an account to get started
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
