import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../../component/headers/DetailHeader'
import { queryKeys } from '../../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/group/$farmerGroupId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, farmerGroupId } = useParams({ from: '/client/company/$companyName/worker/group/$farmerGroupId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch company data to get companyId
  const { data: companyData } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch farmer group data
  const { data: groupData, isLoading, error } = useQuery({
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
    navigate({ to: '/client/company/$companyName/worker/group/$farmerGroupId/edit' as any, params: { companyName, farmerGroupId } as any })
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus kelompok ini?')) {
      deleteMutation.mutate();
    }
  }

  if (isLoading || !companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !farmerGroupData) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
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
        title={`Lihat Kelompok: ${farmerGroupData.name}`} 
        handleDelete={handleDelete} 
        handleEdit={handleEdit} 
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
