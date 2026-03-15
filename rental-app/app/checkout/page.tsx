import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function CheckoutPage() {
    return (
        <div className="relative mx-auto max-w-md min-h-screen flex flex-col bg-background-light text-slate-900 pb-36">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center bg-background-light/80 backdrop-blur-md p-4 justify-between border-b border-slate-200">
                <Link href="/cart" className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Checkout</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Delivery Address Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-slate-900 text-lg font-bold">Delivery Address</h3>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                            <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                            <p className="text-slate-900 text-base font-semibold leading-normal">Home</p>
                            <p className="text-slate-500 text-sm font-normal leading-normal line-clamp-1">Nagpur, Maharashtra, 440001</p>
                        </div>
                        <button className="flex h-9 px-4 items-center justify-center rounded-lg bg-slate-100 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors">
                            Change
                        </button>
                    </div>
                </section>

                {/* Rental Duration Section */}
                <section>
                    <h3 className="text-slate-900 text-lg font-bold mb-3">Rental Duration</h3>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                            <span className="material-symbols-outlined">calendar_today</span>
                        </div>
                        <div className="flex flex-col flex-1">
                            <p className="text-slate-900 text-base font-semibold">2 Days</p>
                            <p className="text-slate-500 text-sm">Oct 24 - Oct 26, 2023</p>
                        </div>
                        <div className="text-slate-400">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </div>
                </section>

                {/* Payment Method Section */}
                <section>
                    <h3 className="text-slate-900 text-lg font-bold mb-3">Payment Method</h3>
                    <div className="space-y-3">
                        {/* Selected UPI Option */}
                        <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border-2 border-primary shadow-sm relative overflow-hidden">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-slate-900 text-base font-bold">UPI Payments</p>
                                <p className="text-slate-600 text-xs">Google Pay / PhonePe / Paytm</p>
                            </div>
                            <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white">
                                <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                        </div>

                        {/* Credit Card */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-80 cursor-pointer">
                            <div className="text-slate-500 flex items-center justify-center rounded-lg bg-slate-100 shrink-0 size-12">
                                <span className="material-symbols-outlined">credit_card</span>
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-slate-900 text-base font-medium">Credit / Debit Card</p>
                            </div>
                            <div className="size-5 border-2 border-slate-300 rounded-full"></div>
                        </div>

                        {/* Net Banking */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-80 cursor-pointer">
                            <div className="text-slate-500 flex items-center justify-center rounded-lg bg-slate-100 shrink-0 size-12">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-slate-900 text-base font-medium">Net Banking</p>
                            </div>
                            <div className="size-5 border-2 border-slate-300 rounded-full"></div>
                        </div>
                    </div>
                </section>

                {/* Order Summary Section */}
                <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mt-8">
                    <h3 className="text-slate-900 text-lg font-bold mb-4">Order Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-600 text-sm">
                            <span>Rental Fee (2 Days)</span>
                            <span>₹2,499</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-sm">
                            <span>Security Deposit (Refundable)</span>
                            <span>₹5,000</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-sm">
                            <span>Delivery Fee</span>
                            <span className="text-green-600 font-medium">FREE</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex justify-between text-slate-900 text-xl font-bold">
                            <span>Total</span>
                            <span>₹7,499</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sticky Footer Action */}
            <div className="fixed bottom-[104px] left-0 right-0 p-4 bg-background-light/95 backdrop-blur-sm z-20 flex justify-center pointer-events-none">
                <div className="w-full max-w-md pointer-events-auto px-4">
                    <Link href="/cart">
                        <button className="w-full h-14 bg-primary text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <span>Pay & Confirm</span>
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </Link>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
