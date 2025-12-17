import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth-client";
import { Check } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export const Route = createFileRoute('/client/profile')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      success: search.success as string | undefined,
    };
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: "/client/profile" });
  
  const { data: userData, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await api.api.me.get();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (search.success === "true") {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [search.success]);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!userData?.user) return <div className="p-4">User not found</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      {search.success === "true" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800">
            Pembayaran berhasil! Langganan Anda sekarang aktif. 🎉
          </p>
        </div>
      )}
      
      {/* User Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          {userData.user.image ? (
            <img
              src={userData.user.image}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
              {userData.user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{userData.user.name}</h2>
            <p className="text-gray-600">{userData.user.email}</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}