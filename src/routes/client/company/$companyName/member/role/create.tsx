import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import CreateHeader from '../../../../../../component/headers/CreateHeader'
import { usePermissions } from '../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/member/role/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/member/role/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)
  const [name, setName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch company ID
  const { data: companyData } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }
      return response.json();
    },
  });

  // Fetch permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await fetch('https://reg-backend-psi.vercel.app/api/company/permissions', {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch permissions');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; permissionIds?: string[] }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/company/${companyData.company.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyData?.company?.id, 'roles'] });
      navigate({ to: '/client/company/$companyName/member/role', params: { companyName } });
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
  
  // Get selected permission objects
  const selectedPermissionObjects = permissions.filter((p: any) => selectedPermissions.includes(p.id))
  
  // Get available permissions (not yet selected)
  const availablePermissions = permissions.filter((p: any) => !selectedPermissions.includes(p.id))

  const handleAddPermission = (permissionId: string) => {
    if (!selectedPermissions.includes(permissionId)) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    }
    setIsDropdownOpen(false)
  }

  const handleRemovePermission = (permissionId: string) => {
    setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId))
  }

  // Check permission to create role
  if (!hasPermission('member:role:create')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk membuat peran</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <CreateHeader
        title="Buat Peran" 
        createHandle={handleCreate} 
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
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Perizinan
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span className={selectedPermissions.length === 0 ? 'text-gray-400' : 'text-black'}>
                Pilih izin
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {isLoadingPermissions ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                ) : availablePermissions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Tidak ada perizinan tersedia</div>
                ) : (
                  availablePermissions.map((permission: any) => (
                    <button
                      key={permission.id}
                      type="button"
                      onClick={() => handleAddPermission(permission.id)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {permission.name} {permission.desc ? `- ${permission.desc}` : ''}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Selected Permissions Tags */}
          {selectedPermissionObjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPermissionObjects.map((permission: any) => (
                <div
                  key={permission.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-sm"
                >
                  <span className="text-black">{permission.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePermission(permission.id)}
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
