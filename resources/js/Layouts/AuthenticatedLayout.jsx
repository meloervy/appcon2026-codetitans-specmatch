import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import SpecMatchLogo from '@/Components/SpecMatchLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    RiDashboard3Line,
    RiComputerLine,
    RiToolsLine,
    RiShieldUserLine,
    RiTeamLine,
    RiSparklingLine,
    RiAlertLine,
    RiUser3Line,
    RiLogoutBoxRLine,
    RiBuildingLine,
    RiArrowDownSLine,
    RiSunLine,
    RiMoonLine,
    RiArrowRightSLine,
    RiSettings4Line,
} from 'react-icons/ri';

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
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-150 font-sans">
            {/* Top Navigation Bar */}
            <nav className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 sticky top-0 z-30 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 justify-between items-center">
                        <div className="flex items-center gap-7">
                            <Link href="/dashboard" className="flex items-center group">
                                <SpecMatchLogo variant="full" size={26} />
                            </Link>

                            <div className="hidden lg:flex items-center space-x-1">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    <RiDashboard3Line className="w-4 h-4 mr-1.5 shrink-0" />
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('devices.index')} active={route().current('devices.*')}>
                                    <RiComputerLine className="w-4 h-4 mr-1.5 shrink-0" />
                                    Inventory
                                </NavLink>
                                <NavLink href={route('maintenance.index')} active={route().current('maintenance.*')}>
                                    <RiToolsLine className="w-4 h-4 mr-1.5 shrink-0" />
                                    Maintenance
                                </NavLink>
                                <NavLink href={route('role-profiles.index')} active={route().current('role-profiles.*')}>
                                    <RiShieldUserLine className="w-4 h-4 mr-1.5 shrink-0" />
                                    Role Profiles
                                </NavLink>
                                <NavLink href={route('employees.index')} active={route().current('employees.*')}>
                                    <RiTeamLine className="w-4 h-4 mr-1.5 shrink-0" />
                                    Employees
                                </NavLink>
                                <NavLink href={route('match.index')} active={route().current('match.*')} className="text-[#026eff] dark:text-[#38bdf8]">
                                    <span className="flex items-center gap-1.5 font-semibold">
                                        <RiSparklingLine className="w-4 h-4 shrink-0 text-[#026eff] dark:text-[#38bdf8]" />
                                        AI Match
                                    </span>
                                </NavLink>
                                <NavLink href={route('mismatches.index')} active={route().current('mismatches.*')}>
                                    <RiAlertLine className="w-4 h-4 mr-1.5 shrink-0" />
                                    Mismatches
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden lg:flex lg:items-center lg:gap-3">

                            {/* Profile & Theme Toggle Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:border-[#026eff]/40 dark:hover:border-[#026eff]/40 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-2xs transition"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#026eff] to-sky-400 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ring-2 ring-white dark:ring-zinc-900">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-zinc-200 max-w-[120px] truncate">{user.name}</span>
                                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                                            {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : user.role === 'technician' ? 'Tech' : 'Staff'}
                                        </span>
                                        <RiArrowDownSLine className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content width="64">
                                    {/* User Identity Header Card */}
                                    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-xl border border-slate-200/70 dark:border-zinc-800/80 mb-2">
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#026eff] to-sky-400 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate">
                                                    {user.name}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10px]">
                                            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-300 truncate">
                                                <RiBuildingLine className="w-3 h-3 text-slate-400" />
                                                <span>{user.department || 'All Departments'}</span>
                                            </span>
                                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] border border-[#026eff]/20 dark:border-[#031a40]/60">
                                                {user.role_title || (user.role ? user.role.toUpperCase() : 'STAFF')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Appearance Switch */}
                                    <div className="px-2 py-1.5 mb-1 bg-slate-50/50 dark:bg-zinc-800/30 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 mb-1 flex items-center justify-between">
                                            <span>Theme Mode</span>
                                            <span className="text-[9px] font-medium text-slate-400 capitalize">{isDark ? 'Dark' : 'Light'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 bg-slate-200/60 dark:bg-zinc-800/90 p-0.5 rounded-lg text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setThemeMode('light')}
                                                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                                                    !isDark
                                                        ? 'bg-white text-slate-900 shadow-2xs'
                                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <RiSunLine className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Light</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setThemeMode('dark')}
                                                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                                                    isDark
                                                        ? 'bg-zinc-700 text-white shadow-2xs'
                                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <RiMoonLine className="w-3.5 h-3.5 text-sky-400" />
                                                <span>Dark</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-0.5 pt-0.5">
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            icon={RiSettings4Line}
                                            description="Account security & preferences"
                                        >
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            icon={RiLogoutBoxRLine}
                                            variant="danger"
                                            description="End session & lock screen"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </div>
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
                                    <svg className="w-4 h-4 text-[#026eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <span className="flex items-center gap-2">
                                <RiDashboard3Line className="w-4 h-4 shrink-0" />
                                Dashboard
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('devices.index')} active={route().current('devices.*')}>
                            <span className="flex items-center gap-2">
                                <RiComputerLine className="w-4 h-4 shrink-0" />
                                Inventory
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('maintenance.index')} active={route().current('maintenance.*')}>
                            <span className="flex items-center gap-2">
                                <RiToolsLine className="w-4 h-4 shrink-0" />
                                Maintenance
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('role-profiles.index')} active={route().current('role-profiles.*')}>
                            <span className="flex items-center gap-2">
                                <RiShieldUserLine className="w-4 h-4 shrink-0" />
                                Role Profiles
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('employees.index')} active={route().current('employees.*')}>
                            <span className="flex items-center gap-2">
                                <RiTeamLine className="w-4 h-4 shrink-0" />
                                Employees
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('match.index')} active={route().current('match.*')}>
                            <span className="flex items-center gap-2 font-semibold text-[#026eff] dark:text-[#38bdf8]">
                                <RiSparklingLine className="w-4 h-4 shrink-0 text-[#026eff] dark:text-[#38bdf8]" />
                                AI Match
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('mismatches.index')} active={route().current('mismatches.*')}>
                            <span className="flex items-center gap-2">
                                <RiAlertLine className="w-4 h-4 shrink-0" />
                                Mismatches
                            </span>
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
