import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../../../component/headers/CreateHeader'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../lib/api'
import { queryKeys } from '../../../../../lib/query-keys'
import { Loader2, ChevronDown } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/batch/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/batch/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [commodityId, setCommodityId] = useState('')
  const [lotCode, setLotCode] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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

  // Fetch commodities for dropdown
  const { data: commoditiesData } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.commodities(companyData.company.id) : ['commodities'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).commodity.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Create batch mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      commodityId: string;
      lotCode: string;
      harvestDate: string;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).batch.post(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to create batch');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batches(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/batch', params: { companyName } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    if (!commodityId || commodityId.trim().length === 0) {
      setError('Komoditas tidak boleh kosong');
      return;
    }

    if (!lotCode || lotCode.trim().length === 0) {
      setError('Lot code tidak boleh kosong');
      return;
    }

    if (!harvestDate) {
      setError('Tanggal panen tidak boleh kosong');
      return;
    }

    createMutation.mutate({
      commodityId: commodityId.trim(),
      lotCode: lotCode.trim(),
      harvestDate: harvestDate,
    });
  }

  const commodities = commoditiesData?.commodities || [];
  const selectedCommodity = commodities.find((c: any) => c.id === commodityId);

  if (!companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className='px-6 pt-1 bg-white'>
      <CreateHeader title='Tambah Batch' createHandle={handleCreate} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Commodity Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Komoditas
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className={selectedCommodity ? "text-black" : "text-gray-400"}>
                {selectedCommodity ? selectedCommodity.name : "Pilih komoditas"}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {commodities.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada komoditas tersedia</div>
                ) : (
                  commodities.map((commodity: any) => (
                    <button
                      key={commodity.id}
                      type="button"
                      onClick={() => {
                        setCommodityId(commodity.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {commodity.name} ({commodity.code})
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

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
