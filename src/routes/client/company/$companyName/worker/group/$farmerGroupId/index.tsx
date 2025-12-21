import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../../components/headers/DetailHeader'
import { queryKeys } from '../../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import Skeleton from '../../../../../../../components/Skeleton'
import { usePermissions } from '../../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/group/$farmerGroupId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, farmerGroupId } = useParams({ from: '/client/company/$companyName/worker/group/$farmerGroupId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  // Fetch company data to get companyId
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch farmer group data
  const { data: groupData, isLoading: isLoadingGroup, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmerGroupById(companyData.company.id, farmerGroupId) : ['farmerGroup', farmerGroupId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group({ groupId: farmerGroupId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const farmerGroupData = groupData?.farmerGroup
  const isLoading = isLoadingCompany || isLoadingGroup
  const isLoadingGroupName = isLoadingGroup || !farmerGroupData

  // Delete farmer group mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group({ groupId: farmerGroupId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete farmer group');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmerGroups(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/worker/group', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus kelompok');
    },
  });

  const handleEdit = () => {
    if (!hasPermission('worker:group:update')) {
      alert('Anda tidak memiliki izin untuk mengubah kelompok');
      return;
    }
    navigate({ to: '/client/company/$companyName/worker/group/$farmerGroupId/edit' as any, params: { companyName, farmerGroupId } as any })
  }

  const handleDelete = () => {
    if (!hasPermission('worker:group:delete')) {
      alert('Anda tidak memiliki izin untuk menghapus kelompok');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus kelompok ini?')) {
      deleteMutation.mutate();
    }
  }

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('worker:group:view')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat detail kelompok</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Kelompok"
          userName={undefined}
          handleDelete={undefined}
          handleEdit={undefined}
          isLoading={true}
          isLoadingUserName={true}
        />
        
        <div className="space-y-6">
          {/* Group Information Skeleton */}
          <div className="w-[400px] space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nama Kelompok
              </label>
              <Skeleton width={200} height={16} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Jumlah Pekerja
              </label>
              <Skeleton width={60} height={16} />
            </div>
          </div>

          {/* Farmers List Skeleton */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Daftar Pekerja
            </label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <colgroup>
                  <col className="w-[200px]" />
                  <col className="w-[150px]" />
                  <col className="w-auto" />
                </colgroup>
                
                <thead>
                  <tr className="border border-gray-200 bg-gray-100">
                    <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama Lengkap</th>
                    <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">NIK</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                
                <tbody>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b border-gray-200">
                      <td className="pl-5 pr-1 py-3">
                        <Skeleton width={120} height={16} />
                      </td>
                      <td className="pl-1 pr-2 py-3">
                        <Skeleton width={100} height={16} />
                      </td>
                      <td className="py-3"></td>
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

  if (error || !farmerGroupData) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Kelompok"
          userName={undefined}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          isLoading={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || "Kelompok tidak ditemukan"}</p>
        </div>
      </div>
    )
  }

  const farmers = farmerGroupData.farmers || [];

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title="Lihat Kelompok"
        userName={farmerGroupData.name}
        handleDelete={hasPermission('worker:group:delete') ? handleDelete : undefined} 
        handleEdit={hasPermission('worker:group:update') ? handleEdit : undefined}
        isLoading={false}
        isLoadingUserName={false}
      />

      <div className="space-y-6">
        {/* Group Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nama Kelompok
            </label>
            <p className='text-sm'>{farmerGroupData.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Jumlah Pekerja
            </label>
            <p className='text-sm'>{farmers.length}</p>
          </div>
        </div>

        {/* Farmers List */}
        {farmers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Daftar Pekerja
            </label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <colgroup>
                  <col className="w-[200px]" />
                  <col className="w-[150px]" />
                  <col className="w-auto" />
                </colgroup>
                
                <thead>
                  <tr className="border border-gray-200 bg-gray-100">
                    <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama Lengkap</th>
                    <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">NIK</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                
                <tbody>
                  {farmers.map((farmer: any) => (
                    <tr key={farmer.id} className="border-b border-gray-200">
                      <td className="py-3 pl-5 pr-1">
                        <span className="text-sm text-black">{farmer.firstName} {farmer.lastName}</span>
                      </td>
                      <td className="py-3 pl-1 pr-1">
                        <span className="text-sm text-black">{farmer.nationalId}</span>
                      </td>
                      <td className="py-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
