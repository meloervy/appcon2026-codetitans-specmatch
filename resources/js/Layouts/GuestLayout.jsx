import SpecMatchLogo from '@/Components/SpecMatchLogo';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GuestLayout({ children }) {
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
        <div className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pt-6 sm:justify-center sm:pt-0 relative px-4 font-sans">
            <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="absolute top-4 right-4 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
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

            <div>
                <Link href="/" className="flex items-center">
                    <SpecMatchLogo variant="stacked" size={32} showBadge={true} />
                </Link>
            </div>

            <div className="mt-5 w-full overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 px-6 py-6 shadow-xs sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
