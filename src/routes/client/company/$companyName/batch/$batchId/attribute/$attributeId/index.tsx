import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../../../components/headers/DetailHeader'
import { queryKeys } from '../../../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../../lib/api'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/batch/$batchId/attribute/$attributeId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, batchId, attributeId } = useParams({ from: '/client/company/$companyName/batch/$batchId/attribute/$attributeId/' })
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

  // Fetch batch attribute data
  const { data: batchAttributeData, isLoading, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchAttributeById(companyData.company.id, batchId, attributeId) : ['batchAttribute', attributeId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).attribute({ attributeId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const batchAttribute = batchAttributeData?.batchAttribute

  // Delete batch attribute mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).attribute({ attributeId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete batch attribute');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchAttributes(companyData.company.id, batchId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchById(companyData.company.id, batchId) });
      }
      navigate({ to: '/client/company/$companyName/batch/$batchId', params: { companyName, batchId } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus attribute batch');
    },
  });

  const handleEdit = () => {
    navigate({ to: '/client/company/$companyName/batch/$batchId/attribute/$attributeId/edit' as any, params: { companyName, batchId, attributeId } as any })
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus attribute batch ini?')) {
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

  if (error || !batchAttribute) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || 'Attribute batch tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title={`Lihat Attribute Batch`} 
        handleDelete={handleDelete} 
        handleEdit={handleEdit} 
      />

      <div className="space-y-6">
        {/* Batch Attribute Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Batch
            </label>
            <p className='text-sm'>{batchAttribute.batch?.lotCode || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Key
            </label>
            <p className='text-sm'>{batchAttribute.key}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Value
            </label>
            <p className='text-sm'>{batchAttribute.value}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Unit
            </label>
            <p className='text-sm'>{batchAttribute.unit || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Recorded At
            </label>
            <p className='text-sm'>{new Date(batchAttribute.recordedAt).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
