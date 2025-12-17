// src/routes/verify-email.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
  // Validate that the token exists in the URL
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    return {
      token: search.token as string | undefined,
    };
  },
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  // Initialize status based on whether token exists
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );

  useEffect(() => {
    // Only proceed if token exists
    if (!token) {
      return;
    }

    authClient
      .verifyEmail({
        query: {
          token: token,
        },
      })
      .then((res) => {
        if (res.error) {
          setStatus("error");
        } else {
          setStatus("success");
          setTimeout(() => {
            navigate({ to: "/" });
          }, 3000);
        }
      })
      .catch(() => setStatus("error"));
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 border rounded-lg shadow-sm max-w-sm w-full text-center">
        {status === "verifying" && (
          <>
            <h1 className="text-xl font-bold mb-2">Verifying...</h1>
            <p className="text-gray-500">
              Please wait while we verify your email.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-xl font-bold mb-2 text-green-600">Verified!</h1>
            <p className="text-gray-500">
              Your email has been successfully verified.
            </p>
            <p className="text-sm mt-4">Redirecting you to the dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold mb-2 text-red-600">
              Verification Failed
            </h1>
            <p className="text-gray-500">The link may be invalid or expired.</p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-4 px-4 py-2 bg-black text-white rounded"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
