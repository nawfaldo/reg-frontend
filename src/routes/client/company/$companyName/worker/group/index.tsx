import { Link, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Eye, Pencil } from 'lucide-react'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import WorkerHeader from '../../../../../../component/headers/WorkerHeader'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/group/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/worker/group/' })

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  const { data: farmerGroupsData, isLoading: isLoadingGroups, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.farmerGroups(companyData.company.id) : ['company', companyData?.company?.id, 'farmerGroups'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).worker.group.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  if (isLoadingCompany || isLoadingGroups) {
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

  const farmerGroups = farmerGroupsData?.farmerGroups || [];

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <WorkerHeader />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-[300px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
            <col className="w-auto" />
          </colgroup>
          
          <thead>
            <tr className="border border-gray-200 bg-gray-100">
              <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama Kelompok</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Jumlah Pekerja</th>
              <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          
          <tbody>
            {farmerGroups.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 px-2 text-center text-gray-500">
                  Tidak ada kelompok
                </td>
              </tr>
            ) : (
              farmerGroups.map((group: any) => (
                <tr key={group.id} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <span className="text-sm text-black">{group.name}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{group.farmers && Array.isArray(group.farmers) ? group.farmers.length : 0}</span>
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={"/client/company/$companyName/worker/group/$farmerGroupId" as any}
                        params={{ companyName, farmerGroupId: group.id } as any}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Lihat"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </Link>
                      <Link
                        to={"/client/company/$companyName/worker/group/$farmerGroupId/edit" as any}
                        params={{ companyName, farmerGroupId: group.id } as any}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-black" />
                      </Link>
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
