import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      alert("Invalid or missing token");
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setIsLoading(false);

    if (error) {
      alert(error.message);
    } else {
      navigate({ to: "/login" });
    }
  };

  // Styles matched exactly to signin.tsx
  const inputClasses =
    "w-full p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-black transition-colors placeholder:text-gray-400 text-black text-sm";

  const buttonClasses =
    "w-full bg-black text-white p-2 rounded-lg font-bold text-sm hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-70";

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Column (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 lg:p-8">
        <div className="w-full max-w-xs mx-auto space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="font-bold text-base mb-3 text-black">Netherium.</h3>
            <h1 className="text-2xl font-extrabold tracking-tight text-black">
              New Password
            </h1>
            <p className="text-gray-600 text-xs">
              Please enter your new password below.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
            />
            <button
              onClick={handleReset}
              disabled={isLoading}
              className={buttonClasses}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column (Placeholder) */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center p-8"></div>
    </div>
  );
}
