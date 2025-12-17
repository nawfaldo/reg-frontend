import { createFileRoute, useNavigate, useParams, Link } from '@tanstack/react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { User, Loader2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute(
  '/client/companies/$companyName/user/$userId/update',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, userId } = useParams({ from: '/client/companies/$companyName/user/$userId/update' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState('');
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

  // Fetch company detail to get member info
  const { data: companyDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['company', company?.id],
    queryFn: async () => {
      if (!company?.id) throw new Error('Company ID not found');
      const response = await fetch(`http://localhost:3000/api/company/${company.id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch company details');
      return response.json();
    },
    enabled: !!company?.id,
  });

  const member = companyDetail?.company?.members?.find((m: any) => m.id === userId);

  // Fetch roles for this company
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['company-roles', company?.id],
    queryFn: async () => {
      if (!company?.id) throw new Error('Company ID not found');
      const response = await fetch(`http://localhost:3000/api/company/${company.id}/roles`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
    enabled: !!company?.id,
  });

  const roles = rolesData?.roles || [];
  const availableRoles = roles.filter((r: any) => r.name !== 'owner');

  // Set initial role when member data is loaded
  useEffect(() => {
    if (member && roles.length > 0) {
      const currentRole = roles.find((r: any) => r.name === member.role);
      if (currentRole) {
        setSelectedRoleId(currentRole.id);
      }
    }
  }, [member, roles]);

  const updateMutation = useMutation({
    mutationFn: async (roleId: string) => {
      if (!company?.id) throw new Error('Company ID not found');
      const response = await fetch(`http://localhost:3000/api/company/${company.id}/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roleId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
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
    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }
    if (member?.role === 'owner') {
      setError('Cannot edit owner role');
      return;
    }
    updateMutation.mutate(selectedRoleId);
  };

  if (isLoadingDetail || isLoadingRoles) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

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

  if (!member) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Member not found</p>
          <Link
            to="/client/companies/$companyName"
            params={{ companyName }}
            search={{ success: undefined }}
            className="mt-2 inline-block text-sm text-red-600 hover:text-red-800"
          >
            ← Back to {companyName}
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = member.role === 'owner';

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
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
            <p className="text-sm text-gray-500">Update role for {member.name}</p>
          </div>
        </div>

        {/* Member Info */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                {member.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-600">{member.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Current role: <span className="font-medium capitalize">{member.role}</span>
              </p>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Owner role cannot be edited. Owner role is protected.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : availableRoles.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No roles available</p>
            ) : (
              <select
                id="role"
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(e.target.value);
                  setError(null);
                }}
                disabled={isOwner}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!selectedRoleId || updateMutation.isPending || isOwner}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
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
