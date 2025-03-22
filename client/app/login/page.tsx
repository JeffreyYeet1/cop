'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import AppShell from '../components/AppShell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, just check if email and password are not empty
      if (email && password) {
        // Store token in localStorage
        localStorage.setItem('token', 'demo-token');
        
        // Redirect to onboarding
        router.push('/onboarding');
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Log in</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                className="text-apple-blue font-medium"
                onClick={() => router.push('/signup')}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}