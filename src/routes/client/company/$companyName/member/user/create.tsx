import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import CreateHeader from '../../../../../../component/headers/CreateHeader'
import { usePermissions } from '../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/member/user/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/member/user/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)
  const [email, setEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Fetch company ID
  const { data: companyData } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }
      return response.json();
    },
  });

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['company', companyData?.company?.id, 'roles'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/company/${companyData.company.id}/roles`, {
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

  const searchUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/company/users/search?email=${encodeURIComponent(email)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'User not found');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedUser(data.user);
      setError(null);
    },
    onError: (err: Error) => {
      setSelectedUser(null);
      setError(err.message);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { userId: string; roleIds: string[] }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/company/${companyData.company.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: data.userId,
          roleIds: data.roleIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyData?.company?.id] });
      navigate({ to: '/client/company/$companyName/member/user', params: { companyName } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSearch = () => {
    if (!email || email.trim().length === 0) {
      setError('Email tidak boleh kosong');
      return;
    }
    setIsSearching(true);
    searchUserMutation.mutate(email.trim(), {
      onSettled: () => {
        setIsSearching(false);
      },
    });
  }

  const handleCreate = () => {
    setError(null);

    if (!selectedUser) {
      setError('Silakan cari user terlebih dahulu');
      return;
    }

    if (selectedRoleIds.length === 0) {
      setError('Silakan pilih minimal satu role');
      return;
    }

    createMutation.mutate({
      userId: selectedUser.id,
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

  // Check permission to create user
  if (!hasPermission('member:user:create')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk menambahkan anggota</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <CreateHeader title="Tambah Anggota" createHandle={handleCreate} />
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email Input */}
        <div className='w-[467px]'>
          <label className="block text-sm font-medium text-black mb-2">
            Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="idk@idk.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-2 py-2 text-sm flex items-center gap-1 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span className='underline'>Cari</span>
            </button>
          </div>
          {selectedUser && (
            <p className="mt-2 text-sm text-gray-600">
              User ditemukan: {selectedUser.name} ({selectedUser.email})
            </p>
          )}
        </div>

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
