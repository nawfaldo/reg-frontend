import { createFileRoute, useParams, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Eye } from 'lucide-react'
import DetailHeader from '../../../../../../../component/headers/DetailHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'

export const Route = createFileRoute(
  '/client/company/$companyName/member/user/$userId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, userId } = useParams({ from: '/client/company/$companyName/member/user/$userId/' })
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

  // Fetch company members to get user details
  const { data: membersData, isLoading: isLoadingMembers, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.members(companyData.company.id) : ['company', companyData?.company?.id, 'members'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).members({ userId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete member');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.members(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/member/user', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const handleDelete = () => {
    if (!hasPermission('member:user:delete')) {
      alert('Anda tidak memiliki izin untuk menghapus anggota');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini dari perusahaan?')) {
      deleteMutation.mutate();
    }
  }
  
  const handleEdit = () => {
    if (!hasPermission('member:user:update')) {
      alert('Anda tidak memiliki izin untuk mengubah anggota');
      return;
    }
    navigate({ to: '/client/company/$companyName/member/user/$userId/edit', params: { companyName, userId } });
  }

  if (isLoadingCompany || isLoadingMembers) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check permission to view user
  if (!hasPermission('member:user:view')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat detail anggota</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Anggota"
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  const members = membersData?.company?.members || [];
  const user = members.find((member: any) => member.id === userId);

  if (!user) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Anggota"
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader
        title={`Lihat Anggota: ${user.name}`}
        handleDelete={hasPermission('member:user:delete') ? handleDelete : undefined}
        handleEdit={hasPermission('member:user:update') ? handleEdit : undefined}
      />

      <div className="flex items-start gap-4">
        {user.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="w-[100px] h-[100px] rounded-[25px]"
          />
        ) : (
          <div className="w-24 h-24 rounded-[25px] bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-black mb-1">{user.name}</h2>
          <p className="text-sm text-black">{user.email}</p>
        </div>
      </div>

      {/* Roles Table */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-black mb-4">Peran</h3>
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
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role: any) => (
                  <tr key={role.id} className="border-b border-gray-200">
                    <td className="pl-5 pr-1">
                      <span className="text-sm text-black capitalize">{role.name}</span>
                    </td>
                    <td className="pl-1 pr-2">
                      {hasPermission('member:role:view') && (
                        <Link
                          to="/client/company/$companyName/member/role/$roleId"
                          params={{ companyName, roleId: role.id }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors inline-block"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Link>
                      )}
                    </td>
                    <td className=""></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 px-2 text-center text-gray-500">
                    Tidak ada peran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
