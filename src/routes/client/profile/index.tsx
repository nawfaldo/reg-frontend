import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "../../../lib/auth-client";
import { server } from "../../../lib/api";
import { queryKeys } from "../../../lib/query-keys";

export const Route = createFileRoute('/client/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: userData, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data, error } = await server.api.me.get();
      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!userData?.user) return <div className="p-4">User not found</div>;

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Profil</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
          >
            Keluar
          </button>
          <Link
            to="/client/profile/edit"
            className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all text-center block"
          >
            Ubah
          </Link>
        </div>
      </div>
      
      <div className="flex items-start gap-4">
        {userData.user.image ? (
          <img
            src={userData.user.image}
            alt="Profile"
            className="w-[100px] h-[100px] rounded-[25px]"
          />
        ) : (
          <div className="w-24 h-24 rounded-[25px] bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
            {userData.user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-black mb-1">{userData.user.name}</h2>
          <p className="text-sm text-black">{userData.user.email}</p>
        </div>
      </div>
    </div>
  );
}