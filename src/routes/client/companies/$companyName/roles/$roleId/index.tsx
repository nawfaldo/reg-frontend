import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Shield, Crown, Loader2, ArrowLeft, Users, Calendar, Edit, Key } from 'lucide-react';

export const Route = createFileRoute(
  '/client/companies/$companyName/roles/$roleId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, roleId } = useParams({ from: '/client/companies/$companyName/roles/$roleId/' });

  // Get company ID
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
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

  // Fetch role details
  const { data: roleData, isLoading: isLoadingRole, error: roleError } = useQuery({
    queryKey: ['role', company?.id, roleId],
    queryFn: async () => {
      if (!company?.id) throw new Error('Company ID not found');
      const response = await fetch(`http://localhost:3000/api/company/${company.id}/roles/${roleId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch role');
      }
      return response.json();
    },
    enabled: !!company?.id,
  });

  if (isLoadingCompanies || isLoadingRole) {
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

  if (roleError || !roleData?.role) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Role not found</p>
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

  const role = roleData.role;
  const users = role.users || [];
  const permissions = role.permissions || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
              {role.name === "owner" ? (
                <Crown className="w-8 h-8 text-gray-600" />
              ) : (
                <Shield className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                {role.name === "owner" ? (
                  <span className="inline-flex items-center gap-2">
                    <Crown className="w-6 h-6" />
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </span>
                ) : (
                  role.name
                )}
              </h1>
              {role.name === "owner" && (
                <span className="text-sm text-gray-500">Protected Role</span>
              )}
            </div>
          </div>
          {company?.role === "owner" && role.name !== "owner" && (
            <Link
              to="/client/companies/$companyName/roles/$roleId/update"
              params={{ companyName, roleId }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <Edit className="w-4 h-4" />
              Update Role
            </Link>
          )}
        </div>

        {/* Role Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Created</span>
            </div>
            <p className="text-sm text-gray-600">
              {new Date(role.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Users</span>
            </div>
            <p className="text-sm text-gray-600">{users.length} user{users.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Permissions</span>
            </div>
            <p className="text-sm text-gray-600">{permissions.length} permission{permissions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Permissions List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h2>
          {permissions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No permissions assigned to this role</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permission Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map((permission: any) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{permission.id}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users with this Role</h2>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No users assigned to this role yet</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.joinedAt
                          ? new Date(user.joinedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
