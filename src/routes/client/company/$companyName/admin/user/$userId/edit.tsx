import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import EditHeader from '../../../../../../../components/headers/EditHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import SkeletonDropdown from '../../../../../../../components/inputs/SkeletonDropdown'

export const Route = createFileRoute('/client/company/$companyName/admin/user/$userId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, userId } = useParams({ from: '/client/company/$companyName/admin/user/$userId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
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

  // Fetch company admins to get user details
  const { data: adminsData, isLoading: isLoadingAdmins } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.admins(companyData.company.id) : ['company', companyData?.company?.id, 'admins'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.roles(companyData.company.id) : ['company', companyData?.company?.id, 'roles'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).roles.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  // Pre-fill form when user data is loaded
  useEffect(() => {
    // Backend still returns 'members' in the response
    const admins = adminsData?.company?.admins || adminsData?.company?.members || [];
    if (admins.length > 0) {
      const user = admins.find((admin: any) => admin.id === userId);
      if (user && user.roles) {
        setSelectedRoleIds(user.roles.map((role: any) => role.id));
      }
    }
  }, [adminsData, userId]);

  const updateMutation = useMutation({
    mutationFn: async (data: { roleIds: string[] }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      // Delete all existing UserCompany records for this user
      try {
        const deleteResult = await (server.api.company as any)({ id: companyData.company.id }).admins({ userId }).delete();
        if ('error' in deleteResult && deleteResult.error) {
          // Ignore 404 errors as the user might not have existing roles
          if (deleteResult.error !== 'Not found') {
            throw new Error((deleteResult.error as any).value?.error || 'Failed to remove existing roles');
          }
        }
      } catch (err: any) {
        // Ignore 404 errors
        if (err.message && !err.message.includes('404') && !err.message.includes('Not found')) {
          throw err;
        }
      }

      // Add new roles
      if (data.roleIds.length > 0) {
        const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).admins.post({
          userId: userId,
          roleIds: data.roleIds,
        });
        if (error) throw error;
        if ('error' in response && response.error) {
          throw new Error((response.error as any).value?.error || 'Failed to update admin roles');
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.admins(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/admin/user/$userId', params: { companyName, userId } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const saveHandle = () => {
    setError(null);

    if (selectedRoleIds.length === 0) {
      setError('Silakan pilih minimal satu role');
      return;
    }

    updateMutation.mutate({
      roleIds: selectedRoleIds,
    });
  }

  const roles = rolesData?.roles || [];
  // Use all roles for display (so owner role can appear in tags if user has it)
  // Owner role will be filtered in handleAddRole to prevent adding it

  const handleAddRole = (roleId: string) => {
    // Prevent adding owner role
    const roleToAdd = roles.find((r: any) => r.id === roleId);
    if (roleToAdd && roleToAdd.name === 'owner') {
      return; // Don't allow adding owner role
    }
    if (!selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  }

  const handleRemoveRole = (roleId: string) => {
    setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
  }

  const isLoading = isLoadingCompany || isLoadingAdmins || isLoadingRoles;
  // Backend still returns 'members' in the response, use fallback
  const admins = adminsData?.company?.admins || adminsData?.company?.members || [];
  const user = admins.find((admin: any) => admin.id === userId);

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('admin:user:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah anggota</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <EditHeader
          title="Ubah Anggota"
          userName={undefined}
          saveHandle={saveHandle}
          isPending={false}
          isLoadingUserName={isLoadingAdmins || !user}
        />
        
        <div className="space-y-6">
          {/* Role Select Skeleton */}
          <SkeletonDropdown
            label="Peran"
            placeholder="Pilih peran"
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

  if (!user) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <EditHeader
          title="Ubah Admin"
          userName={undefined}
          saveHandle={saveHandle}
          isPending={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <EditHeader
        title="Ubah Admin"
        userName={user.name}
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
        {/* Role Select */}
        <SkeletonDropdown
          label="Peran"
          placeholder="Pilih peran"
          items={roles.map((role: any) => ({ id: role.id, name: role.name }))}
          selectedIds={selectedRoleIds}
          onAdd={handleAddRole}
          onRemove={handleRemoveRole}
          isLoading={isLoadingAdmins || !user}
          isLoadingItems={isLoadingRoles}
        />
      </div>
    </div>
  )
}
