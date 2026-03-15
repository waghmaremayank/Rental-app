"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });

        if (err) {
            // Provide a friendlier message for unconfirmed email
            if (err.message.toLowerCase().includes("email not confirmed")) {
                setError(
                    "Your email isn't confirmed yet. Go to your Supabase Dashboard → Authentication → Settings and turn OFF \"Confirm email\", then try again."
                );
            } else {
                setError(err.message);
            }
            setLoading(false);
        } else {
            // Redirect to profile on successful login
            router.push("/profile");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/">
                        <div className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </div>
                    </Link>
                    <h1 className="text-xl font-bold">Sign In</h1>
                </div>
            </header>

            <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-white text-3xl">key</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Welcome back!</h2>
                    <p className="text-slate-500 mt-1 text-sm">Sign in to continue renting</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl leading-relaxed">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1.5">Email Address</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">email</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1.5">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary font-bold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </main>
        </div>
    );
}
