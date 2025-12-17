import { createFileRoute, Link, useParams, useSearch } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Crown, CheckCircle2, XCircle, Loader2, ArrowLeft, Calendar, Users, Shield, Edit, Key, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/client/companies/$companyName/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      success: search.success as string | undefined,
    };
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/companies/$companyName/' });
  const search = useSearch({ from: '/client/companies/$companyName/' });
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'permissions'>('members');

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/company', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  const companies = data?.companies || [];
  const company = companies.find((c: any) => c.name === companyName);

  // Fetch detailed company info with members - must be called before conditional returns
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading company: {error.message}</p>
        </div>
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

  const companyData = companyDetail?.company || company;
  const members = companyData.members || [];

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
    enabled: !!company?.id && activeTab === 'roles',
  });

  const roles = rolesData?.roles || [];

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
    enabled: activeTab === 'permissions',
  });

  const permissions = permissionsData?.permissions || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        to="/client/companies"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {search.success === "true" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800">
              Pembayaran berhasil! Langganan Anda sekarang aktif. 🎉
            </p>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{companyData.name}</h1>
              <div className="flex items-center gap-4">
                {companyData.role === "owner" && (
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Crown className="w-4 h-4" />
                    Owner
                  </span>
                )}
                {companyData.role && companyData.role !== "owner" && (
                  <span className="text-sm text-gray-500 capitalize">Role: {companyData.role}</span>
                )}
                <div className="flex items-center gap-2">
                  {companyData.hasActiveSubscription ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700 font-medium">Active Subscription</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">No Subscription</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {companyData.hasActiveSubscription ? (
            <Link
              to="/client/company/$companyName/dashboard"
              params={{ companyName: companyData.name }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Activate
            </Link>
          ) : (
            <>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                title="Company needs an active subscription to activate"
              >
                Activate
              </button>
              <Link
                to="/client/companies/$companyName/billing"
                params={{ companyName: companyData.name }}
                search={{
                  reason: undefined,
                  success: undefined,
                  canceled: undefined,
                }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Subscribe
              </Link>
            </>
          )}
        </div>

        {/* Company Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Created</span>
            </div>
            <p className="text-sm text-gray-600">
              {new Date(companyData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Members</span>
            </div>
            <p className="text-sm text-gray-600">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {members.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Roles
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {roles.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Permissions
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {permissions.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'members' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Members</h2>
              {companyData.role === "owner" && (
                <Link
                  to="/client/companies/$companyName/user/create"
                  params={{ companyName }}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </Link>
              )}
            </div>
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No members yet</p>
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
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      {companyData.role === "owner" && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member: any) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                {member.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">{member.name}</span>
                            {member.role === "owner" && (
                              <Crown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {member.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {member.role === "owner" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <Crown className="w-3 h-3" />
                              Owner
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 capitalize">{member.role || "Member"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                        {companyData.role === "owner" && (
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {member.role !== "owner" && (
                                <>
                                  <Link
                                    to="/client/companies/$companyName/user/$userId/update"
                                    params={{ companyName, userId: member.id }}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </Link>
                                  <DeleteMemberButton companyId={company?.id} userId={member.id} />
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'roles' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
              {companyData.role === "owner" && (
                <Link
                  to="/client/companies/$companyName/roles/create"
                  params={{ companyName }}
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Create Role
                </Link>
              )}
            </div>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">No roles yet</p>
                {companyData.role === "owner" && (
                  <Link
                    to="/client/companies/$companyName/roles/create"
                    params={{ companyName }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    <Shield className="w-4 h-4" />
                    Create First Role
                  </Link>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role: any) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {role.name === "owner" ? (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                                <Crown className="w-4 h-4" />
                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {role.name}
                              </span>
                            )}
                            {role.name === "owner" && (
                              <span className="text-xs text-gray-500">(Protected)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(role.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/client/companies/$companyName/roles/$roleId"
                              params={{ companyName, roleId: role.id }}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              View Details
                            </Link>
                            {companyData.role === "owner" && role.name !== "owner" && (
                              <Link
                                to="/client/companies/$companyName/roles/$roleId/update"
                                params={{ companyName, roleId: role.id }}
                                className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                Update
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h2>
            {isLoadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : permissions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No permissions available</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permissions.map((permission: any) => (
                      <tr key={permission.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-600">{permission.id}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteMemberButton({ companyId, userId }: { companyId?: string; userId: string }) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('Company ID not found');
      const response = await fetch(`http://localhost:3000/api/company/${companyId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsDeleting(false);
    },
    onError: (err: Error) => {
      alert(err.message);
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this member?')) {
      setIsDeleting(true);
      deleteMutation.mutate();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || deleteMutation.isPending}
      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
    >
      {isDeleting || deleteMutation.isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      Delete
    </button>
  );
}
