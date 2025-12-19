import { createFileRoute, Outlet, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, User, Settings, Building2, Loader2, MapPin } from 'lucide-react'
import { useState } from 'react'
import { usePermissions } from '../../../hooks/usePermissions'
import { server } from '../../../lib/api'
import { queryKeys } from '../../../lib/query-keys'

export const Route = createFileRoute('/client/company/$companyName')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName' })
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  const company = data?.company;
  const { hasPermission, hasAnyMemberPermission } = usePermissions(companyName);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#FAF9F6]">
        <div className="w-64 bg-[#FAF9F6] border-r border-gray-200 p-4 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex h-screen bg-[#FAF9F6]">
        <div className="w-64 bg-[#FAF9F6] border-r border-gray-200 p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">Error loading company</p>
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header with Avatar and Company Name */}
        <div className="px-4 pt-3 flex items-center gap-3">
          {company.image ? (
            <img
              src={company.image}
              alt={company.name}
              className="w-[22px] h-[22px] rounded-[7px] object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <h2 className="text-base font-semibold text-black flex-1">{company.name}</h2>
        </div>

        {/* Search Bar */}
        <div className="px-4 pt-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-9 pr-16 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1 font-medium text-black text-sm bg-white border border-gray-300 border-b-5 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
              >
                Go!
              </button>
            </div>
          </form>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-2 px-4 pt-4">
          <Link
            to="/client/company/$companyName/geo-tag"
            params={{ companyName: company.name }}
            className="flex items-center gap-3 text-sm text-black mb-5"
          >
            <MapPin className="w-[20px] h-[20px]" />
            <span>Lahan</span>
          </Link>
          {hasAnyMemberPermission() && (
            hasPermission('member:user:view') ? (
              <Link
                to="/client/company/$companyName/member/user"
                params={{ companyName: company.name }}
                className="flex items-center gap-3 text-sm text-black mb-5"
              >
                <User className="w-[20px] h-[20px]" />
                <span>Anggota</span>
              </Link>
            ) : hasPermission('member:role:view') ? (
              <Link
                to="/client/company/$companyName/member/role"
                params={{ companyName: company.name }}
                className="flex items-center gap-3 text-sm text-black mb-5"
              >
                <User className="w-[20px] h-[20px]" />
                <span>Anggota</span>
              </Link>
            ) : hasPermission('member:permission:view') ? (
              <Link
                to="/client/company/$companyName/member/permission"
                params={{ companyName: company.name }}
                className="flex items-center gap-3 text-sm text-black mb-5"
              >
                <User className="w-[20px] h-[20px]" />
                <span>Anggota</span>
              </Link>
            ) : null
          )}
          <Link
            to="/client/company/$companyName/setting"
            params={{ companyName: company.name }}
            className="flex items-center gap-3 text-sm text-black"
          >
            <Settings className="w-[20px] h-[20px]" />
            <span>Pengaturan</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
