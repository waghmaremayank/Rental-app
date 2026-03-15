"use client";
import Link from "next/link";
import Image from "next/image";
import { Database } from "@/lib/types";

type Item = Database["public"]["Tables"]["items"]["Row"];

interface ItemCardProps {
    item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
    const firstImage = item.images?.[0] || "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";

    return (
        <Link href={`/items/${item.id}`}>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm flex gap-4 p-3 border border-slate-100 card-hover cursor-pointer">
                <div className="w-28 h-28 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img
                        src={firstImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h5 className="font-bold text-slate-900 leading-tight line-clamp-2">{item.title}</h5>
                            <span className="text-primary font-bold whitespace-nowrap shrink-0">
                                ₹{item.price_per_day.toLocaleString()}
                                <span className="text-xs text-slate-400 font-normal">/day</span>
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-xs font-bold">4.8</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5 text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {item.location}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {item.is_available ? "Available" : "Rented Out"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
