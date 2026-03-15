"use client";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { Database } from "@/lib/types";
import Link from "next/link";

type Item = Database["public"]["Tables"]["items"]["Row"];

export default function ExploreMap({ items }: { items: Item[] }) {
    // Default center roughly Nagpur
    const defaultCenter: [number, number] = [79.0882, 21.1458];

    return (
        <div className="w-full h-[60vh] rounded-2xl overflow-hidden border border-slate-200 relative mb-6 shadow-sm">
            <Map viewport={{ center: defaultCenter, zoom: 12 }}>
                {items.filter(i => typeof i.latitude === 'number' && typeof i.longitude === 'number' && i.latitude !== null && i.longitude !== null).map((item) => (
                    <MapMarker 
                        key={item.id} 
                        longitude={item.longitude!} 
                        latitude={item.latitude!}
                    >
                        <MarkerContent className="card-hover">
                            <div className="relative flex flex-col items-center">
                                <div className="bg-white text-slate-900 border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap">₹{item.price_per_day}/day</div>
                                <div className="size-8 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl scale-125">
                                    <span className="material-symbols-outlined text-lg">
                                        {item.category === "camera" ? "photo_camera" 
                                        : item.category === "mobility" ? "pedal_bike" 
                                        : item.category === "tools" ? "construction" 
                                        : item.category === "party" ? "event_seat"
                                        : item.category === "electronics" ? "devices" 
                                        : item.category === "clothes" ? "apparel" 
                                        : "inventory_2"}
                                    </span>
                                </div>
                            </div>
                        </MarkerContent>

                        <MarkerPopup className="p-0 border-0 rounded-xl overflow-hidden shadow-2xl w-56 z-50">
                            <div className="flex flex-col">
                                <div className="h-28 bg-slate-100 relative w-full">
                                    <img 
                                        src={item.images?.[0] || "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image"} 
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-primary text-xs font-bold px-2 py-1 rounded">
                                        ₹{item.price_per_day}/day
                                    </div>
                                </div>
                                <div className="p-3 bg-white">
                                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 mb-2">{item.location}</p>
                                    <Link href={`/items/${item.id}`}>
                                        <button className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                            View Details
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}
                
                <MapControls position="bottom-right" showLocate={true} showZoom={true} className="pb-16" />
            </Map>
        </div>
    );
}
