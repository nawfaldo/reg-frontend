import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix icon marker bug di Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface GeoMapEditorProps {
    onChange: (data: { 
        geoJson: string, 
        areaHa: number, 
        center: { lat: number, lng: number } 
    }) => void;
    width?: string | number;
    height?: string | number;
    initialGeoJson?: string; // GeoJSON string untuk load polygon yang sudah ada
    initialCenter?: { lat: number, lng: number }; // Center untuk auto-zoom
    searchCenter?: { lat: number, lng: number }; // Center untuk search location (akan update map)
}

// Fungsi untuk menghitung area polygon tanpa turf.js (menggunakan spherical geometry)
function calculatePolygonArea(coordinates: number[][]): number {
    if (coordinates.length < 3) return 0;
    
    // Earth radius in meters
    const R = 6378137;
    let area = 0;
    
    // Convert coordinates to radians
    const coords = coordinates.map(coord => [
        coord[0] * Math.PI / 180, // longitude
        coord[1] * Math.PI / 180  // latitude
    ]);
    
    // Spherical excess formula (more accurate for large areas)
    for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += (coords[j][0] - coords[i][0]) * (2 + Math.sin(coords[i][1]) + Math.sin(coords[j][1]));
    }
    
    area = Math.abs(area * R * R / 2);
    // Convert to hectares (1 hectare = 10,000 m²)
    return area / 10000;
}

