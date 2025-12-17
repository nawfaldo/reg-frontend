import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { PanelLeft, Search, LayoutDashboard, User, ChevronDown, Building2 } from "lucide-react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (isCollapsed) {
      setIsDropdownOpen(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Check if current route is /client/$companyName/*
  const isCompanyRoute = location.pathname.match(/^\/client\/company\/[^/]+\//);
  const companyNameMatch = location.pathname.match(/^\/client\/company\/([^/]+)\//);
  const companyName = companyNameMatch?.[1];

  return (
    <div className="flex h-screen bg-white">
      <aside
        className={`${isCollapsed ? "w-16" : "w-64"} bg-gray-50 border-r border-gray-200 flex flex-col`}
      >
        <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 font-semibold text-lg hover:opacity-80"
              >
                Netherium
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link
                    to="/client/companies"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                  >
                    <Building2 className="w-4 h-4" />
                    Companies
                  </Link>
                  <Link
                    to="/client/profile"
                    search={{
                      success: undefined,
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-lg"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-200 rounded"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className={`${isCollapsed ? "px-2" : "px-3"} pb-2`}>
          {isCollapsed ? (
            <button
              className="w-full flex items-center justify-center py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-12 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none placeholder:text-gray-500"
              />
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-500" />
              <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gradient-to-b from-white to-gray-100 border border-gray-300 rounded shadow-[0_2px_0_0_#d1d5db,0_3px_3px_-1px_rgba(0,0,0,0.1)]">
                ⌘ K
              </kbd>
            </div>
          )}
        </div>

        <nav className={`flex-1 ${isCollapsed ? "px-2" : "px-3"} py-1`}>
          <ul className="space-y-1">
            {isCompanyRoute && companyName && (
              <li>
                <Link
                  to="/client/company/$companyName/dashboard"
                  params={{ companyName }}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3 px-3"
                  } py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md`}
                  activeProps={{
                    className: `flex items-center ${
                      isCollapsed ? "justify-center" : "gap-3 px-3"
                    } py-2 text-sm font-bold text-gray-900`,
                  }}
                  title={isCollapsed ? "Dashboard" : ""}
                >
                  <LayoutDashboard className="w-5 h-5 shrink-0" />
                  {!isCollapsed && "Dashboard"}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
