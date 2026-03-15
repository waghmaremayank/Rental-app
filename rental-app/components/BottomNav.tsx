"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", icon: "home", isOutline: false },
    { href: "/explore", icon: "map", isOutline: false },
    { href: "/post-item", icon: "add_circle", isOutline: true },
    { href: "/cart", icon: "shopping_cart", isOutline: false },
    { href: "/profile", icon: "account_circle", isOutline: false },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
            <nav className="bg-white rounded-full h-[64px] w-full max-w-md flex items-center justify-between px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex items-center justify-center h-full flex-1"
                        >
                            {isActive && (
                                <>
                                    {/* Outer Glassy Ring overlapping the navbar */}
                                    <div className="absolute w-[80px] h-[80px] bg-white/40 backdrop-blur-md rounded-full border-2 border-white/70 shadow-sm z-0" />
                                    {/* Inner Light Blue Pill */}
                                    <div className="absolute w-[64px] h-[48px] bg-[#E3F2FF] rounded-full z-10" />
                                </>
                            )}

                            <span
                                className={`material-symbols-outlined text-[28px] transition-colors duration-200 z-20 ${isActive ? "text-[#137fec]" : "text-black"
                                    }`}
                                style={{
                                    fontVariationSettings: `'FILL' ${item.isOutline && !isActive ? "0" : (item.isOutline && isActive ? "0" : "1")}, 'wght' 600`
                                }}
                            >
                                {item.icon}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

