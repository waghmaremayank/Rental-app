"use client";
import { useState } from "react";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";

export default function LocationPickerMap({
    onLocationChange,
    initialLocation
}: {
    onLocationChange: (lat: number, lng: number) => void;
    initialLocation?: { lat: number; lng: number }
}) {
    // Default center roughly Nagpur
    const defaultCenter: [number, number] = initialLocation ? [initialLocation.lng, initialLocation.lat] : [79.0882, 21.1458];
    const [markerPos, setMarkerPos] = useState({ lng: defaultCenter[0], lat: defaultCenter[1] });

    return (
        <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 relative mb-4">
            <Map viewport={{ center: defaultCenter, zoom: 12 }}>
                <MapMarker 
                    longitude={markerPos.lng} 
                    latitude={markerPos.lat}
                    draggable={true}
                    onDragStart={() => {}}
                    onDrag={(lngLat) => setMarkerPos(lngLat)}
                    onDragEnd={(lngLat) => {
                        setMarkerPos(lngLat);
                        onLocationChange(lngLat.lat, lngLat.lng);
                    }}
                >
                    <MarkerContent>
                        <div className="relative flex flex-col items-center">
                            <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap animate-pulse">Drag to precise location</div>
                            <div className="size-8 bg-slate-900 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                            </div>
                        </div>
                    </MarkerContent>
                </MapMarker>
                
                <MapControls position="bottom-right" showLocate={true} showZoom={true} />
            </Map>
        </div>
    );
}
