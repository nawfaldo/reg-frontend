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
    initialGeoJson?: string;
    initialCenter?: { lat: number, lng: number };
    searchCenter?: { lat: number, lng: number };
}

// Fungsi hitung area (Spherical)
function calculatePolygonArea(coordinates: number[][]): number {
    if (coordinates.length < 3) return 0;
    const R = 6378137;
    let area = 0;
    const coords = coordinates.map(coord => [
        coord[0] * Math.PI / 180,
        coord[1] * Math.PI / 180 
    ]);
    for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += (coords[j][0] - coords[i][0]) * (2 + Math.sin(coords[i][1]) + Math.sin(coords[j][1]));
    }
    area = Math.abs(area * R * R / 2);
    return area / 10000;
}

// DrawControl Component (Tidak Berubah)
function DrawControl({ featureGroupRef, onChange, initialGeoJson }: { featureGroupRef: { current: L.FeatureGroup | null }, onChange: GeoMapEditorProps['onChange'], initialGeoJson?: string }) {
    const map = useMap();
    const drawControlRef = useRef<any>(null);

    // Load initial polygon
    useEffect(() => {
        if (initialGeoJson && featureGroupRef.current) {
            try {
                const geoJson = JSON.parse(initialGeoJson);
                const featureGroup = featureGroupRef.current;
                featureGroup.clearLayers();
                const geoJsonLayer = L.geoJSON(geoJson, {
                    style: { color: '#3388ff', weight: 3, fillColor: '#3388ff', fillOpacity: 0.2 }
                });
                geoJsonLayer.eachLayer((layer: any) => featureGroup.addLayer(layer));
                
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

    // Setup Draw Control
    useEffect(() => {
        if (!map || !featureGroupRef.current) return;
        const featureGroup = featureGroupRef.current;
        if (drawControlRef.current) map.removeControl(drawControlRef.current);

        const drawOptions: any = {
            position: 'topright',
            draw: {
                rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false,
                polygon: {
                    allowIntersection: false,
                    showArea: false,
                    metric: true,
                    guidelineDistance: 10,
                    shapeOptions: { color: '#3388ff', weight: 3, fillColor: '#3388ff', fillOpacity: 0.2 },
                },
            },
            edit: { featureGroup: featureGroup, remove: true },
        };

        const DrawControlClass = (L.Control as any).Draw;
        const drawControl = new DrawControlClass(drawOptions);
        drawControlRef.current = drawControl;
        map.addControl(drawControl);

        const handleCreated = (e: any) => {
            const layer = e.layer;
            featureGroup.clearLayers();
            featureGroup.addLayer(layer);
            const rawGeoJson = (layer as any).toGeoJSON();
            
            let areaHectares = 0;
            if (rawGeoJson.geometry.type === 'Polygon' && rawGeoJson.geometry.coordinates[0]) {
                areaHectares = calculatePolygonArea(rawGeoJson.geometry.coordinates[0]);
            }

            let center: L.LatLng;
            if ('getBounds' in layer && typeof (layer as any).getBounds === 'function') {
                center = (layer as any).getBounds().getCenter();
            } else {
                const coords = rawGeoJson.geometry.coordinates[0];
                center = L.latLng(coords[0][1], coords[0][0]);
            }

            onChange({
                geoJson: JSON.stringify(rawGeoJson.geometry),
                areaHa: parseFloat(areaHectares.toFixed(2)),
                center: { lat: center.lat, lng: center.lng }
            });
        };

        const handleDeleted = () => {
            onChange({ geoJson: "", areaHa: 0, center: { lat: 0, lng: 0 } });
        };

        const Draw = (L as any).Draw;
        map.on(Draw.Event.CREATED, handleCreated);
        map.on(Draw.Event.DELETED, handleDeleted);

        return () => {
            if (drawControlRef.current) map.removeControl(drawControlRef.current);
            map.off(Draw.Event.CREATED, handleCreated);
            map.off(Draw.Event.DELETED, handleDeleted);
        };
    }, [map, featureGroupRef, onChange]);

    return null;
}

function MapCenterUpdater({ searchCenter }: { searchCenter?: { lat: number, lng: number } }) {
    const map = useMap();
    useEffect(() => {
        if (searchCenter && searchCenter.lat !== 0 && searchCenter.lng !== 0) {
            map.setView([searchCenter.lat, searchCenter.lng], 16, { animate: true });
        }
    }, [searchCenter, map]);
    return null;
}

export default function GeoMapEditor({ onChange, width = '100%', height = '400px', initialGeoJson, initialCenter, searchCenter }: GeoMapEditorProps) {
    const featureGroupRef = useRef<any>(null);
    const widthStyle = typeof width === 'number' ? `${width}px` : width;
    const heightStyle = typeof height === 'number' ? `${height}px` : height;

    let center: [number, number] = [-2.5489, 118.0149];
    let zoom = 5;
    
    if (initialCenter) {
        center = [initialCenter.lat, initialCenter.lng];
        zoom = 13;
    }

    return (
        <div 
            className="border border-gray-300 rounded-lg overflow-hidden relative z-0"
            style={{ width: widthStyle, height: heightStyle }}
        >
            <MapContainer 
                center={center} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%' }}
            >
                {/* --- PERUBAHAN UTAMA DI SINI --- */}
                {/* Menggunakan Google Satellite Hybrid (Foto + Jalan) */}
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                    maxZoom={20} // Google supports zoom lebih dalam dari Esri
                />
                
                {/* Layer OSM saya hapus karena Google Hybrid sudah ada nama jalannya */}
                
                <FeatureGroup ref={featureGroupRef}>
                    <DrawControl featureGroupRef={featureGroupRef} onChange={onChange} initialGeoJson={initialGeoJson} />
                    <MapCenterUpdater searchCenter={searchCenter} />
                </FeatureGroup>
            </MapContainer>
        </div>
    );
}