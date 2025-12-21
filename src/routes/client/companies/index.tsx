import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Building2 } from 'lucide-react'
import { server } from '../../../lib/api'
import { queryKeys } from '../../../lib/query-keys'
import Skeleton from '../../../components/Skeleton'

export const Route = createFileRoute('/client/companies/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.company.companies,
    queryFn: async () => {
      const { data, error } = await server.api.company.get();
      if (error) throw error;
      return data;
    },
  });

  const companies = data?.companies || [];

  if (isLoading) {
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

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-100 border border-gray-200 p-3 max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton width={50} height={50} borderRadius={20} />
                <Skeleton width={150} height={24} />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton width={90} height={36} borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Perusahaan</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading companies: {error.message}</p>
        </div>
      </div>
    );
  }

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
