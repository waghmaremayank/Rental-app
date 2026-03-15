"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const CATEGORIES = [
    { value: "camera", label: "Camera / Photography", icon: "photo_camera" },
    { value: "mobility", label: "Mobility / Bikes", icon: "pedal_bike" },
    { value: "tools", label: "Tools & DIY", icon: "construction" },
    { value: "electronics", label: "Electronics", icon: "devices" },
    { value: "party", label: "Party & Events", icon: "event_seat" },
    { value: "clothes", label: "Clothes & Fashion", icon: "apparel" },
    { value: "sports", label: "Sports & Outdoor", icon: "sports_soccer" },
];

export default function PostItemPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        price_per_day: "",
        location: "",
        specs: {} as Record<string, string>,
    });

    const [specKey, setSpecKey] = useState("");
    const [specValue, setSpecValue] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageFiles.length > 5) {
            setError("You can upload a maximum of 5 images.");
            return;
        }
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setImageFiles((prev) => [...prev, ...files]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (idx: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== idx));
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const addSpec = () => {
        if (!specKey.trim() || !specValue.trim()) return;
        setFormData((prev) => ({
            ...prev,
            specs: { ...prev.specs, [specKey.trim()]: specValue.trim() },
        }));
        setSpecKey("");
        setSpecValue("");
    };

    const removeSpec = (key: string) => {
        const updated = { ...formData.specs };
        delete updated[key];
        setFormData((prev) => ({ ...prev, specs: updated }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const supabase = createClient();

            // Check auth
            const {
                data: { user },
                error: authErr,
            } = await supabase.auth.getUser();
            if (authErr || !user) {
                setError("Please log in to post an item.");
                setLoading(false);
                return;
            }

            // Upload images to Supabase Storage
            const uploadedUrls: string[] = [];
            for (const file of imageFiles) {
                const ext = file.name.split(".").pop();
                const filename = `${user.id}/${Date.now()}-${Math.random()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("item-images")
                    .upload(filename, file);
                if (uploadErr) {
                    setError("Failed to upload image: " + uploadErr.message);
                    setLoading(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(filename);
                uploadedUrls.push(urlData.publicUrl);
            }

            // Insert item into DB
            const { data: newItem, error: insertErr } = await supabase
                .from("items")
                .insert({
                    title: formData.title,
                    description: formData.description,
                    price_per_day: parseFloat(formData.price_per_day),
                    category: formData.category,
                    location: formData.location,
                    images: uploadedUrls,
                    specs: Object.keys(formData.specs).length > 0 ? formData.specs : null,
                    user_id: user.id,
                    is_available: true,
                })
                .select()
                .single();

            if (insertErr) {
                setError("Failed to post item: " + insertErr.message);
                setLoading(false);
                return;
            }

            router.push(`/items/${newItem.id}?posted=true`);
        } catch (e) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const canProceedStep1 = formData.title && formData.category && formData.description;
    const canProceedStep2 = formData.price_per_day && formData.location;

    return (
        <div className="min-h-screen bg-[#f6f7f8]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/">
                        <div className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Post an Item</h1>
                        <p className="text-xs text-slate-500">Step {step} of 3</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-slate-100 max-w-xl mx-auto">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-6 pb-32 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-extrabold">Basic Information</h2>
                            <p className="text-sm text-slate-500 mt-1">Tell us what you're renting out</p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">Item Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Sony Alpha A7 IV Camera"
                                value={formData.title}
                                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                className="w-full h-12 px-4 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">Category *</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, category: cat.value }))}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${formData.category === cat.value
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-primary/30"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                        <span className="text-xs">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">Description *</label>
                            <textarea
                                rows={4}
                                placeholder="Describe your item, what's included, condition, etc."
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </div>

                        {/* Specs */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">
                                Technical Specs <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Key (e.g. Resolution)"
                                    value={specKey}
                                    onChange={(e) => setSpecKey(e.target.value)}
                                    className="flex-1 h-10 px-3 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary"
                                />
                                <input
                                    type="text"
                                    placeholder="Value (e.g. 33MP)"
                                    value={specValue}
                                    onChange={(e) => setSpecValue(e.target.value)}
                                    className="flex-1 h-10 px-3 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={addSpec}
                                    className="size-10 bg-primary text-white rounded-lg flex items-center justify-center shrink-0"
                                >
                                    <span className="material-symbols-outlined text-xl">add</span>
                                </button>
                            </div>
                            {Object.entries(formData.specs).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(formData.specs).map(([k, v]) => (
                                        <div key={k} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                                            <span>{k}: {v}</span>
                                            <button onClick={() => removeSpec(k)} className="ml-1 text-primary/60 hover:text-primary">
                                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            disabled={!canProceedStep1}
                            onClick={() => setStep(2)}
                            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 2: Price & Location */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-extrabold">Price & Location</h2>
                            <p className="text-sm text-slate-500 mt-1">Set your daily rental price</p>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">Daily Rental Price (₹) *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.price_per_day}
                                    onChange={(e) => setFormData((p) => ({ ...p, price_per_day: e.target.value }))}
                                    className="w-full h-12 pl-8 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">GoRental takes a 12% service fee. You'll earn ₹{formData.price_per_day ? Math.round(parseFloat(formData.price_per_day) * 0.88).toLocaleString() : 0}/day.</p>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1.5">Pickup Location *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">location_on</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Sadar, Nagpur"
                                    value={formData.location}
                                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                                    className="w-full h-12 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 h-14 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                disabled={!canProceedStep2}
                                onClick={() => setStep(3)}
                                className="flex-1 h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Photos */}
                {step === 3 && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-extrabold">Add Photos</h2>
                            <p className="text-sm text-slate-500 mt-1">Good photos get 3x more bookings</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        {imagePreviews.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary transition-colors bg-white"
                            >
                                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                <p className="text-sm font-medium">Tap to add photos</p>
                                <p className="text-xs">Up to 5 images • JPG, PNG, WEBP</p>
                            </button>
                        ) : (
                            <div>
                                <div className="grid grid-cols-3 gap-2">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                                            <img src={src} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Cover</div>
                                            )}
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-2xl">add</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2">
                            <h4 className="font-bold text-sm">Review Your Listing</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Title</span>
                                <span className="font-semibold text-slate-900 text-right max-w-[55%] truncate">{formData.title}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Category</span>
                                <span className="font-semibold capitalize">{formData.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Price</span>
                                <span className="font-semibold text-primary">₹{formData.price_per_day}/day</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Location</span>
                                <span className="font-semibold">{formData.location}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 h-14 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Posting...
                                    </>
                                ) : (
                                    "🚀 Post Item"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
