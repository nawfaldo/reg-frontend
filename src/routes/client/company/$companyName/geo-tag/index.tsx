import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Eye, Pencil, Search } from 'lucide-react'
import { server } from '../../../../../lib/api'
import { queryKeys } from '../../../../../lib/query-keys'
import PrimaryButton from '../../../../../components/buttons/PrimaryButton'
import Skeleton from '../../../../../components/Skeleton'
import { usePermissions } from '../../../../../hooks/usePermissions'

export const Route = createFileRoute('/client/company/$companyName/geo-tag/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/geo-tag/' })
  const navigate = useNavigate()
  const { hasPermission } = usePermissions(companyName)
  const [searchQuery, setSearchQuery] = useState('')

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

  const isLoading = isLoadingCompany || isLoadingLands;

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('land:view')) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat daftar lahan</p>
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

  const lands = landsData?.lands || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering lands below
  };

  const handleCreate = () => {
    navigate({ to: '/client/company/$companyName/geo-tag/create', params: { companyName } })
  }

  // Filter lands based on search query
  const filteredLands = lands.filter((land: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      land.name?.toLowerCase().includes(query) ||
      land.location?.toLowerCase().includes(query) ||
      land.latitude?.toString().includes(query) ||
      land.longitude?.toString().includes(query)
    );
  });

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-center space-x-10 mb-4">
        <h1 className="text-2xl font-bold text-black">Lahan</h1>
        
        <div>
          {isLoading ? (
            <Skeleton width={200} height={36} borderRadius={0} />
          ) : (
            <form onSubmit={handleSearch} className=''>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-full pl-9 pr-16 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1 font-medium text-black text-sm bg-white border border-gray-300 border-b-5 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
                >
                  Go!
                </button>
              </div>
            </form>
          )}
        </div>
        
        {isLoading ? (
          <div className="ml-auto">
            <Skeleton width={90} height={36} borderRadius={4} />
          </div>
        ) : hasPermission('land:create') && (
          <div className='ml-auto'>
            <PrimaryButton title={"Tambah"} handle={handleCreate} />
          </div>
        )}
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
            {isLoading ? (
              // Show 3 skeleton rows while loading
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <Skeleton width={120} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={150} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={60} height={16} />
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <Skeleton width={100} height={16} />
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
            ) : filteredLands.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-2 text-center text-gray-500">
                  {searchQuery.trim() === '' ? 'Tidak ada lahan' : 'Tidak ada lahan yang ditemukan'}
                </td>
              </tr>
            ) : (
              filteredLands.map((land: any) => (
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
                      {hasPermission('land:view') && (
                        <Link
                          to="/client/company/$companyName/geo-tag/$landId"
                          params={{ companyName, landId: land.id }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Link>
                      )}
                      {hasPermission('land:update') && (
                        <Link
                          to="/client/company/$companyName/geo-tag/$landId/edit"
                          params={{ companyName, landId: land.id }}
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
