import { createClient } from "@/lib/supabase/client";
import ItemCard from "@/components/ItemCard";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { Database } from "@/lib/types";

type Item = Database["public"]["Tables"]["items"]["Row"];

async function searchItems(query?: string): Promise<Item[]> {
    const supabase = createClient();
    let dbQuery = supabase
        .from("items")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

    if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.limit(50);
    if (error) {
        console.error("Error fetching search results:", error);
        return [];
    }
    return data || [];
}

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const items = await searchItems(params.q);

    return (
        <div className="min-h-screen bg-[#f6f7f8] pb-36 font-sans text-slate-900">
            {/* Header / Search */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4">
                <div className="flex items-center gap-3 max-w-xl mx-auto">
                    <Link href="/">
                        <div className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 cursor-pointer transition-colors shrink-0">
                            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                        </div>
                    </Link>
                    <form action="/explore" method="GET" className="flex-1">
                        <label className="flex items-center h-12 w-full bg-slate-100 rounded-full px-4 gap-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                            <span className="material-symbols-outlined text-primary">search</span>
                            <input
                                name="q"
                                defaultValue={params.q || ""}
                                autoFocus
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium placeholder:text-slate-400 text-slate-900"
                                placeholder="Search cameras, bikes, tools..."
                            />
                            {params.q && (
                                <Link href="/explore">
                                    <span className="material-symbols-outlined text-slate-400 hover:text-slate-600 text-sm p-1">close</span>
                                </Link>
                            )}
                        </label>
                    </form>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        {params.q ? `Search results for "${params.q}"` : "Explore All Items"}
                    </h2>
                    <span className="text-sm font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">{items.length} found</span>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <span className="material-symbols-outlined text-4xl">search_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            We couldn't find any items matching "{params.q}". Try adjusting your search keywords.
                        </p>
                        <Link href="/explore">
                            <button className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                                Clear Search
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
