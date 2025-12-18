import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, X } from 'lucide-react'
import EditHeader from '../../../../../../../component/headers/EditHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'

export const Route = createFileRoute('/client/company/$companyName/member/user/$userId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, userId } = useParams({ from: '/client/company/$companyName/member/user/$userId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch company ID
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }
      return response.json();
    },
  });

  // Fetch company members to get user details
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['company', companyData?.company?.id, 'members'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/company/${companyData.company.id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch members');
      }
      return response.json();
    },
    enabled: !!companyData?.company?.id,
  });

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['company', companyData?.company?.id, 'roles'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/company/${companyData.company.id}/roles`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch roles');
      }
      return response.json();
    },
    enabled: !!companyData?.company?.id,
  });

  // Pre-fill form when user data is loaded
  useEffect(() => {
    if (membersData?.company?.members) {
      const user = membersData.company.members.find((member: any) => member.id === userId);
      if (user && user.roles) {
        setSelectedRoleIds(user.roles.map((role: any) => role.id));
      }
    }
  }, [membersData, userId]);

  const updateMutation = useMutation({
    mutationFn: async (data: { roleIds: string[] }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      // Delete all existing UserCompany records for this user
      const existingRecords = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/company/${companyData.company.id}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!existingRecords.ok && existingRecords.status !== 404) {
        const errorData = await existingRecords.json();
        throw new Error(errorData.error || 'Failed to remove existing roles');
      }

      // Add new roles
      if (data.roleIds.length > 0) {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/company/${companyData.company.id}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: userId,
            roleIds: data.roleIds,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update member roles');
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyData?.company?.id, 'members'] });
      navigate({ to: '/client/company/$companyName/member/user/$userId', params: { companyName, userId } });
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
  // Filter out owner role and already selected roles
  const availableRoles = roles.filter((role: any) => 
    role.name !== 'owner' && !selectedRoleIds.includes(role.id)
  );
  
  // Get selected role objects
  const selectedRoleObjects = roles.filter((role: any) => selectedRoleIds.includes(role.id));

  const handleAddRole = (roleId: string) => {
    if (!selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
    setIsDropdownOpen(false);
  }

  const handleRemoveRole = (roleId: string) => {
    setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
  }

  if (isLoadingCompany || isLoadingMembers || isLoadingRoles) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check permission to update user
  if (!hasPermission('member:user:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah anggota</p>
        </div>
      </div>
    );
  }

  const members = membersData?.company?.members || [];
  const user = members.find((member: any) => member.id === userId);

  if (!user) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <EditHeader
          title="Ubah Anggota"
          saveHandle={saveHandle}
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
        title={`Ubah Anggota: ${user.name}`}
        saveHandle={saveHandle}
      />
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Role Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Peran
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className="text-gray-400">
                Pilih peran
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {isLoadingRoles ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                ) : availableRoles.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada role tersedia</div>
                ) : (
                  availableRoles.map((role: any) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleAddRole(role.id)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {role.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Selected Roles Tags */}
          {selectedRoleObjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedRoleObjects.map((role: any) => (
                <div
                  key={role.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-sm"
                >
                  <span className="text-black">{role.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role.id)}
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
