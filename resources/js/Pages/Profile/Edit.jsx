import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import {
    RiUser3Line,
    RiLockPasswordLine,
    RiAlertLine,
    RiShieldCheckLine,
    RiShieldUserLine,
    RiBuildingLine,
    RiCalendarLine,
    RiMailLine,
    RiSparklingLine,
    RiComputerLine,
    RiTeamLine,
    RiLockLine,
    RiInformationLine,
    RiShieldFlashLine,
    RiCheckLine,
    RiArrowRightSLine,
} from 'react-icons/ri';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'danger'

    const formattedJoinDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
          })
        : 'Active Member';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                            <Link
                                href={route('dashboard')}
                                className="hover:text-slate-800 dark:hover:text-zinc-200 transition"
                            >
                                Dashboard
                            </Link>
                            <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">
                                Settings
                            </span>
                            <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[#026eff] dark:text-sky-400 font-semibold">
                                Profile & Security
                            </span>
                        </div>
                        <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-zinc-100">
                            Profile & Account Settings
                        </h1>
                    </div>
                </div>
            }
        >
            <Head title="Profile Settings" />

            <div className="space-y-6">
                {/* Hero Profile Identity Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#031a40] to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-sm">
                    {/* Background Subtle Highlights */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#026eff]/15 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* User Identity Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Avatar with Glow & Active Status */}
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#026eff] to-sky-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-white/10 dark:ring-zinc-800">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span
                                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900 dark:ring-zinc-950 flex items-center justify-center"
                                    title="Active Online"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                </span>
                            </div>

                            {/* Name, Email & Badges */}
                            <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                        {user.name}
                                    </h2>
                                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#026eff]/30 text-sky-300 border border-[#026eff]/40 shadow-2xs">
                                        {user.role_title || (user.role ? user.role.toUpperCase() : 'IT ADMINISTRATOR')}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-300">
                                    <span className="inline-flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                        <RiMailLine className="w-4 h-4 text-sky-400 shrink-0" />
                                        <span>{user.email}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                        <RiBuildingLine className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{user.department || 'IT Infrastructure & Systems'}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-2 text-slate-400 pl-1">
                                        <RiCalendarLine className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>Member since {formattedJoinDate}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Security Status Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 shrink-0">
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs min-w-[120px]">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Verification</span>
                                </div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    {user.email_verified_at ? (
                                        <span className="text-emerald-400 flex items-center gap-1">
                                            <RiCheckLine className="w-3.5 h-3.5" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="text-amber-400 flex items-center gap-1">
                                            <RiAlertLine className="w-3.5 h-3.5" />
                                            Pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs min-w-[120px]">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <RiShieldUserLine className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Authority Tier</span>
                                </div>
                                <div className="text-xs font-bold text-white truncate">
                                    {user.role === 'admin' ? 'Level 1 Superadmin' : user.role === 'manager' ? 'Level 2 Asset Mgr' : 'Level 3 Operator'}
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs min-w-[120px]">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <RiLockLine className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Session Protocol</span>
                                </div>
                                <div className="text-xs font-bold text-white">
                                    TLS 1.3 / Protected
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-2 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                            activeTab === 'general'
                                ? 'bg-[#026eff] text-white shadow-2xs'
                                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <RiUser3Line className="w-4 h-4" />
                        <span>General Profile</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                            activeTab === 'security'
                                ? 'bg-[#026eff] text-white shadow-2xs'
                                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <RiLockPasswordLine className="w-4 h-4" />
                        <span>Security & Password</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('danger')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                            activeTab === 'danger'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200/80 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                        }`}
                    >
                        <RiAlertLine className="w-4 h-4" />
                        <span>Danger Zone</span>
                    </button>
                </div>

                {/* Tab Content Panels */}
                <div className="space-y-6">
                    {/* Tab 1: General Profile */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>

                            {/* Sidebar: Role Capabilities */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                        <div className="w-8 h-8 rounded-lg bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-sky-400 flex items-center justify-center shrink-0">
                                            <RiShieldUserLine className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                                                Role Capabilities
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                Assigned access scope
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                                            <RiSparklingLine className="w-4 h-4 text-[#026eff] dark:text-sky-400 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">AI Matching Pipeline</span>
                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Execute heuristic matching & bridge swaps</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                                            <RiComputerLine className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">Fleet & Inventory Ops</span>
                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Provision devices, adjust lifecycle & maintenance</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                                            <RiTeamLine className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">Employee & Role Benchmarks</span>
                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Map staff role profiles & manage reassignments</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Security & Password */}
                    {activeTab === 'security' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                                <UpdatePasswordForm />
                            </div>

                            {/* Sidebar: Security Guidelines */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-[#026eff] dark:text-sky-400 flex items-center justify-center shrink-0">
                                            <RiShieldFlashLine className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                                                Security Best Practices
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                Admin credential standards
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                                            <RiCheckLine className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">Complex Passphrase</span>
                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Use a mixture of uppercase, lowercase, numbers, and symbols.</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                                            <RiLockLine className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">Dedicated Credentials</span>
                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Never share administrative passwords across personal services.</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                                            <RiInformationLine className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">Session Expiration</span>
                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Sessions automatically invalidate after idle timeout.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Danger Zone */}
                    {activeTab === 'danger' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 shadow-xs">
                                <DeleteUserForm />
                            </div>

                            {/* Sidebar: Compliance & Safeguards */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                            <RiAlertLine className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                                                Audit Safeguards
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                Data governance notice
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                        Prior activity logs, maintenance records, and match executions previously performed will retain an anonymized audit footprint for regulatory IT compliance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
