import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../../../../components/headers/CreateHeader'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import { Loader2, ChevronDown, X } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/group/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/worker/group/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([])
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

  // Fetch farmers for dropdown
  const { data: farmersData } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmers(companyData.company.id) : ['farmers'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Create farmer group mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      farmerIds?: string[];
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group.post(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to create farmer group');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmerGroups(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/worker/group', params: { companyName } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama kelompok tidak boleh kosong');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      farmerIds: selectedFarmerIds.length > 0 ? selectedFarmerIds : undefined,
    });
  }

  const farmers = farmersData?.farmers || [];
  // Filter out already selected farmers
  const availableFarmers = farmers.filter((farmer: any) => 
    !selectedFarmerIds.includes(farmer.id)
  );
  
  // Get selected farmer objects
  const selectedFarmerObjects = farmers.filter((farmer: any) => selectedFarmerIds.includes(farmer.id));

  const handleAddFarmer = (farmerId: string) => {
    if (!selectedFarmerIds.includes(farmerId)) {
      setSelectedFarmerIds([...selectedFarmerIds, farmerId]);
    }
    setIsDropdownOpen(false);
  }

  const handleRemoveFarmer = (farmerId: string) => {
    setSelectedFarmerIds(selectedFarmerIds.filter(id => id !== farmerId));
  }

  if (!companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className='px-6 pt-1 bg-white'>
      <CreateHeader title='Buat Kelompok' createHandle={handleCreate} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Kelompok
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Kelompok"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Farmer Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Pekerja (Opsional)
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className="text-gray-400">
                Pilih pekerja
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {availableFarmers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada pekerja tersedia</div>
                ) : (
                  availableFarmers.map((farmer: any) => (
                    <button
                      key={farmer.id}
                      type="button"
                      onClick={() => handleAddFarmer(farmer.id)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {farmer.firstName} {farmer.lastName}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Selected Farmers Tags */}
          {selectedFarmerObjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFarmerObjects.map((farmer: any) => (
                <div
                  key={farmer.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-sm"
                >
                  <span className="text-black">{farmer.firstName} {farmer.lastName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFarmer(farmer.id)}
                    className="text-gray-600 hover:text-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
