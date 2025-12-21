import { createFileRoute, useParams, useNavigate, Link } from '@tanstack/react-router'
import DetailHeader from '../../../../../../components/headers/DetailHeader'
import { queryKeys } from '../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { Loader2, Search, Eye, Pencil } from 'lucide-react'
import { useState } from 'react'
import PrimaryButton from '../../../../../../components/buttons/PrimaryButton'

export const Route = createFileRoute(
  '/client/company/$companyName/batch/$batchId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, batchId } = useParams({ from: '/client/company/$companyName/batch/$batchId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'sumber' | 'attribute'>('sumber')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by filtering in the render
  }

  const handleCreateSource = () => {
    navigate({ to: '/client/company/$companyName/batch/$batchId/source/create' as any, params: { companyName, batchId } as any })
  }

  const handleCreateAttribute = () => {
    navigate({ to: '/client/company/$companyName/batch/$batchId/attribute/create' as any, params: { companyName, batchId } as any })
  }

  // Fetch company data to get companyId
  const { data: companyData } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch batch data
  const { data: batchData, isLoading, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchById(companyData.company.id, batchId) : ['batch', batchId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const batch = batchData?.batch

  // Fetch batch sources
  const { data: batchSourcesData, isLoading: isLoadingSources } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchSources(companyData.company.id, batchId) : ['batchSources', batchId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).source.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id && !!batch,
  });

  // Fetch batch attributes
  const { data: batchAttributesData, isLoading: isLoadingAttributes } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchAttributes(companyData.company.id, batchId) : ['batchAttributes', batchId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).attribute.get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id && !!batch,
  });

  const batchSources = batchSourcesData?.batchSources || [];
  const batchAttributes = batchAttributesData?.batchAttributes || [];
  
  // Filter batch sources based on search query
  const filteredBatchSources = searchQuery.trim() === '' 
    ? batchSources 
    : batchSources.filter((source: any) => 
        source.farmerGroup?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.land?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.land?.location.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Filter batch attributes based on search query
  const filteredBatchAttributes = searchQuery.trim() === '' 
    ? batchAttributes 
    : batchAttributes.filter((attr: any) => 
        attr.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (attr.unit && attr.unit.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Delete batch mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete batch');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batches(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/batch', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus batch');
    },
  });

  const handleEdit = () => {
    navigate({ to: '/client/company/$companyName/batch/$batchId/edit' as any, params: { companyName, batchId } as any })
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus batch ini?')) {
      deleteMutation.mutate();
    }
  }

  if (isLoading || isLoadingSources || isLoadingAttributes || !companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || 'Batch tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title={`Lihat Batch: ${batch.lotCode}`} 
        handleDelete={handleDelete} 
        handleEdit={handleEdit} 
      />

      <div className="space-y-6">
        {/* Batch Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Lot Code
            </label>
            <p className='text-sm'>{batch.lotCode}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Komoditas
            </label>
            <p className='text-sm'>{batch.commodity?.name || '-'} ({batch.commodity?.code || '-'})</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tanggal Panen
            </label>
            <p className='text-sm'>{new Date(batch.harvestDate).toLocaleDateString('id-ID')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Total (Kg)
            </label>
            <p className='text-sm'>{batch.totalKg}</p>
          </div>
        </div>

      </div>

      <div className="flex items-center space-x-10 mb-4 mt-[50px]">
        <h1 className="text-2xl font-bold text-black">
          {activeTab === 'sumber' ? 'Sumber' : 'Attribute'}
        </h1>
        
        <div className="flex items-center gap-3 h-full">
          <button
            type="button"
            onClick={() => setActiveTab('sumber')}
            className={`text-black pb-1 pt-[13px] ${
              activeTab === 'sumber' ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
            }`}
          >
            Sumber
          </button>
          <div className="w-px h-3 bg-gray-300 self-center mt-[8px]"></div>
          <button
            type="button"
            onClick={() => setActiveTab('attribute')}
            className={`text-black pb-1 pt-[13px] ${
              activeTab === 'attribute' ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
            }`}
          >
            Attribute
          </button>
        </div>
        
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
          <PrimaryButton 
            title={"Tambah"} 
            handle={activeTab === 'sumber' ? handleCreateSource : handleCreateAttribute} 
          />
        </div>
      </div>

      {/* Batch Sources Table */}
      {activeTab === 'sumber' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <colgroup>
              <col className="w-[200px]" />
              <col className="w-[200px]" />
              <col className="w-[150px]" />
              <col className="w-[100px]" />
              <col className="w-auto" />
            </colgroup>
            
            <thead>
              <tr className="border border-gray-200 bg-gray-100">
                <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Kelompok</th>
                <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Lahan</th>
                <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Volume (Kg)</th>
                <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            
            <tbody>
              {filteredBatchSources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-2 text-center text-gray-500">
                    {searchQuery.trim() === '' ? 'Tidak ada sumber batch' : 'Tidak ada sumber batch yang ditemukan'}
                  </td>
                </tr>
              ) : (
                filteredBatchSources.map((source: any) => (
                  <tr key={source.id} className="border-b border-gray-200">
                    <td className="py-3 pl-5 pr-1">
                      <span className="text-sm text-black">{source.farmerGroup?.name || '-'}</span>
                    </td>
                    <td className="py-3 pl-1 pr-1">
                      <span className="text-sm text-black">{source.land?.name || '-'}</span>
                    </td>
                    <td className="py-3 pl-1 pr-1">
                      <span className="text-sm text-black">{source.volumeKg}</span>
                    </td>
                    <td className="py-3 pl-1 pr-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={"/client/company/$companyName/batch/$batchId/source/$sourceId" as any}
                          params={{ companyName, batchId, sourceId: source.id } as any}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Link>
                        <Link
                          to={"/client/company/$companyName/batch/$batchId/source/$sourceId/edit" as any}
                          params={{ companyName, batchId, sourceId: source.id } as any}
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
      )}

      {/* Batch Attributes Table */}
      {activeTab === 'attribute' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <colgroup>
              <col className="w-[200px]" />
              <col className="w-[200px]" />
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[100px]" />
              <col className="w-auto" />
            </colgroup>
            
            <thead>
              <tr className="border border-gray-200 bg-gray-100">
                <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Key</th>
                <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Value</th>
                <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Unit</th>
                <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Recorded At</th>
                <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            
            <tbody>
              {filteredBatchAttributes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-2 text-center text-gray-500">
                    {searchQuery.trim() === '' ? 'Tidak ada attribute batch' : 'Tidak ada attribute batch yang ditemukan'}
                  </td>
                </tr>
              ) : (
                filteredBatchAttributes.map((attr: any) => (
                  <tr key={attr.id} className="border-b border-gray-200">
                    <td className="py-3 pl-5 pr-1">
                      <span className="text-sm text-black">{attr.key}</span>
                    </td>
                    <td className="py-3 pl-1 pr-1">
                      <span className="text-sm text-black">{attr.value}</span>
                    </td>
                    <td className="py-3 pl-1 pr-1">
                      <span className="text-sm text-black">{attr.unit || '-'}</span>
                    </td>
                    <td className="py-3 pl-1 pr-1">
                      <span className="text-sm text-black">
                        {new Date(attr.recordedAt).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 pl-1 pr-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={"/client/company/$companyName/batch/$batchId/attribute/$attributeId" as any}
                          params={{ companyName, batchId, attributeId: attr.id } as any}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Link>
                        <Link
                          to={"/client/company/$companyName/batch/$batchId/attribute/$attributeId/edit" as any}
                          params={{ companyName, batchId, attributeId: attr.id } as any}
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
      )}
    </div>
  )
}
