import Dropdown from '@/Components/Dropdown';
import GeminiFleetAssistant from '@/Components/GeminiFleetAssistant';
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
    RiSunLine,
    RiMoonLine,
    RiUserLine,
    RiLogoutBoxRLine,
    RiArrowDownSLine,
} from 'react-icons/ri';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsAssistantOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

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
                            <Link href="/dashboard" className="flex items-center group shrink-0">
                                <SpecMatchLogo variant="full" size={26} showBadge={true} />
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

                        <div className="hidden lg:flex lg:items-center lg:gap-2.5 shrink-0">
                            {/* Profile & Theme Toggle Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:border-[#026eff]/40 dark:hover:border-[#026eff]/40 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-2xs transition shrink-0 cursor-pointer"
                                    >
                                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-tr from-[#026eff] to-sky-400 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ring-2 ring-white dark:ring-zinc-900 shrink-0">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-zinc-200 max-w-[120px] truncate">{user.name}</span>
                                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                                            {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : user.role === 'technician' ? 'Tech' : (user.role_title || 'Staff')}
                                        </span>
                                        <RiArrowDownSLine className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition shrink-0" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content width="56">
                                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs">
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#026eff]/15 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{user.name}</div>
                                                <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1">
                                            <div>
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] border border-[#026eff]/20 dark:border-[#031a40]/60">
                                                    {user.role_title || (user.role === 'admin' ? 'IT Administrator' : user.role === 'manager' ? 'IT Manager' : 'Staff')}
                                                </span>
                                            </div>
                                            {(user.department || user.job_title) && (
                                                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5 truncate">
                                                    <span>🏢</span>
                                                    <span className="truncate">{user.department || user.job_title}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Appearance: Simple switch toggle (icon only, no text) */}
                                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                                            Appearance
                                        </span>
                                        <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800/90 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                                            <button
                                                type="button"
                                                onClick={() => setThemeMode('light')}
                                                className={`p-1.5 rounded-md transition cursor-pointer ${
                                                    !isDark
                                                        ? 'bg-white dark:bg-zinc-700 text-amber-500 shadow-2xs'
                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                                }`}
                                                title="Light mode"
                                                aria-label="Light mode"
                                            >
                                                <RiSunLine className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setThemeMode('dark')}
                                                className={`p-1.5 rounded-md transition cursor-pointer ${
                                                    isDark
                                                        ? 'bg-white dark:bg-zinc-700 text-[#026eff] dark:text-[#38bdf8] shadow-2xs'
                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                                }`}
                                                title="Dark mode"
                                                aria-label="Dark mode"
                                            >
                                                <RiMoonLine className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <Dropdown.Link href={route('profile.edit')}>
                                        <div className="flex items-center gap-2">
                                            <RiUserLine className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                                            <span>Profile Settings</span>
                                        </div>
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                            <RiLogoutBoxRLine className="w-4 h-4 shrink-0" />
                                            <span>Log Out</span>
                                        </div>
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
                        {/* Mobile User Profile Header */}
                        <div className="flex items-center gap-3 p-2.5 mb-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#026eff]/15 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-100 truncate">{user.name}</span>
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#026eff] dark:text-[#38bdf8] px-1.5 py-0.5 rounded bg-[#026eff]/10 dark:bg-[#026eff]/20 shrink-0">
                                        {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : user.role === 'technician' ? 'Tech' : (user.role_title || 'Staff')}
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">{user.email}</span>
                            </div>
                        </div>

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
                            <ResponsiveNavLink href={route('profile.edit')}>
                                <span className="flex items-center gap-2">
                                    <RiUserLine className="w-4 h-4 shrink-0" />
                                    Profile Settings
                                </span>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                    <RiLogoutBoxRLine className="w-4 h-4 shrink-0" />
                                    Log Out
                                </span>
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

            {/* Gemini Fleet Assistant Floating Copilot */}
            <GeminiFleetAssistant
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                onOpen={() => setIsAssistantOpen(true)}
            />
        </div>
    );
}
