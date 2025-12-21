import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../../../../components/headers/CreateHeader'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import SkeletonInput from '../../../../../../components/inputs/SkeletonInput'
import SkeletonDropdown from '../../../../../../components/inputs/SkeletonDropdown'
import { usePermissions } from '../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/group/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/worker/group/create' })
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
  const isLoading = isLoadingCompany || isLoadingFarmers;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('worker:group:create')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk membuat kelompok pekerja</p>
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
        <CreateHeader title='Buat Kelompok' createHandle={handleCreate} isPending={false} />
        
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

  return (
    <div className='px-6 pt-1 bg-white'>
      <CreateHeader title='Buat Kelompok' createHandle={handleCreate} isPending={createMutation.isPending} />

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
