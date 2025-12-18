import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import DetailHeader from '../../../../../../../component/headers/DetailHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/member/role/$roleId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, roleId } = useParams({ from: '/client/company/$companyName/member/role/$roleId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  // Fetch company ID
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }
      return response.json();
    },
  });

  // Fetch role data
  const { data: roleData, isLoading: isLoadingRole, error } = useQuery({
    queryKey: ['company', companyData?.company?.id, 'roles', roleId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/company/${companyData.company.id}/roles/${roleId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch role');
      }
      return response.json();
    },
    enabled: !!companyData?.company?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/company/${companyData.company.id}/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyData?.company?.id, 'roles'] });
      navigate({ to: '/client/company/$companyName/member/role', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const handleDelete = () => {
    if (!hasPermission('member:role:delete')) {
      alert('Anda tidak memiliki izin untuk menghapus peran');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus peran ini?')) {
      deleteMutation.mutate();
    }
  }
  
  const handleEdit = () => {
    if (!hasPermission('member:role:update')) {
      alert('Anda tidak memiliki izin untuk mengubah peran');
      return;
    }
    navigate({ to: '/client/company/$companyName/member/role/$roleId/edit', params: { companyName, roleId } });
  }

  if (isLoadingCompany || isLoadingRole) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check permission to view role
  if (!hasPermission('member:role:view')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat detail peran</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Detail Peran"
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  const role = roleData?.role;
  const permissions = role?.permissions || [];

  if (!role) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Detail Peran"
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Role not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader
        title={`Lihat Peran: ${role.name}`}
        handleDelete={hasPermission('member:role:delete') ? handleDelete : undefined}
        handleEdit={hasPermission('member:role:update') ? handleEdit : undefined}
      />
      
      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Name
          </label>
          <input
            type="text"
            value={role.name}
            readOnly
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Permissions Table */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Perizinan
          </label>
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
      </div>
    </div>
  );
}
