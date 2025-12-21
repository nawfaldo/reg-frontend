import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Star, Home, User } from "lucide-react";
import { server } from "../lib/api";
import { queryKeys } from "../lib/query-keys";
import Skeleton from "../components/Skeleton";

export const Route = createFileRoute("/client")({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: ClientLayout,
});

function ClientLayout() {
  const { data: userData, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data, error } = await server.api.me.get();
      if (error) throw error;
      return data;
    },
  });

  const user = userData?.user;
  const userImage = user?.image;

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center">
        <Star className="m-3 w-6 h-6 text-gray-900" />
        <Link
          to="/client/companies"
          className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Companies"
        >
          <Home className="w-[22px] h-[22px]" />
        </Link>
        {isLoading ? (
          <div className="p-3">
            <Skeleton width={22} height={22} borderRadius={8} />
          </div>
        ) : (
          <Link
            to="/client/profile"
            search={{
              success: undefined,
            }}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Profile"
          >
            {userImage ? (
              <img
                src={userImage}
                alt={user?.name || "Profile"}
                className="w-[22px] h-[22px] rounded-lg"
              />
            ) : (
              <User className="w-[22px] h-[22px] text-gray-600" />
            )}
          </Link>
        )}
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
