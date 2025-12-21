import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../../components/headers/EditHeader'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import SkeletonInput from '../../../../../../../components/inputs/SkeletonInput'
import SkeletonDropdown from '../../../../../../../components/inputs/SkeletonDropdown'
import { usePermissions } from '../../../../../../../hooks/usePermissions'
import Skeleton from '../../../../../../../components/Skeleton'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/individual/$farmerId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, farmerId } = useParams({ from: '/client/company/$companyName/worker/individual/$farmerId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [selectedFarmerGroupIds, setSelectedFarmerGroupIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch company data
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
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
  const { data: farmerGroupsData, isLoading: isLoadingGroups } = useQuery({
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
  const isLoading = isLoadingCompany || isLoadingFarmer || isLoadingGroups;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('worker:individual:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah pekerja</p>
        </div>
      </div>
    );
  }

  const handleAddGroup = (groupId: string) => {
    if (!selectedFarmerGroupIds.includes(groupId)) {
      setSelectedFarmerGroupIds([...selectedFarmerGroupIds, groupId]);
    }
  }

  const handleRemoveGroup = (groupId: string) => {
    setSelectedFarmerGroupIds(selectedFarmerGroupIds.filter(id => id !== groupId));
  }

  if (isLoading) {
    return (
      <div className='px-6 pt-1 bg-white'>
        <EditHeader
          title="Ubah Pekerja"
          userName={undefined}
          saveHandle={handleSave}
          isPending={false}
          isLoadingUserName={true}
        />
        
        <div className="space-y-6">
          <SkeletonInput label="Nama Awal" value="" onChange={() => {}} isLoading={true} wrapperClassName="w-[400px]" />
          <SkeletonInput label="Nama Akhir" value="" onChange={() => {}} isLoading={true} wrapperClassName="w-[400px]" />
          <SkeletonInput label="NIK" value="" onChange={() => {}} isLoading={true} wrapperClassName="w-[400px]" />
          <SkeletonInput label="Nomor Telepon" value="" onChange={() => {}} isLoading={true} wrapperClassName="w-[400px]" />
          <div>
            <label className="block text-sm font-bold text-black mb-3">Alamat</label>
            <div className="w-[400px] border border-gray-300 focus-within:border-gray-900">
              <Skeleton width="100%" height={80} borderRadius={0} />
            </div>
          </div>
          <SkeletonDropdown label="Kelompok (Opsional)" placeholder="Pilih kelompok" items={[]} selectedIds={[]} onAdd={() => {}} onRemove={() => {}} isLoading={true} isLoadingItems={true} />
        </div>
      </div>
    );
  }

  if (!farmerData?.farmer) {
    return (
      <div className='px-6 pt-1 bg-white'>
        <EditHeader
          title="Ubah Pekerja"
          userName={undefined}
          saveHandle={handleSave}
          isPending={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Pekerja tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const farmer = farmerData.farmer;

  return (
    <div className='px-6 pt-1 bg-white'>
      <EditHeader
        title="Ubah Pekerja"
        userName={`${farmer.firstName} ${farmer.lastName}`}
        saveHandle={handleSave}
        isPending={updateMutation.isPending}
        isLoadingUserName={false}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <SkeletonInput label="Nama Awal" value={firstName} onChange={(e) => setFirstName(e.target.value)} isLoading={false} wrapperClassName="w-[400px]" />
        <SkeletonInput label="Nama Akhir" value={lastName} onChange={(e) => setLastName(e.target.value)} isLoading={false} wrapperClassName="w-[400px]" />
        <SkeletonInput label="NIK" value={nationalId} onChange={(e) => setNationalId(e.target.value)} isLoading={false} wrapperClassName="w-[400px]" />
        <SkeletonInput label="Nomor Telepon" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} isLoading={false} wrapperClassName="w-[400px]" />
        <div>
          <label className="block text-sm font-bold text-black mb-3">Alamat</label>
          <div className="w-[400px] border border-gray-300 focus-within:border-gray-900">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat Lengkap"
              rows={4}
              className="w-full px-3 py-2 focus:outline-none text-sm bg-transparent resize-none"
            />
          </div>
        </div>
        <SkeletonDropdown label="Kelompok (Opsional)" placeholder="Pilih kelompok" items={farmerGroups.map((g: any) => ({ id: g.id, name: g.name }))} selectedIds={selectedFarmerGroupIds} onAdd={handleAddGroup} onRemove={handleRemoveGroup} isLoading={false} isLoadingItems={isLoadingGroups} />
      </div>
    </div>
  )
}
