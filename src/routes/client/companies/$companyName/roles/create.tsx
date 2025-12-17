import { createFileRoute, useNavigate, useParams, Link } from '@tanstack/react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute(
  '/client/companies/$companyName/roles/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/companies/$companyName/roles/create' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get company ID
  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/company', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  const companies = companiesData?.companies || [];
  const company = companies.find((c: any) => c.name === companyName);

  // Fetch permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/company/permissions', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
  });

  const permissions = permissionsData?.permissions || [];

  const createMutation = useMutation({
    mutationFn: async ({ name, permissionIds }: { name: string; permissionIds: string[] }) => {
      if (!company?.id) throw new Error('Company not found');
      const response = await fetch(`http://localhost:3000/api/company/${company.id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, permissionIds: permissionIds.length > 0 ? permissionIds : undefined }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-roles', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['company', company?.id] });
      navigate({ 
        to: '/client/companies/$companyName',
        params: { companyName },
        search: { success: undefined },
      });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }
    if (roleName.toLowerCase() === 'owner') {
      setError('Cannot create owner role. Owner role is automatically created.');
      return;
    }
    createMutation.mutate({ name: roleName.trim(), permissionIds: selectedPermissions });
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (!company) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Company not found</p>
          <Link
            to="/client/companies"
            className="mt-2 inline-block text-sm text-red-600 hover:text-red-800"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        to="/client/companies/$companyName"
        params={{ companyName }}
        search={{ success: undefined }}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {companyName}
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
            <p className="text-sm text-gray-500">Add a new role for {companyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <input
              id="name"
              type="text"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                setError(null);
              }}
              placeholder="Enter role name (e.g., admin, manager)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500">
              {roleName.length}/50 characters
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Note: Role name will be converted to lowercase. "owner" role cannot be created.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            {isLoadingPermissions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : permissions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No permissions available</p>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {permissions.map((permission: any) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{permission.id}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!roleName.trim() || createMutation.isPending}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </button>
            <Link
              to="/client/companies/$companyName"
              params={{ companyName }}
              search={{ success: undefined }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
