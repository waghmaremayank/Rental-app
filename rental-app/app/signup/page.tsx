"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();

        // Step 1: Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Step 2: Immediately sign them in (works when email confirmation is disabled)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            // Email confirmation might still be enabled — guide them
            setError(
                "Account created! Please check your email to confirm your account, then sign in."
            );
            setLoading(false);
            return;
        }

        // Step 3: Redirect to profile
        router.push("/profile");
        router.refresh();
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
                    <h1 className="text-xl font-bold">Create Account</h1>
                </div>
            </header>

            <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="size-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-white text-3xl">person_add</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Join GoRental!</h2>
                    <p className="text-slate-500 mt-1 text-sm">Start renting or earning today</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl leading-relaxed">
                            {error}
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1.5">Full Name</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Rahul Sharma"
                                className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

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
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="minimum 6 characters"
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
                                Creating Account...
                            </>
                        ) : (
                            "Create My Account 🚀"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </main>
        </div>
    );
}
