"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      if (!code) {
        console.error("No code received from Google");
        router.push("/login?error=no_code");
        return;
      }

      try {
        console.log("Making request to backend with code");
        const response = await fetch("http://localhost:8000/api/auth/google", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/auth/callback/google`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Server error response:", errorData);
          throw new Error(errorData || "Failed to authenticate with Google");
        }

        const data = await response.json();
        console.log("Successfully authenticated with backend");
        localStorage.setItem("token", data.access_token);

        // Check if user has completed onboarding
        console.log("Checking onboarding status");
        const onboardingResponse = await fetch(
          "http://localhost:8000/api/onboarding/preferences",
          {
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${data.access_token}`,
              "Accept": "application/json",
            },
          }
        );

        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json();
          if (onboardingData.preferences?.length > 0) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error during Google authentication:", error);
        router.push("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
} 