import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import EditHeader from '../../../../../../../components/headers/EditHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import SkeletonInput from '../../../../../../../components/inputs/SkeletonInput'
import GroupedSkeletonDropdown from '../../../../../../../components/inputs/GroupedSkeletonDropdown'

export const Route = createFileRoute('/client/company/$companyName/admin/role/$roleId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, roleId } = useParams({ from: '/client/company/$companyName/admin/role/$roleId/edit' })
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

  // Fetch role data
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.role(companyData.company.id, roleId) : ['company', companyData?.company?.id, 'roles', roleId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).roles({ roleId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
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

  // Pre-fill form when role data is loaded
  useEffect(() => {
    if (roleData?.role) {
      setName(roleData.role.name);
      setSelectedPermissions(roleData.role.permissions?.map((p: any) => p.id) || []);
    }
  }, [roleData]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; permissionIds?: string[] }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).roles({ roleId }).put(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to update role');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.roles(companyData.company.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.role(companyData.company.id, roleId) });
      }
      navigate({ to: '/client/company/$companyName/admin/role/$roleId', params: { companyName, roleId } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const saveHandle = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama peran tidak boleh kosong');
      return;
    }

    updateMutation.mutate({
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

  const isLoading = isLoadingCompany || isLoadingRole || isLoadingPermissions;
  const role = roleData?.role;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('admin:role:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah peran</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <EditHeader
          title="Ubah Peran"
          userName={undefined}
          saveHandle={saveHandle}
          isPending={false}
          isLoadingUserName={true}
        />
        
        <div className="space-y-6">
          {/* Name Input Skeleton */}
          <SkeletonInput
            label="Name"
            value=""
            onChange={() => {}}
            isLoading={true}
            wrapperClassName="w-[400px]"
          />
          
          {/* Permissions Select Skeleton */}
          <GroupedSkeletonDropdown
            label="Perizinan"
            placeholder="Pilih izin"
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

  if (!role) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <EditHeader
          title="Ubah Peran"
          userName={undefined}
          saveHandle={saveHandle}
          isPending={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Role not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <EditHeader
        title="Ubah Peran"
        userName={role.name}
        saveHandle={saveHandle}
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
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          isLoading={isLoading}
          wrapperClassName="w-[400px]"
        />

        {/* Permissions Select */}
        <GroupedSkeletonDropdown
          label="Perizinan"
          placeholder="Pilih izin"
          items={permissions.map((p: any) => ({ id: p.id, name: p.name, desc: p.desc }))}
          selectedIds={selectedPermissions}
          onAdd={handleAddPermission}
          onRemove={handleRemovePermission}
          isLoading={isLoadingRole || !roleData?.role}
          isLoadingItems={isLoadingPermissions}
        />
      </div>
    </div>
  )
}
