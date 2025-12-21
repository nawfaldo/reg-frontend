import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil } from 'lucide-react'
import AdminHeader from '../../../../../../components/headers/AdminHeader'
import { usePermissions } from '../../../../../../hooks/usePermissions'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import Skeleton from '../../../../../../components/Skeleton'

export const Route = createFileRoute(
  '/client/company/$companyName/admin/role/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/admin/role/' })
  const { hasPermission } = usePermissions(companyName)

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  const { data: rolesData, isLoading: isLoadingRoles, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.roles(companyData.company.id) : ['company', companyData?.company?.id, 'roles'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).roles.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  const roles = rolesData?.roles || [];
  const isLoading = isLoadingCompany || isLoadingRoles;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('admin:role:view')) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat daftar peran</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 h-full bg-white">
      <AdminHeader isLoading={isLoading} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-[250px]" />
            <col className="w-[100px]" />
            <col className="w-auto" />
          </colgroup>
          
          <thead>
            <tr className="border border-gray-200 bg-gray-100">
              <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama</th>
              <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              // Show 3 skeleton rows while loading
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <Skeleton width={120} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Skeleton width={16} height={16} circle />
                      <Skeleton width={16} height={16} circle />
                    </div>
                  </td>
                  <td className="py-3"></td>
                </tr>
              ))
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 px-2 text-center text-gray-500">
                  Tidak ada peran
                </td>
              </tr>
            ) : (
              roles.map((role: any) => (
                <tr key={role.id} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <span className="text-sm text-black capitalize">{role.name}</span>
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      {hasPermission('admin:role:view') && (
                        <Link
                          to="/client/company/$companyName/admin/role/$roleId"
                          params={{ companyName, roleId: role.id }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Link>
                      )}
                      {hasPermission('admin:role:update') && (
                        <Link
                          to="/client/company/$companyName/admin/role/$roleId/edit"
                          params={{ companyName, roleId: role.id }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-black" />
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="py-3"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
