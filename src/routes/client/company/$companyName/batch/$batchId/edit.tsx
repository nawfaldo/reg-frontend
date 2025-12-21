import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../components/headers/EditHeader'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/batch/$batchId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, batchId } = useParams({ from: '/client/company/$companyName/batch/$batchId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [lotCode, setLotCode] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch company data
  const { data: companyData } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch batch data
  const { data: batchData, isLoading: isLoadingBatch } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchById(companyData.company.id, batchId) : ['batch', batchId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Pre-fill form when batch data is loaded
  useEffect(() => {
    if (batchData?.batch) {
      const batch = batchData.batch;
      setLotCode(batch.lotCode || '');
      setHarvestDate(batch.harvestDate ? new Date(batch.harvestDate).toISOString().split('T')[0] : '');
    }
  }, [batchData]);

  // Update batch mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      lotCode?: string;
      harvestDate?: string;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).put(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to update batch');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batches(companyData.company.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchById(companyData.company.id, batchId) });
      }
      navigate({ to: '/client/company/$companyName/batch/$batchId' as any, params: { companyName, batchId } as any });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    setError(null);

    if (!lotCode || lotCode.trim().length === 0) {
      setError('Lot code tidak boleh kosong');
      return;
    }

    if (!harvestDate) {
      setError('Tanggal panen tidak boleh kosong');
      return;
    }

    updateMutation.mutate({
      lotCode: lotCode.trim(),
      harvestDate: harvestDate,
    });
  }

  if (!companyData || isLoadingBatch) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!batchData?.batch) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Batch tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const batch = batchData.batch;

  return (
    <div className='px-6 pt-1 bg-white'>
      <EditHeader title={`Edit Batch: ${batch.lotCode}`} saveHandle={handleSave} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Lot Code Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Lot Code
          </label>
          <input
            type="text"
            value={lotCode}
            onChange={(e) => setLotCode(e.target.value)}
            placeholder="Lot Code"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Harvest Date Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Tanggal Panen
          </label>
          <input
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>
      </div>
    </div>
  )
}
