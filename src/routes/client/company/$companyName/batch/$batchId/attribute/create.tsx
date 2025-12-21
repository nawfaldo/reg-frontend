import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../../../../../components/headers/CreateHeader'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../lib/api'
import { queryKeys } from '../../../../../../../lib/query-keys'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/batch/$batchId/attribute/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, batchId } = useParams({ from: '/client/company/$companyName/batch/$batchId/attribute/create' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('')
  const [recordedAt, setRecordedAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch company data
  const { data: companyData } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Create batch attribute mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      key: string;
      value: string;
      unit?: string;
      recordedAt?: string;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).attribute.post(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to create batch attribute');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchAttributes(companyData.company.id, batchId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchById(companyData.company.id, batchId) });
      }
      navigate({ to: '/client/company/$companyName/batch/$batchId', params: { companyName, batchId } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    if (!key || key.trim().length === 0) {
      setError('Key tidak boleh kosong');
      return;
    }

    if (!value || value.trim().length === 0) {
      setError('Value tidak boleh kosong');
      return;
    }

    createMutation.mutate({
      key: key.trim(),
      value: value.trim(),
      unit: unit.trim() || undefined,
      recordedAt: recordedAt || undefined,
    });
  }

  if (!companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className='px-6 pt-1 bg-white'>
      <CreateHeader title='Tambah Attribute Batch' createHandle={handleCreate} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Key Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Key"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Unit Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Unit (Optional)
          </label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Recorded At Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Recorded At
          </label>
          <input
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>
      </div>
    </div>
  )
}
