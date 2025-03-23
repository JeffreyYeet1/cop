"use client";

import { Button } from "./button";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface GoogleButtonProps {
  mode: "login" | "signup";
  className?: string;
}

export function GoogleButton({ mode, className = "" }: GoogleButtonProps) {
  const router = useRouter();

  const handleGoogleAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const scope = [
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar",        // Full access to calendars
      "https://www.googleapis.com/auth/calendar.events", // Full access to events
      "https://www.googleapis.com/auth/calendar.readonly" // Read-only access as fallback
    ].join(" ");
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    window.location.href = authUrl;
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogleAuth}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
    >
      <Image
        src="/google.svg"
        alt="Google logo"
        width={20}
        height={20}
      />
      {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
    </Button>
  );
} 