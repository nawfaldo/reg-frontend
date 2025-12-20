import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Eye, Pencil, Search } from 'lucide-react'
import { server } from '../../../../../lib/api'
import { queryKeys } from '../../../../../lib/query-keys'
import PrimaryButton from '../../../../../component/buttons/PrimaryButton'
import { useState } from 'react'

export const Route = createFileRoute('/client/company/$companyName/batch/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/batch/' })
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  const { data: batchesData, isLoading: isLoadingBatches, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batches(companyData.company.id) : ['company', companyData?.company?.id, 'batches'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search:', searchQuery)
  }

  const handleCreate = () => {
    navigate({ to: '/client/company/$companyName/batch/create', params: { companyName } })
  }

  if (isLoadingCompany || isLoadingBatches) {
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

  const batches = batchesData?.batches || [];
  // Filter batches based on search query
  const filteredBatches = searchQuery.trim() === '' 
    ? batches 
    : batches.filter((batch: any) => 
        batch.lotCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.commodity?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.commodity?.code.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-center space-x-10 mb-4">
        <h1 className="text-2xl font-bold text-black">Batch</h1>
        
        <div>
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
        </div>
        
        <div className='ml-auto'>
          <PrimaryButton title={"Tambah"} handle={handleCreate} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-[200px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
            <col className="w-auto" />
          </colgroup>
          
          <thead>
            <tr className="border border-gray-200 bg-gray-100">
              <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Lot Code</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Komoditas</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Tanggal Panen</th>
              <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Total (Kg)</th>
              <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-2 text-center text-gray-500">
                  {searchQuery.trim() === '' ? 'Tidak ada batch' : 'Tidak ada batch yang ditemukan'}
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch: any) => (
                <tr key={batch.id} className="border-b border-gray-200">
                  <td className="py-3 pl-5 pr-1">
                    <span className="text-sm text-black">{batch.lotCode}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{batch.commodity?.name || '-'}</span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">
                      {new Date(batch.harvestDate).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3 pl-1 pr-1">
                    <span className="text-sm text-black">{batch.totalKg}</span>
                  </td>
                  <td className="py-3 pl-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={"/client/company/$companyName/batch/$batchId" as any}
                        params={{ companyName, batchId: batch.id } as any}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Lihat"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </Link>
                      <Link
                        to={"/client/company/$companyName/batch/$batchId/edit" as any}
                        params={{ companyName, batchId: batch.id } as any}
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
