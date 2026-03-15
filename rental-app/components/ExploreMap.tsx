"use client";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { Database } from "@/lib/types";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type Item = Database["public"]["Tables"]["items"]["Row"];

function getCategoryIcon(cat: string) {
    switch (cat) {
        case "camera": return "photo_camera";
        case "mobility": return "pedal_bike";
        case "tools": return "construction";
        case "party": return "event_seat";
        case "electronics": return "devices";
        case "clothes": return "apparel";
        case "sports": return "sports_soccer";
        default: return "inventory_2";
    }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

type UserLocation = { lat: number; lng: number };

export default function ExploreMap({ items }: { items: Item[] }) {
    const nagpurCenter: [number, number] = [79.0882, 21.1458];

    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
    const [mapCenter, setMapCenter] = useState<[number, number]>(nagpurCenter);
    const [nearbyRadius, setNearbyRadius] = useState<number>(5); // km

    // Items with valid coordinates
    const geoItems = items.filter(
        (i) => typeof i.latitude === "number" && typeof i.longitude === "number" && i.latitude !== null && i.longitude !== null
    );

    // Sort by distance if we have GPS
    const sortedItems = userLocation
        ? [...geoItems].sort((a, b) =>
            haversineDistance(userLocation.lat, userLocation.lng, a.latitude!, a.longitude!) -
            haversineDistance(userLocation.lat, userLocation.lng, b.latitude!, b.longitude!)
        )
        : geoItems;

    // Filter items inside the nearby radius slider
    const visibleItems = userLocation
        ? sortedItems.filter(
            (i) => haversineDistance(userLocation.lat, userLocation.lng, i.latitude!, i.longitude!) <= nearbyRadius
        )
        : sortedItems;

    const requestGPS = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setGpsStatus("denied");
            return;
        }
        setGpsStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                setMapCenter([loc.lng, loc.lat]);
                setGpsStatus("granted");
            },
            () => {
                setGpsStatus("denied");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Auto-request on mount
    useEffect(() => {
        requestGPS();
    }, [requestGPS]);

    return (
        <div className="flex flex-col gap-4">
            {/* GPS Status Banner */}
            {gpsStatus === "loading" && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-xl text-sm font-semibold animate-pulse">
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Detecting your location...
                </div>
            )}
            {gpsStatus === "granted" && userLocation && (
                <div className="flex items-center justify-between bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-semibold">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">my_location</span>
                        Location found! Showing items nearby.
                    </div>
                    <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">
                        {visibleItems.length} nearby
                    </span>
                </div>
            )}
            {gpsStatus === "denied" && (
                <div className="flex items-center justify-between bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-semibold">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">location_off</span>
                        Location denied. Showing all items.
                    </div>
                    <button onClick={requestGPS} className="text-xs font-bold text-primary bg-white border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/10 transition-colors">
                        Retry
                    </button>
                </div>
            )}

            {/* Radius Slider (only when GPS is available) */}
            {gpsStatus === "granted" && (
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0">radar</span>
                    <div className="flex-1">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                            <span>Nearby Radius</span>
                            <span className="text-primary font-bold">{nearbyRadius} km</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={20}
                            value={nearbyRadius}
                            onChange={(e) => setNearbyRadius(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>1 km</span>
                            <span>20 km</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-200 relative shadow-sm">
                <Map viewport={{ center: mapCenter, zoom: gpsStatus === "granted" ? 13 : 12 }}>
                    {/* User GPS marker */}
                    {userLocation && (
                        <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
                            <MarkerContent>
                                <div className="relative flex flex-col items-center">
                                    {/* Pulsing ring */}
                                    <div className="absolute size-12 rounded-full bg-primary/20 animate-ping" />
                                    <div className="size-5 bg-primary rounded-full border-4 border-white shadow-2xl z-10" />
                                    <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 whitespace-nowrap shadow">
                                        📍 You are here
                                    </div>
                                </div>
                            </MarkerContent>
                        </MapMarker>
                    )}

                    {/* Item markers */}
                    {visibleItems.map((item) => {
                        const dist = userLocation
                            ? haversineDistance(userLocation.lat, userLocation.lng, item.latitude!, item.longitude!)
                            : null;

                        return (
                            <MapMarker key={item.id} longitude={item.longitude!} latitude={item.latitude!}>
                                <MarkerContent className="card-hover">
                                    <div className="relative flex flex-col items-center cursor-pointer">
                                        <div className="bg-white text-slate-900 border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap">
                                            ₹{item.price_per_day}/day
                                        </div>
                                        <div className="size-9 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl">
                                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {getCategoryIcon(item.category)}
                                            </span>
                                        </div>
                                    </div>
                                </MarkerContent>

                                <MarkerPopup className="p-0 border-0 rounded-2xl overflow-hidden shadow-2xl" closeButton>
                                    <div className="w-56 flex flex-col bg-white">
                                        {/* Image */}
                                        <div className="h-32 bg-slate-100 relative w-full overflow-hidden">
                                            <img
                                                src={item.images?.[0] || "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image"}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                                                ₹{item.price_per_day}/day
                                            </div>
                                            {dist !== null && (
                                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>near_me</span>
                                                    {formatDistance(dist)} away
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="p-3">
                                            <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-0.5">{item.title}</h4>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                                                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>location_on</span>
                                                <span className="line-clamp-1">{item.location}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                    {item.is_available ? "✓ Available" : "✗ Rented Out"}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 capitalize">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <Link href={`/items/${item.id}`}>
                                                <button className="w-full mt-3 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>storefront</span>
                                                    View &amp; Rent
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </MarkerPopup>
                            </MapMarker>
                        );
                    })}

                    <MapControls
                        position="bottom-right"
                        showLocate
                        showZoom
                        onLocate={(coords) => {
                            setUserLocation({ lat: coords.latitude, lng: coords.longitude });
                            setMapCenter([coords.longitude, coords.latitude]);
                            setGpsStatus("granted");
                        }}
                    />
                </Map>

                {/* No geo-tagged items overlay */}
                {visibleItems.length === 0 && gpsStatus !== "loading" && (
                    <div className="absolute inset-0 flex items-end justify-center pb-8 z-20 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur border border-slate-100 rounded-2xl px-5 py-4 shadow-xl text-center max-w-xs mx-4">
                            <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">location_searching</span>
                            <p className="text-sm font-bold text-slate-700">No items on map yet</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {userLocation ? `No items within ${nearbyRadius} km. Try increasing the radius.` : "Items need GPS coordinates to appear here."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Nearby Items List (below map when GPS active) */}
            {gpsStatus === "granted" && visibleItems.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">near_me</span>
                        Nearby Items — {nearbyRadius} km radius
                    </h3>
                    {sortedItems.slice(0, 5).map((item) => {
                        const dist = haversineDistance(userLocation!.lat, userLocation!.lng, item.latitude!, item.longitude!);
                        return (
                            <Link key={item.id} href={`/items/${item.id}`}>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                        <img
                                            src={item.images?.[0] || "https://placehold.co/200/e2e8f0/94a3b8?text=?"}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-1">{item.location}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-primary font-bold text-xs">₹{item.price_per_day}/day</span>
                                            <span className="text-slate-400 text-[10px] flex items-center gap-0.5">
                                                <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>near_me</span>
                                                {formatDistance(dist)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
