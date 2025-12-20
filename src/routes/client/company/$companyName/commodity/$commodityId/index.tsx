import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../component/headers/DetailHeader'
import { queryKeys } from '../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/commodity/$commodityId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, commodityId } = useParams({ from: '/client/company/$companyName/commodity/$commodityId/' })
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

  // Fetch commodity data
  const { data: commodityData, isLoading, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.commodityById(companyData.company.id, commodityId) : ['commodity', commodityId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).commodity({ commodityId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const commodity = commodityData?.commodity

  // Delete commodity mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).commodity({ commodityId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete commodity');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.commodities(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/commodity', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus komoditas');
    },
  });

  const handleEdit = () => {
    navigate({ to: '/client/company/$companyName/commodity/$commodityId/edit' as any, params: { companyName, commodityId } as any })
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus komoditas ini?')) {
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

  if (error || !commodity) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || 'Komoditas tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title={`Lihat Komoditas: ${commodity.name}`} 
        handleDelete={handleDelete} 
        handleEdit={handleEdit} 
      />

      <div className="space-y-6">
        {/* Commodity Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nama Komoditas
            </label>
            <p className='text-sm'>{commodity.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Kode Komoditas
            </label>
            <p className='text-sm'>{commodity.code}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Jumlah Batch
            </label>
            <p className='text-sm'>{commodity.batches?.length || 0}</p>
          </div>
        </div>

        {/* Batches List */}
        {commodity.batches && commodity.batches.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Daftar Batch
            </label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <colgroup>
                  <col className="w-[200px]" />
                  <col className="w-[150px]" />
                  <col className="w-[150px]" />
                  <col className="w-auto" />
                </colgroup>
                
                <thead>
                  <tr className="border border-gray-200 bg-gray-100">
                    <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Lot Code</th>
                    <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Tanggal Panen</th>
                    <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Total (Kg)</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                
                <tbody>
                  {commodity.batches.map((batch: any) => (
                    <tr key={batch.id} className="border-b border-gray-200">
                      <td className="py-3 pl-5 pr-1">
                        <span className="text-sm text-black">{batch.lotCode}</span>
                      </td>
                      <td className="py-3 pl-1 pr-1">
                        <span className="text-sm text-black">
                          {new Date(batch.harvestDate).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 pl-1 pr-1">
                        <span className="text-sm text-black">{batch.totalKg}</span>
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
