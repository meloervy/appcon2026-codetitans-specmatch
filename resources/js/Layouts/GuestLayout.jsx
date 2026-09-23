import SpecMatchLogo from '@/Components/SpecMatchLogo';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GuestLayout({
    children,
    image = '/images/login_image.jpeg',
    darkImage = '/images/login_dark_image.jpeg',
    maxWidth = 'max-w-md',
}) {
    const [isDark, setIsDark] = useState(false);

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

    return (
        <div className="h-screen max-h-screen overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans selection:bg-[#026eff] selection:text-white">
            {/* LEFT COLUMN: Hero Image & Branding (5 cols on lg, 6 cols on xl) */}
            <div className="hidden lg:relative lg:col-span-5 xl:col-span-6 lg:flex flex-col justify-between p-8 xl:p-10 overflow-hidden bg-slate-950 text-white h-full border-r border-slate-200/80 dark:border-zinc-800/80">
                {/* Background Image with crisp subtle dark gradient */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={image}
                        alt="SpecMatch ITAM"
                        className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-100 dark:hidden"
                    />
                    <img
                        src={darkImage}
                        alt="SpecMatch ITAM Dark"
                        className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-100 hidden dark:block"
                    />
                    {/* Minimal Dark Gradient Overlay to keep image clear and vibrant while maintaining text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
                </div>

                {/* Top: Logo & Platform Identity */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <SpecMatchLogo variant="full" size={32} showBadge={true} textClassName="text-white drop-shadow-md" />
                    </Link>
                </div>

                {/* Bottom: Value Props & Highlights */}
                <div className="relative z-10 space-y-4 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-sky-200 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Next-Gen IT Asset Intelligence
                    </div>

                    <div className="space-y-1.5">
                        <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
                            Optimize enterprise hardware matching with precision.
                        </h2>
                        <p className="text-xs text-slate-200 leading-relaxed drop-shadow-xs">
                            SpecMatch accelerates device allocation, mitigates hardware bottlenecks, and streamlines asset lifecycles across enterprise teams.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-0.5 text-xs text-slate-200">
                        <div className="flex items-center gap-2 rounded-lg bg-slate-900/70 backdrop-blur-md p-2 border border-white/15 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-[#0aceb3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[11px] font-medium">Automated Spec Match</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-slate-900/70 backdrop-blur-md p-2 border border-white/15 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-[#0b79ff] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[11px] font-medium">Fleet Health Diagnostics</span>
                        </div>
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
                                <svg className="w-4 h-4 text-[#026eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    &copy; {new Date().getFullYear()} SpecMatch Enterprise ITAM.
                </div>
            </div>
        </div>
    );
}