// Component untuk Draw Control menggunakan leaflet-draw langsung
function DrawControl({ featureGroupRef, onChange, initialGeoJson }: { featureGroupRef: { current: L.FeatureGroup | null }, onChange: GeoMapEditorProps['onChange'], initialGeoJson?: string }) {
    const map = useMap();
    const drawControlRef = useRef<any>(null);

    // Load initial polygon jika ada
    useEffect(() => {
        if (initialGeoJson && featureGroupRef.current) {
            try {
                const geoJson = JSON.parse(initialGeoJson);
                const featureGroup = featureGroupRef.current;
                
                // Clear existing layers
                featureGroup.clearLayers();
                
                // Add polygon from GeoJSON
                const geoJsonLayer = L.geoJSON(geoJson, {
                    style: {
                        color: '#3388ff',
                        weight: 3,
                        fillColor: '#3388ff',
                        fillOpacity: 0.2
                    }
                });
                
                geoJsonLayer.eachLayer((layer: any) => {
                    featureGroup.addLayer(layer);
                });

                // Fit map to polygon bounds
                if (geoJson.type === 'Polygon' && geoJson.coordinates?.[0]) {
                    const coords = geoJson.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
                    const bounds = L.latLngBounds(coords);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (e) {
                console.error('Error loading initial GeoJSON:', e);
            }
        }
    }, [initialGeoJson, map, featureGroupRef]);

    useEffect(() => {
        if (!map || !featureGroupRef.current) return;
        
        const featureGroup = featureGroupRef.current;

        // Hapus control lama jika ada
        if (drawControlRef.current) {
            map.removeControl(drawControlRef.current);
        }

        // Konfigurasi draw options
        const drawOptions: any = {
            position: 'topright',
			draw: {
				rectangle: false,
				circle: false,
				circlemarker: false,
				marker: false,
				polyline: false,
				polygon: {
					allowIntersection: false,
					showArea: false,
					metric: true,
					imperial: false,
					guidelineDistance: 20,
					shapeOptions: {
						color: '#3388ff',
						weight: 3,
						fillColor: '#3388ff',
						fillOpacity: 0.2
					},
				},
			},
            edit: {
                featureGroup: featureGroup,
                remove: true,
            },
        };

        // Buat draw control
        const DrawControlClass = (L.Control as any).Draw;
        const drawControl = new DrawControlClass(drawOptions);
        drawControlRef.current = drawControl;
        map.addControl(drawControl);

        // Handler saat polygon dibuat
        const handleCreated = (e: any) => {
            const layer = e.layer;
            
            // Hapus polygon lama
            featureGroup.clearLayers();
            featureGroup.addLayer(layer);

            // Ambil GeoJSON
            const rawGeoJson = (layer as any).toGeoJSON();

            // Hitung luas
            let areaHectares = 0;
            if (rawGeoJson.geometry.type === 'Polygon' && rawGeoJson.geometry.coordinates[0]) {
                areaHectares = calculatePolygonArea(rawGeoJson.geometry.coordinates[0]);
            }

            // Cari titik tengah
            let center: L.LatLng;
            if ('getBounds' in layer && typeof (layer as any).getBounds === 'function') {
                center = (layer as any).getBounds().getCenter();
            } else {
                const coords = rawGeoJson.geometry.coordinates[0];
                let sumLat = 0;
                let sumLng = 0;
                for (const coord of coords) {
                    sumLng += coord[0];
                    sumLat += coord[1];
                }
                center = L.latLng(sumLat / coords.length, sumLng / coords.length);
            }

            // Kirim data ke parent
            onChange({
                geoJson: JSON.stringify(rawGeoJson.geometry),
                areaHa: parseFloat(areaHectares.toFixed(2)),
                center: { lat: center.lat, lng: center.lng }
            });
        };

        // Handler saat polygon dihapus
        const handleDeleted = () => {
            onChange({ geoJson: "", areaHa: 0, center: { lat: 0, lng: 0 } });
        };

        // Event listeners
        const Draw = (L as any).Draw;
        map.on(Draw.Event.CREATED, handleCreated);
        map.on(Draw.Event.DELETED, handleDeleted);

        // Cleanup
        return () => {
            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
            }
            map.off(Draw.Event.CREATED, handleCreated);
            map.off(Draw.Event.DELETED, handleDeleted);
        };
    }, [map, featureGroupRef, onChange]);

    return null;
}

// Component untuk update map center ketika searchCenter berubah
function MapCenterUpdater({ searchCenter }: { searchCenter?: { lat: number, lng: number } }) {
    const map = useMap();

    useEffect(() => {
        if (searchCenter && searchCenter.lat !== 0 && searchCenter.lng !== 0) {
            map.setView([searchCenter.lat, searchCenter.lng], 13, { animate: true });
        }
    }, [searchCenter, map]);

    return null;
}

export default function GeoMapEditor({ onChange, width = '100%', height = '400px', initialGeoJson, initialCenter, searchCenter }: GeoMapEditorProps) {
    // Ref untuk feature group
    const featureGroupRef = useRef<any>(null);

    // Convert width and height to CSS values
    const widthStyle = typeof width === 'number' ? `${width}px` : width;
    const heightStyle = typeof height === 'number' ? `${height}px` : height;

    // Determine initial center and zoom
    let center: [number, number] = [-2.5489, 118.0149];
    let zoom = 5;
    
    if (initialCenter) {
        center = [initialCenter.lat, initialCenter.lng];
        zoom = 13;
    } else if (initialGeoJson) {
        try {
            const geoJson = JSON.parse(initialGeoJson);
            if (geoJson.type === 'Polygon' && geoJson.coordinates?.[0]) {
                const coords = geoJson.coordinates[0];
                let sumLat = 0;
                let sumLng = 0;
                for (const [lng, lat] of coords) {
                    sumLat += lat;
                    sumLng += lng;
                }
                center = [sumLat / coords.length, sumLng / coords.length];
                zoom = 13;
            }
        } catch (e) {
            console.error('Error parsing initialGeoJson for center:', e);
        }
    }

    return (
        <div 
            className="border border-gray-300 rounded-lg overflow-hidden relative z-0"
            style={{ width: widthStyle, height: heightStyle }}
        >
            <MapContainer 
                center={center} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}
            >
                {/* Layer Satelit (Esri World Imagery) */}
                <TileLayer
                    attribution='Tiles &copy; Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                
                {/* Layer Jalan (Opsional) */}
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    opacity={0.4}
                />

                <FeatureGroup ref={featureGroupRef}>
                    <DrawControl featureGroupRef={featureGroupRef} onChange={onChange} initialGeoJson={initialGeoJson} />
                    <MapCenterUpdater searchCenter={searchCenter} />
                </FeatureGroup>
            </MapContainer>
        </div>
    );
}
