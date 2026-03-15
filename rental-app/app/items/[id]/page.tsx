import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Database } from "@/lib/types";

type Item = Database["public"]["Tables"]["items"]["Row"];

async function getItem(id: string): Promise<Item | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) return null;
    return data;
}

async function getOwnerProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    return data;
}

export default async function ItemDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const item = await getItem(id);

    if (!item) return notFound();

    const owner = await getOwnerProfile(item.user_id);
    const images = item.images || [];
    const specs = item.specs as Record<string, string> | null;

    return (
        <div className="min-h-screen bg-white max-w-md mx-auto shadow-2xl relative">
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md px-4 py-4 justify-between border-b border-slate-100">
                <Link href="/">
                    <div className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </div>
                </Link>
                <h2 className="text-lg font-bold tracking-tight flex-1 text-center">Item Details</h2>
                <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined">share</span>
                </button>
            </div>

            {/* Content */}
            <div className="pb-[150px]">
                {/* Image Gallery */}
                <div className="px-4 py-3">
                    {images.length > 0 ? (
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                            <img
                                src={images[0]}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-[4/3] rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
                        </div>
                    )}
                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div className="flex gap-2 mt-2">
                            {images.slice(1).map((img, idx) => (
                                <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200">
                                    <img src={img} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Title & Price */}
                <div className="px-4 pt-2">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-2xl font-extrabold leading-tight text-slate-900">{item.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="material-symbols-outlined text-yellow-500" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="font-bold text-slate-900">4.8</span>
                                <span className="text-slate-500 text-sm">(12 reviews)</span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-2xl font-black text-primary">₹{item.price_per_day.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-medium">per day</p>
                        </div>
                    </div>
                    {/* Category Tag */}
                    <div className="mt-2">
                        <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full capitalize">{item.category}</span>
                        {!item.is_available && (
                            <span className="ml-2 text-xs bg-red-50 text-red-500 font-bold px-3 py-1 rounded-full">Currently Unavailable</span>
                        )}
                    </div>
                </div>

                {/* Tech Specs from user-filled data */}
                {specs && Object.keys(specs).length > 0 && (
                    <div className="grid grid-cols-3 gap-3 px-4 py-6">
                        {Object.entries(specs).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 p-3 rounded-lg flex flex-col items-center text-center">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{key}</p>
                                <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="px-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">About this item</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.description}</p>
                </div>

                {/* Location */}
                <div className="px-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Location</h3>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-primary">location_on</span>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{item.location}</p>
                            <p className="text-xs text-slate-500">Nagpur, Maharashtra</p>
                        </div>
                    </div>
                    <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden relative shadow-inner flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">map</span>
                        <p className="text-xs text-slate-400 mt-1 absolute">Map preview</p>
                    </div>
                </div>

                {/* Host Info */}
                <div className="px-4 pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Listed by</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                {owner?.avatar_url ? (
                                    <img src={owner.avatar_url} alt={owner.full_name || "Host"} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-primary">person</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{owner?.full_name || "GoRental User"}</p>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: "14px" }}>verified</span>
                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">Verified Host</p>
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary shadow-sm hover:bg-primary/5 transition-colors">
                            Message
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-[74px] left-0 right-0 max-w-md mx-auto px-4 py-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center gap-3 z-40">
                <button className="size-14 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-400 transition-colors shrink-0">
                    <span className="material-symbols-outlined">favorite</span>
                </button>
                <Link href="/cart" className="flex-1">
                    <button
                        disabled={!item.is_available}
                        className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 btn-pulse disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">shopping_cart_checkout</span>
                        {item.is_available ? "Rent Now" : "Not Available"}
                    </button>
                </Link>
            </div>

            {/* Nav */}
            <BottomNav />
        </div>
    );
}
