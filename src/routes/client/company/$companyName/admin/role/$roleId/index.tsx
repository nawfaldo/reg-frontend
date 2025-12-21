import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DetailHeader from '../../../../../../../components/headers/DetailHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import Skeleton from '../../../../../../../components/Skeleton'

export const Route = createFileRoute(
  '/client/company/$companyName/admin/role/$roleId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, roleId } = useParams({ from: '/client/company/$companyName/admin/role/$roleId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  // Fetch company ID
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch role data
  const { data: roleData, isLoading: isLoadingRole, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.role(companyData.company.id, roleId) : ['company', companyData?.company?.id, 'roles', roleId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).roles({ roleId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).roles({ roleId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete role');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.roles(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/admin/role', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const handleDelete = () => {
    if (!hasPermission('admin:role:delete')) {
      alert('Anda tidak memiliki izin untuk menghapus peran');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus peran ini?')) {
      deleteMutation.mutate();
    }
  }
  
  const handleEdit = () => {
    if (!hasPermission('admin:role:update')) {
      alert('Anda tidak memiliki izin untuk mengubah peran');
      return;
    }
    navigate({ to: '/client/company/$companyName/admin/role/$roleId/edit', params: { companyName, roleId } });
  }

  const isLoading = isLoadingCompany || isLoadingRole;
  const role = roleData?.role;
  const permissions = role?.permissions || [];

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('admin:role:view')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat detail peran</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Peran"
          userName={undefined}
          handleDelete={undefined}
          handleEdit={undefined}
          isLoading={true}
          isLoadingUserName={true}
        />
        
        <div className="space-y-6">
          {/* Name Input Skeleton */}
          <div>
            <Skeleton width={60} height={20} className="mb-2" />
            <Skeleton width={400} height={36} borderRadius={0} />
          </div>
          
          {/* Permissions Table Skeleton */}
          <div>
            <Skeleton width={80} height={20} className="mb-2" />
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
                  {Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b border-gray-200">
                      <td className="pl-5 pr-1 py-3">
                        <Skeleton width={120} height={16} />
                      </td>
                      <td className="pl-1 pr-2 py-3">
                        <Skeleton width={200} height={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Peran"
          userName={undefined}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          isLoading={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Peran"
          userName={undefined}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          isLoading={false}
          isLoadingUserName={false}
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
        title="Lihat Peran"
        userName={role.name}
        handleDelete={hasPermission('admin:role:delete') ? handleDelete : undefined}
        handleEdit={hasPermission('admin:role:update') ? handleEdit : undefined}
        isLoading={false}
        isLoadingUserName={false}
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
