import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../../component/headers/EditHeader'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import { Loader2, ChevronDown, X } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/individual/$farmerId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, farmerId } = useParams({ from: '/client/company/$companyName/worker/individual/$farmerId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [selectedFarmerGroupIds, setSelectedFarmerGroupIds] = useState<string[]>([])
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

  // Fetch farmer data
  const { data: farmerData, isLoading: isLoadingFarmer } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmerById(companyData.company.id, farmerId) : ['farmer', farmerId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual({ farmerId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
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

  // Pre-fill form when farmer data is loaded
  useEffect(() => {
    if (farmerData?.farmer) {
      const farmer = farmerData.farmer;
      setFirstName(farmer.firstName || '');
      setLastName(farmer.lastName || '');
      setNationalId(farmer.nationalId || '');
      setPhoneNumber(farmer.phoneNumber || '');
      setAddress(farmer.address || '');
      setSelectedFarmerGroupIds(
        farmer.farmerGroups && farmer.farmerGroups.length > 0
          ? farmer.farmerGroups.map((g: any) => g.id)
          : []
      );
    }
  }, [farmerData]);

  // Update farmer mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      firstName?: string;
      lastName?: string;
      nationalId?: string;
      phoneNumber?: string;
      address?: string;
      farmerGroupIds?: string[];
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual({ farmerId }).put(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to update farmer');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmers(companyData.company.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmerById(companyData.company.id, farmerId) });
      }
      navigate({ to: '/client/company/$companyName/worker/individual/$farmerId', params: { companyName, farmerId } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    setError(null);

    if (!firstName || firstName.trim().length === 0) {
      setError('Nama awal tidak boleh kosong');
      return;
    }

    if (!lastName || lastName.trim().length === 0) {
      setError('Nama akhir tidak boleh kosong');
      return;
    }

    if (!nationalId || nationalId.trim().length === 0) {
      setError('NIK tidak boleh kosong');
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length === 0) {
      setError('Nomor telepon tidak boleh kosong');
      return;
    }

    if (!address || address.trim().length === 0) {
      setError('Alamat tidak boleh kosong');
      return;
    }

    updateMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId: nationalId.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      farmerGroupIds: selectedFarmerGroupIds.length > 0 ? selectedFarmerGroupIds : [],
    });
  }

  const farmerGroups = farmerGroupsData?.farmerGroups || [];
  // Filter out already selected groups
  const availableGroups = farmerGroups.filter((group: any) => 
    !selectedFarmerGroupIds.includes(group.id)
  );
  
  // Get selected group objects
  const selectedGroupObjects = farmerGroups.filter((group: any) => selectedFarmerGroupIds.includes(group.id));

  const handleAddGroup = (groupId: string) => {
    if (!selectedFarmerGroupIds.includes(groupId)) {
      setSelectedFarmerGroupIds([...selectedFarmerGroupIds, groupId]);
    }
    setIsDropdownOpen(false);
  }

  const handleRemoveGroup = (groupId: string) => {
    setSelectedFarmerGroupIds(selectedFarmerGroupIds.filter(id => id !== groupId));
  }

  if (!companyData || isLoadingFarmer) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!farmerData?.farmer) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Pekerja tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const farmer = farmerData.farmer;

  return (
    <div className='px-6 pt-1 bg-white'>
      <EditHeader title={`Edit Pekerja: ${farmer.firstName} ${farmer.lastName}`} saveHandle={handleSave} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* First Name Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Awal
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nama Awal"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Last Name Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Akhir
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nama Akhir"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* National ID Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            NIK
          </label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="Nomor Induk Kependudukan"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nomor Telepon
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Nomor Telepon"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Alamat
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat Lengkap"
            rows={4}
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white resize-none"
          />
        </div>

        {/* Farmer Group Select */}
    <div>
          <label className="block text-sm font-medium text-black mb-2">
            Kelompok (Opsional)
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className="text-gray-400">
                Pilih kelompok
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {availableGroups.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada kelompok tersedia</div>
                ) : (
                  availableGroups.map((group: any) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleAddGroup(group.id)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {group.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Selected Groups Tags */}
          {selectedGroupObjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedGroupObjects.map((group: any) => (
                <div
                  key={group.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-sm"
                >
                  <span className="text-black">{group.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGroup(group.id)}
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
