import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Building2, Plus, Crown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/client/companies/')({
  component: RouteComponent,
})

function RouteComponent() {
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
          <p className="text-red-800">Error loading companies: {error.message}</p>
        </div>
      </div>
    );
  }

  const companies = data?.companies || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">Manage your companies and subscriptions</p>
        </div>
        <Link
          to="/client/companies/create"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Create Company
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies yet</h3>
          <p className="text-gray-500 mb-4">Create your first company to get started</p>
          <Link
            to="/client/companies/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Create Company
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company: any) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.role === "owner" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                        <Crown className="w-4 h-4" />
                        Owner
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 capitalize">{company.role || "Member"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {company.hasActiveSubscription ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-700 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">No Subscription</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {company.hasActiveSubscription ? (
                        <Link
                          to="/client/company/$companyName/dashboard"
                          params={{ companyName: company.name }}
                          className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                          Activate
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          title="Company needs an active subscription to activate"
                        >
                          Activate
                        </button>
                      )}
                      <Link
                        to="/client/companies/$companyName"
                        params={{ companyName: company.name }}
                        search={{
                          success: undefined,
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Details
                      </Link>
                      {!company.hasActiveSubscription && (
                        <Link
                          to="/client/companies/$companyName/billing"
                          params={{ companyName: company.name }}
                          search={{
                            reason: undefined,
                            success: undefined,
                            canceled: undefined,
                          }}
                          className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                          Subscribe
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
  );
}
