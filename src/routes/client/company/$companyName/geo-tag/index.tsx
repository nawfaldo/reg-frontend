import { Link, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Eye, Pencil } from 'lucide-react'
import { server } from '../../../../../lib/api'
import { queryKeys } from '../../../../../lib/query-keys'

export const Route = createFileRoute('/client/company/$companyName/geo-tag/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/geo-tag/' })

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  const { data: landsData, isLoading: isLoadingLands, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.land(companyData.company.id) : ['company', companyData?.company?.id, 'land'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).land.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  if (isLoadingCompany || isLoadingLands) {
    return (
      <div className="px-6 pt-6 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const lands = landsData?.lands || [];

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Lahan</h1>
        
        <div className="flex items-center gap-3">
          <Link
            to="/client/company/$companyName/geo-tag/create"
            params={{ companyName: companyName }}
            className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all text-center block"
          >
            Tambah
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-[200px]" />
            <col className="w-[250px]" />
            <col className="w-[120px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
            <col className="w-auto" />
          </colgroup>
          
          <thead>
            <tr className="border border-gray-200 bg-gray-100">
              <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Lokasi</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Luas (Ha)</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Latitude</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Longitude</th>
              <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          
          <tbody>
            {lands.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-2 text-center text-gray-500">
                  Tidak ada lahan
                </td>
              </tr>
            ) : (
              lands.map((land: any) => (
                <tr key={land.id} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <span className="text-sm text-black">{land.name}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{land.location || '-'}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{land.areaHectares.toFixed(2)}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{land.latitude.toFixed(6)}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{land.longitude.toFixed(6)}</span>
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/client/company/$companyName/geo-tag/$landId"
                        params={{ companyName, landId: land.id }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Lihat"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </Link>
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                        onClick={() => {
                          // TODO: Implement edit land
                          console.log('Edit land:', land.id);
                        }}
                      >
                        <Pencil className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
