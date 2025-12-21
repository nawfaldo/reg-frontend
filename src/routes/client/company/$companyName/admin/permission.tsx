import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AdminHeader from '../../../../../components/headers/AdminHeader';
import { usePermissions } from '../../../../../hooks/usePermissions'
import { server } from '../../../../../lib/api'
import { queryKeys } from '../../../../../lib/query-keys'
import Skeleton from '../../../../../components/Skeleton'

export const Route = createFileRoute('/client/company/$companyName/admin/permission')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/admin/permission' })
  const { hasPermission } = usePermissions(companyName)
  
  const { data: permissionsData, isLoading, error } = useQuery({
    queryKey: queryKeys.company.permissions,
    queryFn: async () => {
      const { data, error } = await server.api.company.permissions.get();
      if (error) throw error;
      return data;
    },
  });

  const permissions = permissionsData?.permissions || [];

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('admin:permission:view')) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat daftar perizinan</p>
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
            <col className="w-auto" />
          </colgroup>
          
          <thead>
            <tr className="border border-gray-200 bg-gray-100">
              <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama</th>
              <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Deskripsi</th>
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
                    <Skeleton width={200} height={16} />
                  </td>
                </tr>
              ))
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-8 px-2 text-center text-gray-500">
                  Tidak ada perizinan
                </td>
              </tr>
            ) : (
              permissions.map((permission: any) => (
                <tr key={permission.id} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <span className="text-sm text-black">{permission.name}</span>
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <span className="text-sm text-black">{permission.desc || '-'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
