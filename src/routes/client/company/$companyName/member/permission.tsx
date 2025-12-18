import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import MemberHeader from '../../../../../component/headers/MemberHeader';
import { usePermissions } from '../../../../../hooks/usePermissions'

export const Route = createFileRoute('/client/company/$companyName/member/permission')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/member/permission' })
  const { hasPermission } = usePermissions(companyName)
  
  const { data: permissionsData, isLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await fetch('https://reg-backend-psi.vercel.app/api/company/permissions', {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch permissions');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="px-6 pt-6 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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

  // Check permission to view permissions
  if (!hasPermission('member:permission:view')) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat daftar perizinan</p>
        </div>
      </div>
    );
  }

  const permissions = permissionsData?.permissions || [];

  return (
    <div className="px-6 h-full bg-white">
      <MemberHeader />
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
            {permissions.length === 0 ? (
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
