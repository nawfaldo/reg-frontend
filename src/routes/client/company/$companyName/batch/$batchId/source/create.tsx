import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../../../../../components/headers/CreateHeader'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import { Loader2, ChevronDown } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/batch/$batchId/source/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, batchId } = useParams({ from: '/client/company/$companyName/batch/$batchId/source/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [farmerGroupId, setFarmerGroupId] = useState('')
  const [landId, setLandId] = useState('')
  const [volumeKg, setVolumeKg] = useState('')
  const [isFarmerGroupDropdownOpen, setIsFarmerGroupDropdownOpen] = useState(false)
  const [isLandDropdownOpen, setIsLandDropdownOpen] = useState(false)
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

  // Fetch farmer groups for dropdown
  const { data: farmerGroupsData } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmerGroups(companyData.company.id) : ['farmerGroups'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Fetch lands for dropdown
  const { data: landsData } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.land(companyData.company.id) : ['lands'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).land.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Fetch existing batch sources to filter out used lands
  const { data: batchSourcesData } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchSources(companyData.company.id, batchId) : ['batchSources', batchId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).source.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Create batch source mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      farmerGroupId: string;
      landId: string;
      volumeKg: number;
      landSnapshot?: any;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).source.post(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to create batch source');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchSources(companyData.company.id, batchId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchById(companyData.company.id, batchId) });
      }
      navigate({ to: '/client/company/$companyName/batch/$batchId', params: { companyName, batchId } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    if (!farmerGroupId || farmerGroupId.trim().length === 0) {
      setError('Kelompok tidak boleh kosong');
      return;
    }

    if (!landId || landId.trim().length === 0) {
      setError('Lahan tidak boleh kosong');
      return;
    }

    const volumeKgNum = parseFloat(volumeKg);
    if (!volumeKg || isNaN(volumeKgNum) || volumeKgNum < 0) {
      setError('Volume kg tidak boleh kosong dan harus >= 0');
      return;
    }

    // Get selected land data for snapshot
    const selectedLandData = allLands.find((l: any) => l.id === landId);
    if (!selectedLandData) {
      setError('Lahan tidak ditemukan');
      return;
    }

    // Create land snapshot with relevant land data
    const landSnapshot = {
      id: selectedLandData.id,
      name: selectedLandData.name,
      areaHectares: selectedLandData.areaHectares,
      latitude: selectedLandData.latitude,
      longitude: selectedLandData.longitude,
      location: selectedLandData.location,
      geoPolygon: selectedLandData.geoPolygon,
      isDeforestationFree: selectedLandData.isDeforestationFree,
      recordedAt: selectedLandData.recordedAt,
      snapshotDate: new Date().toISOString(), // When the snapshot was taken
    };

    createMutation.mutate({
      farmerGroupId: farmerGroupId.trim(),
      landId: landId.trim(),
      volumeKg: volumeKgNum,
      landSnapshot,
    });
  }

  const farmerGroups = farmerGroupsData?.farmerGroups || [];
  const allLands = landsData?.lands || [];
  const existingBatchSources = batchSourcesData?.batchSources || [];
  
  // Filter out lands that are already used in batch sources for this batch
  const usedLandIds = new Set(existingBatchSources.map((source: any) => source.landId));
  const availableLands = allLands.filter((land: any) => !usedLandIds.has(land.id));
  
  const selectedFarmerGroup = farmerGroups.find((g: any) => g.id === farmerGroupId);
  const selectedLand = availableLands.find((l: any) => l.id === landId);

  if (!companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className='px-6 pt-1 bg-white'>
      <CreateHeader title='Tambah Sumber Batch' createHandle={handleCreate} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Farmer Group Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Kelompok
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFarmerGroupDropdownOpen(!isFarmerGroupDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className={selectedFarmerGroup ? "text-black" : "text-gray-400"}>
                {selectedFarmerGroup ? selectedFarmerGroup.name : "Pilih kelompok"}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFarmerGroupDropdownOpen ? `rotate-180` : ``}`} />
            </button>
            
            {isFarmerGroupDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {farmerGroups.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada kelompok tersedia</div>
                ) : (
                  farmerGroups.map((group: any) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setFarmerGroupId(group.id);
                        setIsFarmerGroupDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {group.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Land Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Lahan
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLandDropdownOpen(!isLandDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className={selectedLand ? "text-black" : "text-gray-400"}>
                {selectedLand ? selectedLand.name : "Pilih lahan"}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLandDropdownOpen ? `rotate-180` : ``}`} />
            </button>
            
            {isLandDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {availableLands.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada lahan tersedia</div>
                ) : (
                  availableLands.map((land: any) => (
                    <button
                      key={land.id}
                      type="button"
                      onClick={() => {
                        setLandId(land.id);
                        setIsLandDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {land.name} - {land.location}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Volume Kg Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Volume (Kg)
          </label>
          <input
            type="number"
            value={volumeKg}
            onChange={(e) => setVolumeKg(e.target.value)}
            placeholder="Volume (Kg)"
            min="0"
            step="0.01"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>
      </div>
    </div>
  )
}
