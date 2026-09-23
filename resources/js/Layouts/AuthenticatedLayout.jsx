import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark) || hasDarkClass) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const setThemeMode = (mode) => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-150">
            {/* Top Navigation Bar */}
            <nav className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 sticky top-0 z-30 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 justify-between items-center">
                        <div className="flex items-center gap-7">
                            <Link href="/dashboard" className="flex items-center gap-2.5 group">
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xs">
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                </div>
                                <div className="leading-tight flex items-center gap-1.5">
                                    <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-zinc-50">
                                        SpecMatch
                                    </span>
                                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                                        ITAM
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden lg:flex items-center space-x-1">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('devices.index')} active={route().current('devices.*')}>
                                    Inventory
                                </NavLink>
                                <NavLink href={route('maintenance.index')} active={route().current('maintenance.*')}>
                                    Maintenance
                                </NavLink>
                                <NavLink href={route('role-profiles.index')} active={route().current('role-profiles.*')}>
                                    Role Profiles
                                </NavLink>
                                <NavLink href={route('employees.index')} active={route().current('employees.*')}>
                                    Employees
                                </NavLink>
                                <NavLink href={route('match.index')} active={route().current('match.*')} className="text-indigo-600 dark:text-indigo-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        AI Match
                                    </span>
                                </NavLink>
                                <NavLink href={route('mismatches.index')} active={route().current('mismatches.*')}>
                                    Mismatches
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden lg:flex lg:items-center lg:gap-3">
                            <Link
                                href={route('match.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Match
                            </Link>

                            {/* Profile & Theme Toggle Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span>{user.name}</span>
                                        <svg className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content width="56">
                                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs">
                                        <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{user.name}</div>
                                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{user.email}</div>
                                    </div>

                                    {/* Light / Dark Mode Segmented Switch */}
                                    <div className="p-2 border-b border-slate-100 dark:border-zinc-800">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1.5 mb-1.5">
                                            Appearance
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setThemeMode('light')}
                                                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-medium transition ${
                                                    !isDark
                                                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <span>Light</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setThemeMode('dark')}
                                                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-medium transition ${
                                                    isDark
                                                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                                <span>Dark</span>
                                            </button>
                                        </div>
                                    </div>

                                    <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                            >
                                <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={!showingNavigationDropdown ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {showingNavigationDropdown && (
                    <div className="lg:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('devices.index')} active={route().current('devices.*')}>
                            Inventory
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('maintenance.index')} active={route().current('maintenance.*')}>
                            Maintenance
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('role-profiles.index')} active={route().current('role-profiles.*')}>
                            Role Profiles
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('employees.index')} active={route().current('employees.*')}>
                            Employees
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('match.index')} active={route().current('match.*')}>
                            AI Match Engine
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('mismatches.index')} active={route().current('mismatches.*')}>
                            Mismatches
                        </ResponsiveNavLink>

                        <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 mt-3">
                            <div className="flex items-center justify-between px-3 py-1.5 mb-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Theme</span>
                                <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setThemeMode('light')}
                                        className={`px-2 py-0.5 rounded font-medium ${!isDark ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'}`}
                                    >
                                        Light
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setThemeMode('dark')}
                                        className={`px-2 py-0.5 rounded font-medium ${isDark ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'}`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>
                            <ResponsiveNavLink href={route('profile.edit')}>Profile Settings</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                )}
            </nav>

            {/* Flash Alerts */}
            {flash?.success && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs shadow-2xs">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs shadow-2xs">
                        <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Page Header */}
            {header && (
                <header className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/80 py-4 transition-colors">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
