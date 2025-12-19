import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ChevronDown, X, Loader2 } from 'lucide-react'
import EditHeader from '../../../../../../../component/headers/EditHeader'
import { usePermissions } from '../../../../../../../hooks/usePermissions'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'

export const Route = createFileRoute('/client/company/$companyName/member/role/$roleId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, roleId } = useParams({ from: '/client/company/$companyName/member/role/$roleId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)
  const [name, setName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch company ID
  const { data: companyData } = useQuery({
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
      navigate({ to: '/client/company/$companyName/member/role/$roleId', params: { companyName, roleId } });
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

  if (isLoadingRole || isLoadingPermissions) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check permission to update role
  if (!hasPermission('member:role:update')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk mengubah peran</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <EditHeader
        title={`Ubah Peran: ${roleData?.role?.name || ''}`}
        saveHandle={saveHandle}
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
