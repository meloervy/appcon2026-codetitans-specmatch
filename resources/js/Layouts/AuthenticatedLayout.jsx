import Dropdown from '@/Components/Dropdown';
import SpecMatchLogo from '@/Components/SpecMatchLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const isCurrentRoute = (pattern) => {
        try {
            return route().current(pattern);
        } catch {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col lg:flex-row">
            {/* ========================================================================= */}
            {/* DESKTOP SIDEBAR (Visible on lg and larger)                                */}
            {/* ========================================================================= */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800 z-30 transition-colors select-none">
                {/* Brand / Logo Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-zinc-800/80">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <SpecMatchLogo variant="full" size={26} showBadge={true} />
                    </Link>
                </div>

                {/* Grouped Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 text-xs font-medium">
                    {/* SECTION: Overview */}
                    <div>
                        <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Overview
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('dashboard')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('dashboard')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION: Fleet & Assets */}
                    <div>
                        <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Fleet & Hardware
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('devices.index')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('devices.*')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Inventory Pool</span>
                            </Link>

                            <Link
                                href={route('maintenance.index')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('maintenance.*')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Maintenance Hub</span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION: Organization */}
                    <div>
                        <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Organization
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('employees.index')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('employees.*')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Staff & Employees</span>
                            </Link>

                            <Link
                                href={route('role-profiles.index')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('role-profiles.*')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Workload Profiles</span>
                            </Link>
                        </div>
                    </div>

                    {/* SECTION: Intelligence & Matching */}
                    <div>
                        <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Intelligence & AI
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('match.index')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('match.*')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-[#026eff] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-semibold'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>AI Spec Match</span>
                            </Link>

                            <Link
                                href={route('mismatches.index')}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                                    isCurrentRoute('mismatches.*')
                                        ? 'bg-[#026eff] text-white font-semibold shadow-xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Mismatches Audit</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Sidebar Footer: Theme Toggle & User Account */}
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 bg-slate-50/50 dark:bg-zinc-900/50">
                    {/* Compact Segmented Theme Switcher */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-200/60 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px] font-medium">
                        <button
                            type="button"
                            onClick={() => setThemeMode('light')}
                            className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md transition cursor-pointer ${
                                !isDark
                                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
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
                            className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md transition cursor-pointer ${
                                isDark
                                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span>Dark</span>
                        </button>
                    </div>

                    {/* User Profile Pill & Dropdown */}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800/90 transition cursor-pointer text-left group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-[#026eff]/15 dark:bg-sky-950/60 text-[#026eff] dark:text-sky-300 flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                                            {user.role_title || user.role || 'Staff'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 transition shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </div>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content width="full" placement="top" align="top" contentClasses="py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl">
                            <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs">
                                <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">{user.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{user.email}</div>
                            </div>
                            <div className="py-1">
                                <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2.5 text-xs">
                                    <svg className="w-4 h-4 text-slate-400 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Profile Settings</span>
                                </Dropdown.Link>
                                <div className="border-t border-slate-100 dark:border-zinc-800/80 my-1"></div>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                >
                                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="font-semibold">Log Out</span>
                                </Dropdown.Link>
                            </div>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* ========================================================================= */}
            {/* MOBILE TOP BAR & DRAWER (Visible on mobile/tablet)                        */}
            {/* ========================================================================= */}
            <div className="lg:hidden border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 sticky top-0 z-40 backdrop-blur-md">
                <div className="flex h-14 items-center justify-between px-4">
                    <Link href="/dashboard" className="flex items-center">
                        <SpecMatchLogo variant="full" size={24} showBadge={true} />
                    </Link>

                    <div className="flex items-center gap-2">
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
                                <svg className="w-4 h-4 text-[#026eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                            aria-label="Toggle Navigation Menu"
                        >
                            <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={!mobileMenuOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 space-y-1 text-xs">
                        <Link
                            href={route('dashboard')}
                            className={`block px-3 py-2 rounded-lg ${isCurrentRoute('dashboard') ? 'bg-[#026eff] text-white font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route('devices.index')}
                            className={`block px-3 py-2 rounded-lg ${isCurrentRoute('devices.*') ? 'bg-[#026eff] text-white font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}
                        >
                            Inventory Pool
                        </Link>
                        <Link
                            href={route('maintenance.index')}
                            className={`block px-3 py-2 rounded-lg ${isCurrentRoute('maintenance.*') ? 'bg-[#026eff] text-white font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}
                        >
                            Maintenance Hub
                        </Link>
                        <Link
                            href={route('employees.index')}
                            className={`block px-3 py-2 rounded-lg ${isCurrentRoute('employees.*') ? 'bg-[#026eff] text-white font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}
                        >
                            Staff & Employees
                        </Link>
                        <Link
                            href={route('role-profiles.index')}
                            className={`block px-3 py-2 rounded-lg ${isCurrentRoute('role-profiles.*') ? 'bg-[#026eff] text-white font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}
                        >
                            Workload Profiles
                        </Link>
                        <Link
                            href={route('match.index')}
                            className={`block px-3 py-2 rounded-lg font-semibold ${isCurrentRoute('match.*') ? 'bg-[#026eff] text-white' : 'text-[#026eff] dark:text-sky-400'}`}
                        >
                            AI Spec Match
                        </Link>
                        <Link
                            href={route('mismatches.index')}
                            className={`block px-3 py-2 rounded-lg ${isCurrentRoute('mismatches.*') ? 'bg-[#026eff] text-white font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}
                        >
                            Mismatches Audit
                        </Link>

                        <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 mt-3">
                            <div className="px-3 py-1 font-semibold text-slate-800 dark:text-zinc-200">{user.name} ({user.role})</div>
                            <Link href={route('profile.edit')} className="block px-3 py-2 text-slate-600 dark:text-zinc-400">
                                Profile Settings
                            </Link>
                            <Link method="post" href={route('logout')} as="button" className="block w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 font-semibold">
                                Log Out
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MAIN CONTENT AREA                                                         */}
            {/* ========================================================================= */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs shadow-2xs">
                            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs shadow-2xs">
                            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Page Header Bar */}
                {header && (
                    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-4">
                        {header}
                    </header>
                )}

                {/* Main Page Workspace */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
