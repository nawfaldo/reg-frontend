import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import CreateHeader from '../../../../../../components/headers/CreateHeader'
import { usePermissions } from '../../../../../../hooks/usePermissions'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import Skeleton from '../../../../../../components/Skeleton'
import GroupedSkeletonDropdown from '../../../../../../components/inputs/GroupedSkeletonDropdown'

export const Route = createFileRoute(
  '/client/company/$companyName/admin/role/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/admin/role/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)
  const [name, setName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch company ID
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: queryKeys.company.permissions,
    queryFn: async () => {
      const { data, error } = await server.api.company.permissions.get();
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; permissionIds?: string[] }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).roles.post(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to create role');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.roles(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/admin/role', params: { companyName } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama peran tidak boleh kosong');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      permissionIds: selectedPermissions.length > 0 ? selectedPermissions : undefined,
    });
  }

  const permissions = permissionsData?.permissions || [];

  const handleAddPermission = (permissionId: string) => {
    if (!selectedPermissions.includes(permissionId)) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    }
  }

  const handleRemovePermission = (permissionId: string) => {
    setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId))
  }

  const isLoading = isLoadingCompany || isLoadingPermissions;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('admin:role:create')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk membuat peran</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <CreateHeader title="Buat Peran" createHandle={handleCreate} isPending={false} />
        
        <div className="space-y-6">
          {/* Name Input Skeleton */}
          <div>
            <Skeleton width={60} height={20} className="mb-2" />
            <Skeleton width={400} height={36} borderRadius={0} />
          </div>
          
          {/* Permissions Select Skeleton */}
          <div>
            <Skeleton width={80} height={20} className="mb-2" />
            <Skeleton width={400} height={36} borderRadius={0} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <CreateHeader
        title="Buat Peran" 
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
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="idk"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Permissions Select */}
        <GroupedSkeletonDropdown
          label="Perizinan"
          placeholder="Pilih izin"
          items={permissions.map((p: any) => ({ id: p.id, name: p.name, desc: p.desc }))}
          selectedIds={selectedPermissions}
          onAdd={handleAddPermission}
          onRemove={handleRemovePermission}
          isLoading={false}
          isLoadingItems={isLoadingPermissions}
        />
      </div>
    </div>
  )
}
