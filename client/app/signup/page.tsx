import { SignUpForm } from "../components/signup-form";
import { Metadata } from "next";
import BaseNavBar from "../components/baseNavBar";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="w-full">
        <BaseNavBar />
      </nav>
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="w-full max-w-[400px] px-4 py-8">
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
