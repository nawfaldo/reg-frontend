import { createFileRoute, useNavigate, useParams, Link } from '@tanstack/react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute(
  '/client/companies/$companyName/user/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/companies/$companyName/user/create' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const searchUser = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/company/users/search?email=${encodeURIComponent(email.trim())}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'User not found');
      }
      const data = await response.json();
      setSearchedUser(data.user);
    } catch (err: any) {
      setError(err.message);
      setSearchedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      if (!company?.id) throw new Error('Company ID not found');
      const response = await fetch(`http://localhost:3000/api/company/${company.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, roleId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add member');
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
    if (!searchedUser) {
      setError('Please search for a user first');
      return;
    }
    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }
    createMutation.mutate({ userId: searchedUser.id, roleId: selectedRoleId });
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
            <UserPlus className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Member</h1>
            <p className="text-sm text-gray-500">Add a new member to {companyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                  setSearchedUser(null);
                }}
                placeholder="Enter user email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                autoFocus
              />
              <button
                type="button"
                onClick={searchUser}
                disabled={!email.trim() || isSearching}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>

          {searchedUser && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                {searchedUser.image ? (
                  <img
                    src={searchedUser.image}
                    alt={searchedUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {searchedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{searchedUser.name}</p>
                  <p className="text-xs text-gray-600">{searchedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {searchedUser && (
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!searchedUser || !selectedRoleId || createMutation.isPending}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
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
