"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [myItems, setMyItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);

            if (u) {
                const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
                setProfile(p);
                const { data: items } = await supabase.from("items").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
                setMyItems(items || []);
            }
            setLoading(false);
        })();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
        );
    }

    // Guest View
    if (!user) {
        return (
            <div className="min-h-screen bg-[#f6f7f8]">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
                    <div className="max-w-xl mx-auto flex items-center justify-between">
                        <h1 className="text-xl font-bold">Profile</h1>
                    </div>
                </header>
                <main className="max-w-xl mx-auto px-4 py-12 text-center">
                    <div className="size-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">You're not logged in</h2>
                    <p className="text-slate-500 mt-2 text-sm">Sign in to view your profile, manage listings, and track bookings.</p>
                    <div className="flex gap-3 mt-8">
                        <Link href="/login" className="flex-1">
                            <button className="w-full h-12 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">Log In</button>
                        </Link>
                        <Link href="/signup" className="flex-1">
                            <button className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Sign Up</button>
                        </Link>
                    </div>
                </main>
                <BottomNav />
            </div>
        );
    }

    const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

    return (
        <div className="min-h-screen bg-[#f6f7f8]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Profile</h1>
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-slate-100 w-48 z-50 overflow-hidden">
                                <Link href="/login" onClick={() => setShowMenu(false)}>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <span className="material-symbols-outlined text-primary">settings</span> Settings
                                    </button>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-t border-slate-100"
                                >
                                    <span className="material-symbols-outlined">logout</span> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 pb-32 space-y-6 mt-4">
                {/* Avatar & Name */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                    <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-primary">person</span>
                        )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">{displayName}</h2>
                    <p className="text-slate-500 text-sm mt-0.5">{user.email}</p>
                    {profile?.location && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>{profile.location}
                        </p>
                    )}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900">{myItems.length}</p>
                            <p className="text-xs text-slate-500">Items Listed</p>
                        </div>
                        <div className="text-center border-x border-slate-100">
                            <p className="text-2xl font-black text-slate-900">0</p>
                            <p className="text-xs text-slate-500">Rentals</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-primary">4.9</p>
                            <p className="text-xs text-slate-500">Rating</p>
                        </div>
                    </div>
                </section>

                {/* My Listings */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">My Listings</h3>
                        <Link href="/post-item">
                            <button className="text-primary text-sm font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">add</span> Post Item
                            </button>
                        </Link>
                    </div>
                    {myItems.length === 0 ? (
                        <div className="bg-white rounded-xl p-6 text-center border border-slate-100">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">inventory_2</span>
                            <p className="text-sm text-slate-500">You haven't listed any items yet.</p>
                            <Link href="/post-item">
                                <button className="mt-3 bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm">Post Your First Item</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myItems.map((item) => (
                                <Link key={item.id} href={`/items/${item.id}`}>
                                    <div className="bg-white rounded-xl p-3 flex gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                            {item.images?.[0] ? (
                                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-300">image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                                            <p className="text-primary font-semibold text-xs mt-0.5">₹{item.price_per_day}/day</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${item.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                {item.is_available ? "Available" : "Rented Out"}
                                            </span>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 self-center">chevron_right</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Account Menu */}
                <section className="space-y-3">
                    <h3 className="font-bold text-lg">Account</h3>
                    {[
                        { href: "/bookings", icon: "history", label: "My Bookings", desc: "View active and past rentals" },
                        { href: "/cart", icon: "shopping_cart", label: "Cart", desc: "Items you're ready to rent" },
                        { href: "#", icon: "payments", label: "Payments & Earnings", desc: "Manage payouts" },
                        { href: "#", icon: "settings", label: "Settings", desc: "Notifications, privacy, security" },
                    ].map((item) => (
                        <Link key={item.label} href={item.href}>
                            <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow cursor-pointer">
                                <div className="size-10 rounded-full bg-slate-100 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors mr-4 shrink-0">
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{item.label}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                            </div>
                        </Link>
                    ))}
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
