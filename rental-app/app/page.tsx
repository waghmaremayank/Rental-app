import { createClient } from "@/lib/supabase/client";
import ItemCard from "@/components/ItemCard";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { Database } from "@/lib/types";

type Item = Database["public"]["Tables"]["items"]["Row"];

async function getItems(category?: string): Promise<Item[]> {
  const supabase = createClient();
  let query = supabase
    .from("items")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query.limit(20);
  if (error) {
    console.error("Error fetching items:", error);
    return [];
  }
  return data || [];
}

const categories = [
  { value: "all", label: "All", icon: "grid_view" },
  { value: "camera", label: "Camera", icon: "photo_camera" },
  { value: "mobility", label: "Mobility", icon: "pedal_bike" },
  { value: "tools", label: "Tools", icon: "construction" },
  { value: "party", label: "Party", icon: "event_seat" },
  { value: "clothes", label: "Clothes", icon: "apparel" },
  { value: "electronics", label: "Electronics", icon: "devices" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "all";
  const items = await getItems(activeCategory);

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                Nagpur, Maharashtra
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">GoRental</h1>
            </div>
            <Link href="/profile">
              <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
              </div>
            </Link>
          </div>
          {/* Search bar */}
          <form action="/" method="GET">
            <label className="flex items-center h-12 w-full bg-slate-100 rounded-full px-4 gap-2">
              <span className="material-symbols-outlined text-primary">search</span>
              <input
                name="q"
                defaultValue={params.q}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium placeholder:text-slate-400"
                placeholder="Search cameras, bikes, tools..."
              />
              <button type="submit" className="text-primary">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </label>
          </form>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-32 space-y-6 mt-4">
        {/* Categories */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <Link key={cat.value} href={`/?category=${cat.value}`}>
                  <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                    <div
                      className={`size-14 rounded-full shadow-sm flex items-center justify-center transition-colors ${isActive
                          ? "bg-primary text-white shadow-lg"
                          : "bg-white text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${isActive ? "text-primary font-bold" : ""}`}>
                      {cat.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Community Banner */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-600 p-6 text-white shadow-xl">
          <div className="relative z-10 space-y-3 max-w-[70%]">
            <h3 className="text-2xl font-bold leading-tight">Turn your gear into cash.</h3>
            <p className="text-sm opacity-90">Join 5,000+ neighbors sharing items in Nagpur.</p>
            <Link href="/post-item">
              <button className="bg-white text-primary px-6 py-2 rounded-lg font-bold text-sm shadow-lg btn-pulse hover:shadow-xl transition-shadow mt-2">
                List Your Gear
              </button>
            </Link>
          </div>
          <div className="absolute -right-4 -bottom-4 size-40 opacity-20 rotate-12">
            <span className="material-symbols-outlined" style={{ fontSize: "160px" }}>handshake</span>
          </div>
        </section>

        {/* Listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg">
              {activeCategory === "all" ? "Popular Rentals" : `${categories.find(c => c.value === activeCategory)?.label} Rentals`}
            </h4>
            <span className="text-slate-500 text-sm font-medium">{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
              <p className="font-semibold text-lg">No items yet</p>
              <p className="text-sm mt-1">Be the first to list something!</p>
              <Link href="/post-item">
                <button className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                  + Post an Item
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
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
