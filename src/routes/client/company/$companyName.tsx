import { createFileRoute, Outlet, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { User, Settings, Building2, MapPin, Pickaxe, Bean, Tractor } from 'lucide-react'
import { usePermissions } from '../../../hooks/usePermissions'
import { server } from '../../../lib/api'
import { queryKeys } from '../../../lib/query-keys'
import Skeleton from '../../../components/Skeleton'

export const Route = createFileRoute('/client/company/$companyName')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName' })

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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#FAF9F6]">
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <nav className="flex-1 space-y-2 px-4 pt-3">
          <div className="flex items-center gap-3 mb-5">
                <Skeleton borderRadius={8} width={20} height={20} />
                <Skeleton width={80} height={16} />
          </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 mb-5">
                <Skeleton circle width={20} height={20} />
                <Skeleton width={80} height={16} />
              </div>
            ))}
          </nav>
        </aside>
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

        {/* Menu Items */}
        <nav className="flex-1 space-y-2 px-4 pt-6">
        <Link
            to="/client/company/$companyName/worker/group"
            params={{ companyName: company.name }}
            className="flex items-center gap-3 text-sm text-black mb-5"
          >
            <Pickaxe className="w-[17px] h-[17px]" />
            <span>Pekerja</span>
          </Link>
          <Link
            to="/client/company/$companyName/geo-tag"
            params={{ companyName: company.name }}
            className="flex items-center gap-3 text-sm text-black mb-5"
          >
            <MapPin className="w-[20px] h-[20px]" />
            <span>Lahan</span>
          </Link>
          <Link
            to="/client/company/$companyName/batch"
            params={{ companyName: company.name }}
            className="flex items-center gap-3 text-sm text-black mb-5"
          >
            <Tractor className="w-[20px] h-[20px]" />
            <span>Produksi</span>
          </Link>
          <Link
            to="/client/company/$companyName/commodity"
            params={{ companyName: company.name }}
            className="flex items-center gap-3 text-sm text-black mb-5"
          >
            <Bean className="w-[18px] h-[18px]" />
            <span>Komoditas</span>
          </Link>

          {hasAnyMemberPermission() && (
            hasPermission('admin:user:view') ? (
              <Link
                to="/client/company/$companyName/admin/user"
                params={{ companyName: company.name }}
                className="flex items-center gap-3 text-sm text-black mb-5"
              >
                <User className="w-[20px] h-[20px]" />
                <span>Admin</span>
              </Link>
            ) : hasPermission('admin:role:view') ? (
              <Link
                to="/client/company/$companyName/admin/role"
                params={{ companyName: company.name }}
                className="flex items-center gap-3 text-sm text-black mb-5"
              >
                <User className="w-[20px] h-[20px]" />
                <span>Admin</span>
              </Link>
            ) : hasPermission('admin:permission:view') ? (
              <Link
                to="/client/company/$companyName/admin/permission"
                params={{ companyName: company.name }}
                className="flex items-center gap-3 text-sm text-black mb-5"
              >
                <User className="w-[20px] h-[20px]" />
                <span>Admin</span>
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
