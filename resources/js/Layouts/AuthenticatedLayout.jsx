import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top Navigation */}
            <nav className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                </div>
                                <div className="leading-tight">
                                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                                        SpecMatch
                                    </span>
                                    <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        IT Asset Intel
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden lg:flex space-x-1">
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
                                <NavLink href={route('match.index')} active={route().current('match.*')} className="font-semibold text-indigo-600">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
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

                        <div className="hidden lg:flex lg:items-center lg:gap-4">
                            <Link
                                href={route('match.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Match Request
                            </Link>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span>{user.name}</span>
                                        <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                                        Signed in as <span className="font-semibold text-slate-700">{user.email}</span>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center lg:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
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
                    <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
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
                        <div className="border-t border-slate-100 pt-2 mt-2">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
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
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-sm shadow-xs">
                        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-sm shadow-xs">
                        <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Page Header */}
            {header && (
                <header className="bg-white border-b border-slate-200 py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
