import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import EditHeader from '../../../../../../component/headers/EditHeader'
import { useState, useEffect } from 'react'
import GeoMapEditor from '../../../../../../component/GeoMapEditor'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { server } from '../../../../../../lib/api'
import { queryKeys } from '../../../../../../lib/query-keys'
import { Loader2, TriangleAlert, Search } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchCenter, setSearchCenter] = useState<{ lat: number, lng: number } | undefined>(undefined)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ lat: number, lng: number, displayName: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

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

  // Function to search location suggestions using forward geocoding
  const searchLocationSuggestions = async (query: string): Promise<Array<{ lat: number, lng: number, displayName: string }>> => {
    if (!query || query.trim().length === 0) return [];
    
    setIsSearching(true);
    try {
      // Try with countrycodes first, then without if no results
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=id&accept-language=id,en`;
      
      let response = await fetch(url, {
        headers: {
          'User-Agent': 'RegApp/1.0'
        }
      });
      
      if (!response.ok) {
        console.error('Nominatim API error:', response.status, response.statusText);
        return [];
      }
      
      let data = await response.json();
      
      // If no results with countrycodes, try without it (broader search)
      if (!data || data.length === 0) {
        console.log('No results with countrycodes, trying without...');
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=id,en`;
        response = await fetch(url, {
          headers: {
            'User-Agent': 'RegApp/1.0'
          }
        });
        
        if (!response.ok) {
          console.error('Nominatim API error (fallback):', response.status, response.statusText);
          return [];
        }
        
        data = await response.json();
      }
      console.log('Search results for:', query, data);
      
      if (data && data.length > 0) {
        const results = data.map((result: any) => ({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name || query
        }));
        console.log('Parsed results:', results);
        return results;
      }
      
      console.log('No results found for:', query);
      return [];
    } catch (error) {
      console.error('Error searching location:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search for suggestions using useEffect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      console.log('Searching for:', searchQuery);
      const results = await searchLocationSuggestions(searchQuery);
      console.log('Got results:', results);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { lat: number, lng: number, displayName: string }) => {
    setSearchQuery(suggestion.displayName);
    setSearchCenter({ lat: suggestion.lat, lng: suggestion.lng });
    setLocation(suggestion.displayName);
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lng);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setError('Masukkan nama lokasi untuk dicari');
      return;
    }

    // If there are suggestions, use the first one
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
      return;
    }

    // Otherwise, search for the query
    const results = await searchLocationSuggestions(searchQuery);
    if (results.length > 0) {
      handleSuggestionClick(results[0]);
    } else {
      setError('Lokasi tidak ditemukan. Coba dengan nama yang lebih spesifik.');
    }
  };

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
          <div className="flex gap-2 items-start mb-3">
            <div className="relative flex-1 max-w-[400px] z-50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => {
                  // Show suggestions if available when input is focused
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  } else if (searchQuery.trim().length >= 2) {
                    // If there's a query but no suggestions yet, trigger search
                    searchLocationSuggestions(searchQuery).then(results => {
                      setSuggestions(results);
                      setShowSuggestions(results.length > 0);
                    });
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Contoh: Jakarta, Bandung, Surabaya..."
                className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white relative z-50"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto" style={{ top: '100%', zIndex: 9999 }}>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from firing
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                    >
                      <div className="text-sm text-gray-900">{suggestion.displayName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-2 py-2 text-sm flex items-center gap-1 disabled:opacity-50 relative z-50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className='underline'>Mencari...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className='underline'>Cari</span>
                </>
              )}
            </button>
          </div>
          <GeoMapEditor 
            onChange={handleMapChange} 
            width={1000}
            height={500}
            initialGeoJson={geoPolygon || undefined}
            initialCenter={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
            searchCenter={searchCenter}
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
