import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../../components/headers/EditHeader'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import SkeletonInput from '../../../../../../../components/inputs/SkeletonInput'
import SkeletonDropdown from '../../../../../../../components/inputs/SkeletonDropdown'
import { usePermissions } from '../../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/group/$farmerGroupId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, farmerGroupId } = useParams({ from: '/client/company/$companyName/worker/group/$farmerGroupId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  const [name, setName] = useState('')
  const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([])
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

  // Fetch farmer group data
  const { data: groupData, isLoading: isLoadingGroup } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmerGroupById(companyData.company.id, farmerGroupId) : ['farmerGroup', farmerGroupId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group({ groupId: farmerGroupId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Fetch farmers for dropdown
  const { data: farmersData, isLoading: isLoadingFarmers } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmers(companyData.company.id) : ['farmers'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Pre-fill form when group data is loaded
  useEffect(() => {
    if (groupData?.farmerGroup) {
      const group = groupData.farmerGroup;
      setName(group.name || '');
      setSelectedFarmerIds(
        group.farmers && group.farmers.length > 0
          ? group.farmers.map((f: any) => f.id)
          : []
      );
    }
  }, [groupData]);

  // Update farmer group mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      farmerIds?: string[];
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group({ groupId: farmerGroupId }).put(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to update farmer group');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmerGroups(companyData.company.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.farmerGroupById(companyData.company.id, farmerGroupId) });
      }
      navigate({ to: '/client/company/$companyName/worker/group/$farmerGroupId' as any, params: { companyName, farmerGroupId } as any });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama kelompok tidak boleh kosong');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      farmerIds: selectedFarmerIds.length > 0 ? selectedFarmerIds : [],
    });
  }

  const farmers = farmersData?.farmers || [];
  const isLoading = isLoadingCompany || isLoadingGroup || isLoadingFarmers;
  const isLoadingGroupName = isLoadingGroup || !groupData?.farmerGroup;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('worker:group:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah kelompok</p>
        </div>
      </div>
    );
  }

  const handleAddFarmer = (farmerId: string) => {
    if (!selectedFarmerIds.includes(farmerId)) {
      setSelectedFarmerIds([...selectedFarmerIds, farmerId]);
    }
  }

  const handleRemoveFarmer = (farmerId: string) => {
    setSelectedFarmerIds(selectedFarmerIds.filter(id => id !== farmerId));
  }

  if (isLoading) {
    return (
      <div className='px-6 pt-1 bg-white'>
        <EditHeader
          title="Ubah Kelompok"
          userName={undefined}
          saveHandle={handleSave}
          isPending={false}
          isLoadingUserName={true}
        />
        
        <div className="space-y-6">
          {/* Name Input Skeleton */}
          <SkeletonInput
            label="Nama Kelompok"
            value=""
            onChange={() => {}}
            isLoading={true}
            wrapperClassName="w-[400px]"
          />
          
          {/* Farmer Select Skeleton */}
          <SkeletonDropdown
            label="Pekerja (Opsional)"
            placeholder="Pilih pekerja"
            items={[]}
            selectedIds={[]}
            onAdd={() => {}}
            onRemove={() => {}}
            isLoading={true}
            isLoadingItems={true}
          />
        </div>
      </div>
    );
  }

  if (!groupData?.farmerGroup) {
    return (
      <div className='px-6 pt-1 bg-white'>
        <EditHeader
          title="Ubah Kelompok"
          userName={undefined}
          saveHandle={handleSave}
          isPending={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Kelompok tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const group = groupData.farmerGroup;

  return (
    <div className='px-6 pt-1 bg-white'>
      <EditHeader
        title="Ubah Kelompok"
        userName={group.name}
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
        {/* Name Input */}
        <SkeletonInput
          label="Nama Kelompok"
          value={name}
          onChange={(e) => setName(e.target.value)}
          isLoading={false}
          wrapperClassName="w-[400px]"
        />

        {/* Farmer Select */}
        <SkeletonDropdown
          label="Pekerja (Opsional)"
          placeholder="Pilih pekerja"
          items={farmers.map((farmer: any) => ({ id: farmer.id, name: `${farmer.firstName} ${farmer.lastName}` }))}
          selectedIds={selectedFarmerIds}
          onAdd={handleAddFarmer}
          onRemove={handleRemoveFarmer}
          isLoading={false}
          isLoadingItems={isLoadingFarmers}
        />
      </div>
    </div>
  )
}
