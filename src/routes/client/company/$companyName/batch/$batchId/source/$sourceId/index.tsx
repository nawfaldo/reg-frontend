import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../../../component/headers/DetailHeader'
import { queryKeys } from '../../../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../../../lib/api'
import { Loader2 } from 'lucide-react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

// Fix icon marker bug di Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export const Route = createFileRoute(
  '/client/company/$companyName/batch/$batchId/source/$sourceId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, batchId, sourceId } = useParams({ from: '/client/company/$companyName/batch/$batchId/source/$sourceId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch company data to get companyId
  const { data: companyData } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch batch source data
  const { data: batchSourceData, isLoading, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.batchSourceById(companyData.company.id, batchId, sourceId) : ['batchSource', sourceId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).source({ sourceId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const batchSource = batchSourceData?.batchSource

  // Component to fit map bounds to polygon
  function FitBounds({ geoPolygon }: { geoPolygon: string }) {
    const map = useMap()

    useEffect(() => {
      if (geoPolygon) {
        try {
          const geoJson = JSON.parse(geoPolygon)
          if (geoJson.type === 'Polygon' && geoJson.coordinates?.[0]) {
            const coords = geoJson.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
            const bounds = L.latLngBounds(coords)
            map.fitBounds(bounds, { padding: [50, 50] })
          }
        } catch (e) {
          console.error('Error parsing geoPolygon:', e)
        }
      }
    }, [geoPolygon, map])

    return null
  }

  // Component to render GeoJSON polygon
  function GeoJSONLayer({ data }: { data: any }) {
    const map = useMap()

    useEffect(() => {
      if (data && data.type === 'Polygon') {
        const geoJsonLayer = L.geoJSON(data, {
          style: {
            color: '#3388ff',
            weight: 3,
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }
        })
        geoJsonLayer.addTo(map)

        return () => {
          map.removeLayer(geoJsonLayer)
        }
      }
    }, [data, map])

    return null
  }

  // Delete batch source mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).batch({ batchId }).source({ sourceId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete batch source');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchSources(companyData.company.id, batchId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.batchById(companyData.company.id, batchId) });
      }
      navigate({ to: '/client/company/$companyName/batch/$batchId', params: { companyName, batchId } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus sumber batch');
    },
  });

  const handleEdit = () => {
    navigate({ to: '/client/company/$companyName/batch/$batchId/$sourceId/edit' as any, params: { companyName, batchId, sourceId } as any })
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus sumber batch ini?')) {
      deleteMutation.mutate();
    }
  }

  if (isLoading || !companyData) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !batchSource) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || "Sumber batch tidak ditemukan"}</p>
        </div>
      </div>
    )
  }

  // Parse landSnapshot for map display
  let geoJsonData = null
  let landSnapshot = null
  try {
    if (batchSource.landSnapshot && typeof batchSource.landSnapshot === 'object') {
      landSnapshot = batchSource.landSnapshot as any
      if (landSnapshot.geoPolygon) {
        geoJsonData = JSON.parse(landSnapshot.geoPolygon)
      }
    }
  } catch (e) {
    console.error('Error parsing landSnapshot:', e)
  }

  // Get coordinates for map center (from landSnapshot or current land)
  const latitude = landSnapshot?.latitude ?? (batchSource.land as any)?.latitude
  const longitude = landSnapshot?.longitude ?? (batchSource.land as any)?.longitude
  const hasValidCoordinates = latitude != null && longitude != null && latitude !== 0 && longitude !== 0
  const mapCenter: [number, number] = hasValidCoordinates ? [latitude, longitude] : [0, 0]

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title={`Lihat Sumber Batch`} 
        handleDelete={handleDelete} 
        handleEdit={handleEdit} 
      />

      <div className="space-y-6">
        {/* Batch Source Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Batch
            </label>
            <p className='text-sm'>{batchSource.batch?.lotCode || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Kelompok
            </label>
            <p className='text-sm'>{batchSource.farmerGroup?.name || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Lahan
            </label>
            <p className='text-sm'>{landSnapshot?.name || batchSource.land?.name || '-'} - {landSnapshot?.location || batchSource.land?.location || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Volume (Kg)
            </label>
            <p className='text-sm'>{batchSource.volumeKg}</p>
          </div>

          {landSnapshot && (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Luas Area (Hektar) - Snapshot
                </label>
                <p className='text-sm'>{landSnapshot.areaHectares || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tanggal Snapshot
                </label>
                <p className='text-sm'>{landSnapshot.snapshotDate ? new Date(landSnapshot.snapshotDate).toLocaleDateString('id-ID') : '-'}</p>
              </div>
            </>
          )}
        </div>

        {/* Map from landSnapshot */}
        {geoJsonData && hasValidCoordinates && landSnapshot?.geoPolygon && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Peta Area Lahan (Snapshot)
            </label>
            <div className="h-[500px] w-[800px] border border-gray-300 rounded-lg overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                {/* Menggunakan Google Satellite Hybrid (Foto + Jalan) */}
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                  maxZoom={20}
                />
                <FitBounds geoPolygon={landSnapshot.geoPolygon} />
                <GeoJSONLayer data={geoJsonData} />
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
