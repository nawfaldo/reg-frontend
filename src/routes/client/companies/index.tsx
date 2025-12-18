import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, ArrowRight, Building2 } from 'lucide-react'

export const Route = createFileRoute('/client/companies/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('https://reg-backend-psi.vercel.app/api/company', {
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
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Perusahaan</h1>
        
        <div className="flex items-center gap-3">
          <Link
            to="/client/companies/create"
            className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all text-center block"
          >
            Tambah
          </Link>
        </div>
      </div>

      {companies.length === 0 ? (
        <h3 className="text-lg font-light text-gray-900">
          Belum ada perusahaan
        </h3>
      ) : (
        <div className="space-y-3">
          {companies.map((company: any) => (
            <div key={company.id} className="bg-gray-100 border border-gray-200 p-3 max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                {company.image ? (
                  <img
                    src={company.image}
                    alt={company.name}
                    className="w-[50px] h-[50px] rounded-[20px] object-cover"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-[20px] bg-gray-200 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {company.name}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/client/company/$companyName/setting"
                  params={{ companyName: company.name }}
                  className="inline-flex items-center justify-center gap-1 w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
                >
                  Konsol
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
