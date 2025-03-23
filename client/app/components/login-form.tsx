"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui2/button";
import { Input } from "./ui2/input";
import { Card, CardContent, CardFooter } from "./ui2/card";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const formDataToSend = new URLSearchParams();
        formDataToSend.append('username', formData.email.toLowerCase()); // Send lowercase email as username
        formDataToSend.append('password', formData.password);
        formDataToSend.append('scope', 'me items'); // Add required scopes
        
        console.log('Sending request with data:', {
          email: formData.email.toLowerCase(),
          password: '[REDACTED]'
        });
        
        const response = await fetch('http://localhost:8000/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: formDataToSend,
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          if (data.detail === "Incorrect email or password") {
            throw new Error("Invalid email or password. Please try again.");
          } else {
            throw new Error(data.detail || 'Failed to login');
          }
        }

        // Store the actual token from the server
        localStorage.setItem('token', data.access_token);
        console.log('Token stored in localStorage');
        
        // Check if user has completed onboarding
        const onboardingResponse = await fetch('http://localhost:8000/api/onboarding/preferences', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });
        
        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json();
          
          // If user has existing preferences, redirect directly to dashboard
          if (onboardingData.preferences && onboardingData.preferences.length > 0) {
            router.push('/dashboard');
          } else {
            // Otherwise, redirect to onboarding
            router.push('/onboarding');
          }
        } else {
          // If there's an error checking onboarding status, default to onboarding page
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error instanceof Error ? error.message : 'Failed to login');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-xs text-gray-400 mt-2">© {new Date().getFullYear()} Clash of Plans</p>
      </CardFooter>
    </Card>
  );
}
