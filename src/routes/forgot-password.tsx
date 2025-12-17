import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }
    setIsLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "http://localhost:5173/reset-password",
    });

    setIsLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  const inputClasses =
    "w-full p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-black transition-colors placeholder:text-gray-400 text-black text-sm";

  const buttonClasses =
    "w-full bg-black text-white p-2 rounded-lg font-bold text-sm hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-70";

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 lg:p-8">
        <div className="w-full max-w-xs mx-auto space-y-4">
          {!isSuccess ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base mb-3 text-black">
                  Netherium.
                </h3>
                <h1 className="text-2xl font-extrabold tracking-tight text-black">
                  Reset Password
                </h1>
                <p className="text-gray-600 text-xs">
                  Enter your email to receive a reset link.
                </p>
              </div>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                disabled={isLoading}
              />

              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className={buttonClasses}
              >
                {isLoading ? "Sending..." : "Send Link"}
              </button>

              <Link
                to="/login"
                className="block w-full text-center text-xs text-gray-500 hover:text-black hover:underline mt-4"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <div className="text-center space-y-4 animate-in zoom-in duration-300">
              <div className="bg-black text-white p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-black">
                  Check your email
                </h1>
                <p className="text-xs text-gray-600 mt-2">
                  We have sent a password reset link to <br />
                  <strong>{email}</strong>.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full text-center text-xs font-bold text-black hover:underline"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center p-8"></div>
    </div>
  );
}
