import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../components/headers/EditHeader'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import SkeletonInput from '../../../../../../components/inputs/SkeletonInput'
import { usePermissions } from '../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/commodity/$commodityId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, commodityId } = useParams({ from: '/client/company/$companyName/commodity/$commodityId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
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

  const isLoading = isLoadingCompany || isLoadingCommodity;
  const commodity = commodityData?.commodity;
  const isLoadingCommodityName = isLoadingCommodity || !commodity;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('commodity:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah komoditas</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='px-6 pt-1 bg-white h-full'>
        <EditHeader
          title="Ubah Komoditas"
          userName={undefined}
          saveHandle={handleSave}
          isPending={false}
          isLoadingUserName={isLoadingCommodityName}
        />
        
        <div className="space-y-6">
          {/* Name Input Skeleton */}
          <SkeletonInput
            label="Nama Komoditas"
            value=""
            onChange={() => {}}
            isLoading={true}
            wrapperClassName="w-[400px]"
          />
          
          {/* Code Input Skeleton */}
          <SkeletonInput
            label="Kode Komoditas"
            value=""
            onChange={() => {}}
            isLoading={true}
            wrapperClassName="w-[400px]"
          />
        </div>
      </div>
    );
  }

  if (!commodity) {
    return (
      <div className='px-6 pt-1 bg-white'>
        <EditHeader
          title="Ubah Komoditas"
          userName={undefined}
          saveHandle={handleSave}
          isPending={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Komoditas tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-6 pt-1 bg-white'>
      <EditHeader 
        title="Ubah Komoditas"
        userName={commodity.name}
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
          label="Nama Komoditas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Komoditas"
          isLoading={false}
          wrapperClassName="w-[400px]"
        />

        {/* Code Input */}
        <SkeletonInput
          label="Kode Komoditas"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kode Komoditas"
          isLoading={false}
          wrapperClassName="w-[400px]"
        />
      </div>
    </div>
  )
}
