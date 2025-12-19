import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../component/headers/EditHeader'
import { useState, useEffect } from 'react'
import GeoMapEditor from '../../../../../../component/GeoMapEditor'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import { Loader2, TriangleAlert } from 'lucide-react'

export const Route = createFileRoute(
  '/client/company/$companyName/geo-tag/$landId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName, landId } = useParams({ from: '/client/company/$companyName/geo-tag/$landId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [areaHectares, setAreaHectares] = useState<number>(0)
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [location, setLocation] = useState<string>("")
  const [geoPolygon, setGeoPolygon] = useState<string>("")
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

  // Fetch land data
  const { data: landData, isLoading: isLoadingLand } = useQuery({
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

  // Pre-fill form with existing data
  useEffect(() => {
    if (land) {
      setName(land.name || "")
      setAreaHectares(land.areaHectares || 0)
      setLatitude(land.latitude || 0)
      setLongitude(land.longitude || 0)
      setLocation(land.location || "")
      setGeoPolygon(land.geoPolygon || "")
    }
  }, [land])

  // Function to get location from lat/lng using reverse geocoding
  const getLocationFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RegApp/1.0' // Required by Nominatim
          }
        }
      );
      const data = await response.json();
      
      if (data.address) {
        const parts: string[] = [];
        if (data.address.village || data.address.town || data.address.city) {
          parts.push(data.address.village || data.address.town || data.address.city);
        }
        if (data.address.state || data.address.region) {
          parts.push(data.address.state || data.address.region);
        }
        if (data.address.country) {
          parts.push(data.address.country);
        }
        return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error fetching location:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Update land mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      areaHectares?: number;
      latitude?: number;
      longitude?: number;
      location?: string;
      geoPolygon?: string;
    }) => {
      if (!companyData?.company?.id) throw new Error('Company not found');

      const { data: response, error } = await (server.api.company as any)({ id: companyData.company.id }).land({ landId }).put(data);
      if (error) throw error;
      if ('error' in response && response.error) {
        throw new Error((response.error as any).value?.error || 'Failed to update land');
      }
      return response;
    },
    onSuccess: () => {
      if (companyData?.company?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.company.land(companyData.company.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.company.landById(companyData.company.id, landId) });
      }
      navigate({ to: '/client/company/$companyName/geo-tag/$landId', params: { companyName, landId } });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleMapChange = async (data: {
    geoJson: string,
    areaHa: number,
    center: { lat: number, lng: number }
  }) => {
    setGeoPolygon(data.geoJson);
    setAreaHectares(data.areaHa);
    setLatitude(data.center.lat);
    setLongitude(data.center.lng);
    
    // Auto generate location from coordinates
    if (data.center.lat !== 0 && data.center.lng !== 0) {
      const locationName = await getLocationFromCoordinates(data.center.lat, data.center.lng);
      setLocation(locationName);
    }
  };

  const handleSave = () => {
    setError(null);

    if (!name || name.trim().length === 0) {
      setError('Nama lahan tidak boleh kosong');
      return;
    }
    if (areaHectares <= 0) {
      setError('Luas area harus lebih besar dari 0');
      return;
    }
    if (!geoPolygon || geoPolygon.trim().length === 0) {
      setError('GeoPolygon wajib diisi');
      return;
    }

    if (!location || location.trim().length === 0) {
      setError('Lokasi belum tersedia, silakan tunggu sebentar atau gambar ulang area lahan');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      areaHectares,
      latitude,
      longitude,
      location: location.trim(),
      geoPolygon: geoPolygon.trim(),
    });
  }

  if (!companyData || isLoadingLand) {
    return (
      <div className="px-6 pt-1 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="px-6 pt-1 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Lahan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <EditHeader title={`Ubah Lahan: ${land.name}`} saveHandle={handleSave} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nama Lahan
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Lahan"
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
          />
        </div>

        {/* GeoMapEditor */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Gambar Area Lahan
          </label>
          <GeoMapEditor 
            onChange={handleMapChange} 
            width={1000}
            height={500}
            initialGeoJson={geoPolygon || undefined}
            initialCenter={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
          />
          {geoPolygon && (
            <p className="mt-2 text-sm text-gray-600">
              Area: {areaHectares} Ha, Center: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-600 flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 text-gray-600" />
          Silakan gambar area lahan di peta untuk menentukan lokasi dan luas area lahan.
        </p>

        {/* Area Hectares Input (read-only, from map) */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Luas Area (Hektar)
          </label>
          <input
            type="number"
            value={areaHectares}
            readOnly
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 bg-gray-50 focus:outline-none"
          />
        </div>

        {/* Latitude Input (read-only, from map) */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Latitude
          </label>
          <input
            type="number"
            value={latitude}
            readOnly
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 bg-gray-50 focus:outline-none"
          />
        </div>

        {/* Longitude Input (read-only, from map) */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Longitude
          </label>
          <input
            type="number"
            value={longitude}
            readOnly
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 bg-gray-50 focus:outline-none"
          />
        </div>

        {/* Location Input (read-only, from map) */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Lokasi
          </label>
          <input
            type="text"
            value={location}
            readOnly
            className="w-[400px] px-3 py-2 text-sm border border-gray-300 bg-gray-50 focus:outline-none"
          />
        </div>

      </div>
    </div>
  )
}
