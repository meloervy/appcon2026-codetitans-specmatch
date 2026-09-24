import SpecMatchLogo from '@/Components/SpecMatchLogo';
import SpecMatchMascot from '@/Components/SpecMatchMascot';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLEET_TIPS = [
    'Tip: 1-Click Demo cards let you test IT Admin, Manager, and Tech roles instantly.',
    'Tip: SpecMatch automatically verifies CPU, RAM, and GPU requirements against live inventory.',
    'Tip: Enterprise role matching ensures every employee gets hardware fitted to their workload.',
    'Tip: Straight-line depreciation calculates real-time asset salvage values daily.',
    'Tip: Click any role on the right to sign in with preconfigured staff permissions.',
];

export default function GuestLayout({
    children,
    maxWidth = 'max-w-md',
}) {
    const [isDark, setIsDark] = useState(false);
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark) || document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    // Cycle text tips on mascot click (single 2.png image remains constant)
    const handleMascotClick = () => {
        setTipIndex((prev) => (prev + 1) % FLEET_TIPS.length);
    };

    const currentMessage = FLEET_TIPS[tipIndex];

    return (
        <div className="h-screen max-h-screen overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans selection:bg-[#026EFC] selection:text-white">
            {/* LEFT COLUMN: Official AI Mascot Hero & Branding */}
            <div className="hidden lg:relative lg:col-span-5 xl:col-span-6 lg:flex flex-col justify-between p-8 xl:p-10 overflow-hidden bg-gradient-to-br from-[#05193F] via-[#082154] to-[#030e24] text-white h-full border-r border-slate-200/80 dark:border-zinc-800/80 relative">
                {/* Ambient Cyber Grid & Glow Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(#026EFC_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
                <motion.div
                    animate={{
                        opacity: [0.15, 0.3, 0.15],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#026EFC]/20 blur-3xl pointer-events-none"
                />
                <motion.div
                    animate={{
                        opacity: [0.1, 0.25, 0.1],
                        scale: [1.1, 1, 1.1],
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#0BCDB2]/15 blur-3xl pointer-events-none"
                />

                {/* Floating Ambient Sparkles (CSS/Motion circles, no emojis) */}
                <motion.div
                    animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/3 left-16 w-2 h-2 rounded-full bg-sky-300 blur-[1px] pointer-events-none"
                />
                <motion.div
                    animate={{ y: [10, -10, 10], opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-1/3 right-16 w-2.5 h-2.5 rounded-full bg-teal-300 blur-[1px] pointer-events-none"
                />
                <motion.div
                    animate={{ y: [-8, 8, -8], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute top-1/2 right-24 w-1.5 h-1.5 rounded-full bg-sky-400 blur-[0.5px] pointer-events-none"
                />

                {/* Top: Logo & Platform Identity */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <SpecMatchLogo variant="full" size={32} showBadge={true} textClassName="text-white drop-shadow-md" />
                    </Link>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-sky-200 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AI Copilot Online
                    </div>
                </div>

                {/* Center: Official AI Mascot Fukurou Showcase (Single clean 2.png with smooth float) */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                    {/* Animated Dynamic Speech Bubble */}
                    <div className="min-h-[64px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentMessage}
                                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                                className="mb-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-xs font-semibold text-white shadow-xl text-center max-w-sm"
                            >
                                <span>{currentMessage}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Single Mascot Character with Animated Floating Motion */}
                    <div
                        onClick={handleMascotClick}
                        title="Click to interact with Fukurou"
                        className="relative group cursor-pointer flex flex-col items-center select-none"
                    >
                        {/* Interactive Breathing Glow Aura */}
                        <motion.div
                            animate={{
                                scale: [1, 1.14, 1],
                                opacity: [0.35, 0.6, 0.35],
                            }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-full bg-radial from-[#026EFC]/40 via-[#0BCDB2]/25 to-transparent blur-2xl transform scale-110 -z-10 pointer-events-none"
                        />

                        {/* Animated Fukurou Mascot (Single clean 2.png image) */}
                        <SpecMatchMascot
                            pose="greeting"
                            variant="full"
                            size={280}
                            showGlow={false}
                            animated={true}
                            className="transition-transform duration-300 group-hover:scale-105"
                            imageClassName="drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
                        />

                        {/* Synced Pedestal Shadow Breathing */}
                        <motion.div
                            animate={{
                                scale: [1, 0.82, 1],
                                opacity: [0.75, 0.4, 0.75],
                            }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="mx-auto -mt-6 w-48 h-5 rounded-full bg-slate-950/70 blur-md -z-10"
                        />
                    </div>

                    {/* Mascot Label & Quick Interaction Hint */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleMascotClick}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300/30 text-[10px] font-extrabold uppercase tracking-wider text-sky-200 mb-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                            <span>Official AI Mascot</span>
                            <span className="text-[9px] text-sky-300/80 font-normal lowercase">(click to interact)</span>
                        </button>
                        <h3 className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                            Fukurou
                        </h3>
                        <p className="text-xs text-sky-200/90 font-medium mt-0.5 max-w-xs mx-auto">
                            Real-time SQL fleet context & intelligent constraint extraction
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Form & Actions */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-6 flex flex-col justify-between h-full relative p-4 sm:p-6 lg:p-6 xl:p-8 overflow-y-auto">
                {/* Top Bar: Mobile Logo + Theme Toggle */}
                <div className="flex items-center justify-between w-full shrink-0">
                    <div className="lg:hidden">
                        <Link href="/" className="flex items-center">
                            <SpecMatchLogo variant="full" size={26} showBadge={true} />
                        </Link>
                    </div>
                    <div className="ml-auto">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
                        >
                            {isDark ? (
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-[#026EFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Center: Form Container */}
                <div className="flex flex-col items-center justify-center my-auto py-1">
                    <div className={`w-full ${maxWidth} bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs`}>
                        {children}
                    </div>
                </div>

                {/* Bottom: Subtle Footer */}
                <div className="text-center text-[11px] text-slate-400 dark:text-zinc-500 pt-1 shrink-0">
                    &copy; {new Date().getFullYear()} SpecMatch Enterprise ITAM. Powered by Official AI Mascot & Engine.
                </div>
            </div>
        </div>
    );
}
