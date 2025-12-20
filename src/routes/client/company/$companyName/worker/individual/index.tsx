import { Link, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Eye, Pencil } from 'lucide-react'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import WorkerHeader from '../../../../../../component/headers/WorkerHeader'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/individual/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/worker/individual/' })

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  const { data: farmersData, isLoading: isLoadingFarmers, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmers(companyData.company.id) : ['company', companyData?.company?.id, 'farmers'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.individual.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  if (isLoadingCompany || isLoadingFarmers) {
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

  const farmers = farmersData?.farmers || [];

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <WorkerHeader />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-[200px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[250px]" />
            <col className="w-[200px]" />
            <col className="w-[100px]" />
            <col className="w-auto" />
          </colgroup>
          
          <thead>
            <tr className="border border-gray-200 bg-gray-100">
              <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama Lengkap</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">NIK</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Nomor Telepon</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Alamat</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Kelompok</th>
              <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          
          <tbody>
            {farmers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-2 text-center text-gray-500">
                  Tidak ada pekerja
                </td>
              </tr>
            ) : (
              farmers.map((farmer: any) => (
                <tr key={farmer.id} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <span className="text-sm text-black">{farmer.firstName} {farmer.lastName}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{farmer.nationalId}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{farmer.phoneNumber}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{farmer.address || '-'}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">
                      {farmer.farmerGroups && farmer.farmerGroups.length > 0
                        ? farmer.farmerGroups.map((g: any) => g.name).join(', ')
                        : '-'}
                    </span>
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={"/client/company/$companyName/worker/individual/$farmerId" as any}
                        params={{ companyName, farmerId: farmer.id } as any}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Lihat"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </Link>
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                        onClick={() => {
                          // TODO: Implement edit farmer
                          console.log('Edit farmer:', farmer.id);
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

