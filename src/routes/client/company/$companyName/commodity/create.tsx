import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../../../components/headers/CreateHeader'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../lib/api'
import { queryKeys } from '../../../../../lib/query-keys'
import SkeletonInput from '../../../../../components/inputs/SkeletonInput'
import { usePermissions } from '../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/commodity/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/commodity/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

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

  // Create commodity mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).commodity.post(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to create commodity');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.commodities(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/commodity', params: { companyName } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama komoditas tidak boleh kosong');
      return;
    }

    if (!code || code.trim().length === 0) {
      setError('Kode komoditas tidak boleh kosong');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      code: code.trim(),
    });
  }

  const isLoading = !companyData;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('commodity:create')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk membuat komoditas</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='px-6 pt-1 bg-white'>
        <CreateHeader title='Tambah Komoditas' createHandle={handleCreate} isPending={false} />
        
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

  return (
    <div className='px-6 pt-1 bg-white'>
      <CreateHeader 
        title='Tambah Komoditas' 
        createHandle={handleCreate} 
        isPending={createMutation.isPending}
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
