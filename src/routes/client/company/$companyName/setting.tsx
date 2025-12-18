import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, CheckCircle2, Building2, ArrowRight, TriangleAlert } from 'lucide-react'

export const Route = createFileRoute('/client/company/$companyName/setting')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/setting' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }
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
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  const company = data?.company;
  if (!company) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Company not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Setting</h1>
        <div className="flex items-center gap-3">
            {!company.hasActiveSubscription && (
              <Link
                to="/client/company/$companyName/billing"
                params={{ companyName: company.name }}
                className="inline-flex items-center justify-center gap-1 w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
              >
                Bayar
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          <Link
            to="/client/companies/create"
            className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all text-center block"
          >
            Ubah
          </Link>
        </div>
      </div>
      <div className="flex items-start gap-3">
        {company.image ? (
          <img
            src={company.image}
            alt={company.name}
            className="w-[100px] h-[100px] rounded-[30px] object-cover"
          />
        ) : (
          <div className="w-[50px] h-[50px] rounded-[20px] bg-gray-200 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-black">{company.name}</h1>
          {company.hasActiveSubscription && company.currentPeriodEnd ? (
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span className="text-sm text-gray-700">
                Aktif sampai {formatDate(company.currentPeriodEnd)}
              </span>
            </div>
          ):
            <div className="flex items-center gap-1.5 mt-1">  
              <TriangleAlert className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">Tidak ada subskripsi</span>
            </div>
          }
        </div>
      </div>
    </div>
  )
}
