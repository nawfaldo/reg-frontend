import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import DetailHeader from '../../../../../../components/headers/DetailHeader'
import { queryKeys } from '../../../../../../lib/query-keys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { Loader2, Search } from 'lucide-react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import Skeleton from '../../../../../../components/Skeleton'
import { usePermissions } from '../../../../../../hooks/usePermissions'

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
  '/client/company/$companyName/geo-tag/$landId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, landId } = useParams({ from: '/client/company/$companyName/geo-tag/$landId/' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions(companyName)

  // Fetch company data to get companyId
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: queryKeys.company.byName(companyName),
    queryFn: async () => {
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) throw error;
      return data;
    },
  });

  // Fetch land data
  const { data: landData, isLoading: isLoadingLand, error } = useQuery({
    queryKey: companyData?.company?.id ? queryKeys.company.landById(companyData.company.id, landId) : ['land', landId],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).land({ landId }).get();
      if (error) throw error;
      return data;
    },
    enabled: !!companyData?.company?.id,
  })

  const land = landData?.land
  const isLoading = isLoadingCompany || isLoadingLand
  const isLoadingLandName = isLoadingLand || !land

  // Check deforestation mutation
  const checkDeforestationMutation = useMutation({
    mutationFn: async () => {
      if (!land?.geoPolygon) throw new Error('GeoPolygon tidak tersedia');
      if (!companyData?.company?.id) throw new Error('Company not found');

      try {
        // Step 1: Call Python API to check deforestation
        const pythonApiUrl = `${import.meta.env.VITE_AI_URL}/check-deforestation`;
        const pythonResponse = await fetch(pythonApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            geojson: land.geoPolygon,
            years_back: 5,
          }),
        });

        if (!pythonResponse.ok) {
          let errorMessage = 'Failed to check deforestation';
          try {
            const errorData = await pythonResponse.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            errorMessage = `HTTP ${pythonResponse.status}: ${pythonResponse.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const pythonData = await pythonResponse.json();
        const isDeforestationFree = pythonData.is_clean;

        // Step 2: Update server with deforestation status
        const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).land({ landId }).put({
          isDeforestationFree,
        });

        if (error) throw error;
        if ('error' in response && response.error) {
          throw new Error((response.error as any).value?.error || 'Failed to update deforestation status');
        }

        return { ...pythonData, isDeforestationFree };
      } catch (err: any) {
        console.error('Error in checkDeforestationMutation:', err);
        throw err instanceof Error ? err : new Error(err?.message || 'Gagal mengecek deforestasi');
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.landById(companyData.company.id, landId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.land(companyData.company.id) });
      }
    },
    onError: (err: Error) => {
      console.error('Check deforestation error:', err);
      alert(err.message || 'Gagal mengecek deforestasi');
    },
  });

  // Delete land mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!companyData?.company?.id) throw new Error('Company not found');
      const { data, error } = await (server.api.company as any)({ id: companyData.company.id }).land({ landId }).delete();
      if (error) throw error;
      if ('error' in data && data.error) {
        throw new Error((data.error as any).value?.error || 'Failed to delete land');
      }
      return data;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.land(companyData.company.id) });
      }
      navigate({ to: '/client/company/$companyName/geo-tag', params: { companyName } });
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal menghapus lahan');
    },
  });

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

  const handleEdit = () => {
    if (!hasPermission('land:update')) {
      alert('Anda tidak memiliki izin untuk mengubah lahan');
      return;
    }
    navigate({ to: '/client/company/$companyName/geo-tag/$landId/edit', params: { companyName, landId } })
  }

  const handleDelete = () => {
    if (!hasPermission('land:delete')) {
      alert('Anda tidak memiliki izin untuk menghapus lahan');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus lahan ini?')) {
      deleteMutation.mutate();
    }
  }

  // Wait for loading to complete before checking permissions
  if (!isLoading && !hasPermission('land:view')) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat detail lahan</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Lahan"
          userName={undefined}
          handleDelete={undefined}
          handleEdit={undefined}
          isLoading={true}
          isLoadingUserName={true}
        />
        
        <div className="space-y-6">
          {/* Land Information Skeleton */}
          <div className="w-[400px] space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Nama</label>
              <Skeleton width={200} height={16} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Lokasi</label>
              <Skeleton width={250} height={16} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Luas Area (Hektar)</label>
              <Skeleton width={100} height={16} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Latitude</label>
              <Skeleton width={120} height={16} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Longitude</label>
              <Skeleton width={120} height={16} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Bebas Deforestasi</label>
              <Skeleton width={60} height={16} />
            </div>
          </div>

          {/* Map Skeleton */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Peta Area Lahan
            </label>
            <Skeleton width={800} height={500} borderRadius={0} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !land) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <DetailHeader
          title="Lihat Lahan"
          userName={undefined}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          isLoading={false}
          isLoadingUserName={false}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {(error as Error)?.message || 'Lahan tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  let geoJsonData = null
  try {
    if (land.geoPolygon) {
      geoJsonData = JSON.parse(land.geoPolygon)
    }
  } catch (e) {
    console.error('Error parsing geoPolygon:', e)
  }
  
  return (
    <div className="px-6 pt-1 h-full bg-white">
      <DetailHeader 
        title="Lihat Lahan"
        userName={land.name}
        handleDelete={hasPermission('land:delete') ? handleDelete : undefined} 
        handleEdit={hasPermission('land:update') ? handleEdit : undefined}
        isLoading={false}
        isLoadingUserName={false}
      />

      <div className="space-y-6">
        {/* Land Information */}
        <div className="w-[400px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nama
            </label>
            <p className='text-sm'>{land.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Lokasi
            </label>
            <p className='text-sm'>{land.location}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Luas Area (Hektar)
            </label>
            <p className='text-sm'>{land.areaHectares}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Latitude
            </label>
            <p className='text-sm'>{land.latitude}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Longitude
            </label>
            <p className='text-sm'>{land.longitude}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Bebas Deforestasi
            </label>
            <div className="flex items-center gap-3">
              <p className='text-sm'>{land.isDeforestationFree === null ? '-' : land.isDeforestationFree ? 'Ya' : 'Tidak'}</p>
              {land.geoPolygon && (
                <button
                  type="button"
                  onClick={() => checkDeforestationMutation.mutate()}
                  disabled={checkDeforestationMutation.isPending}
                  className="px-2 py-2 text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  {checkDeforestationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className='underline'>Mengecek...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span className='underline'>{land.isDeforestationFree !== null ? 'Check Ulang' : 'Check'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        {geoJsonData && (
    <div>
            <label className="block text-sm font-medium text-black mb-2">
              Peta Area Lahan
            </label>
            <div className="h-[500px] w-[800px] border border-gray-300 rounded-lg overflow-hidden">
              <MapContainer
                center={[land.latitude, land.longitude]}
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
                {geoJsonData && (
                  <>
                    <FitBounds geoPolygon={land.geoPolygon} />
                    <GeoJSONLayer data={geoJsonData} />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
