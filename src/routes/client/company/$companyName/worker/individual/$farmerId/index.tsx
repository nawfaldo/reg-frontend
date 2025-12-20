import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../../component/headers/DetailHeader'
import { queryKeys } from '../../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/individual/$farmerId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, farmerId } = useParams({ from: '/client/company/$companyName/worker/individual/$farmerId/' })
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

  // Fetch farmer data
  const { data: farmerData, isLoading, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmerById(companyData.company.id, farmerId) : ['farmer', farmerId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual({ farmerId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const farmer = farmerData?.farmer

  // Delete farmer mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual({ farmerId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete farmer');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmers(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/worker/individual', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus pekerja');
    },
  });

  const handleEdit = () => {
    navigate({ to: '/client/company/$companyName/worker/individual/$farmerId/edit' as any, params: { companyName, farmerId } as any })
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus pekerja ini?')) {
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

  if (error || !farmer) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || 'Pekerja tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title={`Lihat Pekerja: ${farmer.firstName} ${farmer.lastName}`} 
        handleDelete={handleDelete} 
        handleEdit={handleEdit} 
      />

      <div className="space-y-6">
        {/* Farmer Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nama Lengkap
            </label>
            <p className='text-sm'>{farmer.firstName} {farmer.lastName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              NIK
            </label>
            <p className='text-sm'>{farmer.nationalId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nomor Telepon
            </label>
            <p className='text-sm'>{farmer.phoneNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Alamat
            </label>
            <p className='text-sm'>{farmer.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Kelompok
            </label>
            <p className='text-sm'>
              {farmer.farmerGroups && farmer.farmerGroups.length > 0
                ? farmer.farmerGroups.map((g: any) => g.name).join(', ')
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
