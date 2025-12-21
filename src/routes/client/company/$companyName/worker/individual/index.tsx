import { Link, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil } from 'lucide-react'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import WorkerHeader from '../../../../../../components/headers/WorkerHeader'
import Skeleton from '../../../../../../components/Skeleton'
import { usePermissions } from '../../../../../../hooks/usePermissions'

export const Route = createFileRoute(
  '/client/company/$companyName/worker/individual/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/worker/individual/' })
  const { hasPermission } = usePermissions(companyName)

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

  const isLoading = isLoadingCompany || isLoadingFarmers;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('worker:individual:view')) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat daftar pekerja</p>
        </div>
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
      <WorkerHeader isLoading={isLoading} />

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
            {isLoading ? (
              // Show 3 skeleton rows while loading
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <Skeleton width={120} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={100} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={100} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={150} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={100} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Skeleton width={16} height={16} circle />
                      <Skeleton width={16} height={16} circle />
                    </div>
                  </td>
                  <td className="py-3"></td>
                </tr>
              ))
            ) : farmers.length === 0 ? (
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
                      {hasPermission('worker:individual:view') && (
                        <Link
                          to={"/client/company/$companyName/worker/individual/$farmerId" as any}
                          params={{ companyName, farmerId: farmer.id } as any}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Link>
                      )}
                      {hasPermission('worker:individual:update') && (
                        <Link
                          to={"/client/company/$companyName/worker/individual/$farmerId/edit" as any}
                          params={{ companyName, farmerId: farmer.id } as any}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-black" />
                        </Link>
                      )}
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

