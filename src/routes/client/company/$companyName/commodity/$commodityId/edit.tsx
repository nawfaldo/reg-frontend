import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../component/headers/EditHeader'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/commodity/$commodityId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, commodityId } = useParams({ from: '/client/company/$companyName/commodity/$commodityId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
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

  // Fetch commodity data
  const { data: commodityData, isLoading: isLoadingCommodity } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.commodityById(companyData.company.id, commodityId) : ['commodity', commodityId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).commodity({ commodityId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Pre-fill form when commodity data is loaded
  useEffect(() => {
    if (commodityData?.commodity) {
      const commodity = commodityData.commodity;
      setName(commodity.name || '');
      setCode(commodity.code || '');
    }
  }, [commodityData]);

  // Update commodity mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      code?: string;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).commodity({ commodityId }).put(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to update commodity');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.commodities(companyData.company.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.commodityById(companyData.company.id, commodityId) });
      }
      navigate({ to: '/client/company/$companyName/commodity/$commodityId' as any, params: { companyName, commodityId } as any });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama komoditas tidak boleh kosong');
      return;
    }

    if (!code || code.trim().length === 0) {
      setError('Kode komoditas tidak boleh kosong');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      code: code.trim(),
    });
  }

  if (!companyData || isLoadingCommodity) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!commodityData?.commodity) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Komoditas tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const commodity = commodityData.commodity;

  return (
    <div className='px-6 pt-1 bg-white'>
      <EditHeader title={`Edit Komoditas: ${commodity.name}`} saveHandle={handleSave} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Komoditas
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Komoditas"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Code Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Kode Komoditas
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Kode Komoditas"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>
      </div>
    </div>
  )
}
