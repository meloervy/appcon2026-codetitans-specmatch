import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ metrics, mismatches, recent_assignments, available_fleet, itam }) {
    const stageBreakdown = metrics.stage_breakdown || {
        acquisition: 0,
        deployment: metrics.total_devices || 0,
        maintenance: metrics.in_repair_devices || 0,
        retirement: metrics.retired_devices || 0,
    };

    const totalInventory = (metrics.total_devices || 0) + (metrics.retired_devices || 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                            IT Asset Operations
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Authoritative hardware fleet tracking, straight-line depreciation, and AI workload matching.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('devices.create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-xs transition"
                        >
                            <svg className="w-4 h-4 text-slate-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Register Asset
                        </Link>
                        <Link
                            href={route('match.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-xs sm:text-sm font-semibold text-white shadow-sm transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Run Match Pipeline
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="IT Operations Dashboard - SpecMatch" />

            {/* Top Primary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
                {/* 1. Fleet Acquisition Spend */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Total Acquisition Spend
                            </span>
                            <span className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                                ₱{Number(metrics.total_acquisition_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                        <span>Book Value:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ₱{Number(metrics.current_book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* 2. Procurement Avoidance Savings */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Procurement Avoidance
                            </span>
                            <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#026eff] dark:text-sky-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black tracking-tight text-[#026eff] dark:text-sky-400">
                                ₱{metrics.procurement_savings.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#026eff] dark:text-sky-300">
                                Saved
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400">
                        Capital saved by matching idle fleet units
                    </div>
                </div>

                {/* 3. Fleet Utilization */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Fleet Utilization
                            </span>
                            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                                {metrics.utilization_rate}%
                            </span>
                            <span className="text-xs text-slate-400 dark:text-zinc-500">active</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                        <span>{metrics.assigned_devices} Assigned</span>
                        <span>{metrics.idle_devices} Idle / Available</span>
                    </div>
                </div>

                {/* 4. Maintenance & Operations */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Maintenance & Servicing
                            </span>
                            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                                {metrics.in_repair_devices}
                            </span>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">in repair</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs flex items-center justify-between">
                        <span className="text-slate-500 dark:text-zinc-400">Spend: ₱{Number(metrics.total_maintenance_spend || 0).toLocaleString()}</span>
                        <Link href={route('maintenance.index')} className="font-semibold text-[#026eff] dark:text-sky-400 hover:underline inline-flex items-center gap-1 group">
                            <span>Logs</span>
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Unified Lifecycle Phase Distribution Strip */}
            <div className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            Fleet Lifecycle Phases
                        </h2>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        Total Authoritative Inventory: <strong className="text-slate-700 dark:text-zinc-300 font-semibold">{totalInventory} Units</strong>
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300">1. Acquisition</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">NEW</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">{stageBreakdown.acquisition || 0}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">units</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">2. Deployment</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">LIVE</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">{stageBreakdown.deployment || 0}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">units in use</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">3. Maintenance</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">REPAIR</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">{stageBreakdown.maintenance || 0}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">servicing</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">4. Retirement</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">EOL</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">{stageBreakdown.retirement || 0}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">decommissioned</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Actionable Alerts Bar (Shown only if conditions exist) */}
            {(metrics.mismatch_count > 0 || metrics.expiring_warranties_count > 0 || metrics.idle_high_spec_count > 0) && (
                <div className="mb-6 space-y-2.5">
                    {metrics.mismatch_count > 0 && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                                        {metrics.mismatch_count} Active Assignment Mismatches Detected
                                    </span>
                                    <span className="text-slate-500 dark:text-zinc-400 ml-1.5 hidden md:inline">
                                        Assigned devices failing workload benchmarks (under-provisioned or over-allocated).
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={route('mismatches.index')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shrink-0 self-start sm:self-auto group cursor-pointer"
                            >
                                <span>Review Mismatches</span>
                                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {metrics.expiring_warranties_count > 0 && (
                            <Link
                                href={route('devices.index')}
                                className="rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/60 p-3 flex items-center justify-between gap-3 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 hover:shadow-xs transition-all duration-150 group cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                                    <div className="text-xs truncate">
                                        <span className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                                            {metrics.expiring_warranties_count} Warranties Expiring Soon
                                        </span>
                                        <span className="text-slate-400 dark:text-zinc-500 ml-1 text-[11px]">(within 60 days)</span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 shrink-0">
                                    <span>View</span>
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            </Link>
                        )}

                        {metrics.idle_high_spec_count > 0 && (
                            <Link
                                href={route('match.index')}
                                className="rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/60 p-3 flex items-center justify-between gap-3 hover:border-[#026eff] dark:hover:border-sky-500 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 hover:shadow-xs transition-all duration-150 group cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-[#026eff] shrink-0 group-hover:scale-125 transition-transform" />
                                    <div className="text-xs truncate">
                                        <span className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#026eff] dark:group-hover:text-sky-300 transition-colors">
                                            {metrics.idle_high_spec_count} Idle High-Spec Units Available
                                        </span>
                                        <span className="text-slate-400 dark:text-zinc-500 ml-1 text-[11px]">Ready for allocation</span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#026eff] dark:text-sky-400 inline-flex items-center gap-1 shrink-0">
                                    <span>Assign</span>
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Main 2-Column Workstation Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* LEFT MAIN WORKSPACE (8 cols on lg) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Available Fleet for Assignment */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base sm:text-lg">
                                    Available Fleet Pool
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    Idle hardware ready for workload matching and deployment
                                </p>
                            </div>
                            <Link
                                href={route('devices.index', { status: 'available' })}
                                className="text-xs font-semibold text-[#026eff] dark:text-sky-400 hover:underline inline-flex items-center gap-1 group"
                            >
                                <span>View All ({metrics.idle_devices})</span>
                                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        {available_fleet.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                                No available units currently in inventory.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {available_fleet.map((device) => (
                                    <div
                                        key={device.id}
                                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                    <HardwareImage
                                                        src={device.image_clip_url || device.image_url}
                                                        alt={`${device.brand} ${device.model}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                            {device.asset_tag}
                                                        </span>
                                                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                                                            {device.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 mt-1 text-xs truncate">
                                                        {device.brand} {device.model}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                                        {device.cpu}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mt-3">
                                                <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300">
                                                    {device.ram_gb}GB RAM
                                                </span>
                                                <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300">
                                                    {device.storage_gb}GB {device.storage_type}
                                                </span>
                                                <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300 capitalize">
                                                    {device.cpu_tier}
                                                </span>
                                                {device.gpu_tier && device.gpu_tier !== 'none' && (
                                                    <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/50 font-medium text-[#026eff] dark:text-sky-300">
                                                        {device.gpu_tier}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 capitalize">
                                                {device.device_type} &bull; {device.condition}
                                            </span>
                                            <Link
                                                href={route('devices.show', device.id)}
                                                className="text-xs font-semibold text-[#026eff] dark:text-sky-400 hover:underline inline-flex items-center gap-1 group"
                                            >
                                                <span>Details</span>
                                                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Fleet Assignments Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base sm:text-lg">
                                    Recent Fleet Deployments
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    Audit trail of equipment deployments and match suitability scores
                                </p>
                            </div>
                            <Link
                                href={route('employees.index')}
                                className="text-xs font-semibold text-[#026eff] dark:text-sky-400 hover:underline inline-flex items-center gap-1 group"
                            >
                                <span>Employees ({metrics.total_employees})</span>
                                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="py-2.5 px-3">Device</th>
                                        <th className="py-2.5 px-3">Employee</th>
                                        <th className="py-2.5 px-3">Department</th>
                                        <th className="py-2.5 px-3">Match Fit</th>
                                        <th className="py-2.5 px-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {recent_assignments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                                                No recent assignments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recent_assignments.map((asg) => (
                                            <tr key={asg.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                                                <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-zinc-100">
                                                    <Link href={route('devices.show', asg.device.id)} className="text-[#026eff] dark:text-sky-400 hover:underline">
                                                        {asg.device.asset_tag}
                                                    </Link>
                                                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                                                        {asg.device.brand} {asg.device.model}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-zinc-100">
                                                    {asg.employee.name}
                                                </td>
                                                <td className="py-3 px-3 text-xs text-slate-600 dark:text-zinc-400">
                                                    <div>{asg.employee.department}</div>
                                                    <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                                                        {asg.employee.role_profile?.name || 'Custom Profile'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {asg.match_score ? (
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                            asg.match_score >= 0.8 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                                                            asg.match_score >= 0.65 ? 'bg-sky-100 dark:bg-sky-950/60 text-[#026eff] dark:text-sky-400' :
                                                            'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                                        }`}>
                                                            {Math.round(asg.match_score * 100)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-zinc-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                                    {new Date(asg.assigned_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR ACTIONS & DIGEST (4 cols on lg) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* SpecMatch AI Engine Hub Card */}
                    <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-sky-200 text-[10.5px] font-semibold mb-3 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Automated Workload Matching
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-white">
                                SpecMatch Engine
                            </h3>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                Matches hardware performance (CPU tier, RAM, GPU, storage) with employee workload profiles to eliminate bottlenecks and over-provisioning waste.
                            </p>

                            <div className="mt-4 space-y-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <span className="text-slate-300">Hardware Extraction</span>
                                    <span className="font-semibold text-sky-300">TechSpecs API</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <span className="text-slate-300">AI Scoring Model</span>
                                    <span className="font-semibold text-emerald-300">Gemini AI</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <span className="text-slate-300">Active Workload Profiles</span>
                                    <span className="font-semibold text-white">Configured</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route('match.index')}
                            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white font-bold text-center text-xs transition shadow-sm inline-flex items-center justify-center gap-1.5"
                        >
                            <span>Launch Match Engine</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* ITAM Lifecycle & Operations Summary */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                            Fleet Financial Digest
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800">
                                <span className="text-slate-500 dark:text-zinc-400">Total Capital Cost</span>
                                <span className="font-bold text-slate-900 dark:text-zinc-100">
                                    ₱{Number(metrics.total_acquisition_cost || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800">
                                <span className="text-slate-500 dark:text-zinc-400">Total Depreciation</span>
                                <span className="font-bold text-slate-600 dark:text-zinc-300">
                                    ₱{Number(metrics.total_depreciation || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800">
                                <span className="text-slate-500 dark:text-zinc-400">Current Book Value</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    ₱{Number(metrics.current_book_value || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-slate-500 dark:text-zinc-400">Active Servicing Spend</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                    ₱{Number(metrics.total_maintenance_spend || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick System Navigation Shortcuts */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                            Quick Operations
                        </h3>

                        <div className="space-y-1.5">
                            <Link
                                href={route('devices.create')}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition text-xs font-medium text-slate-700 dark:text-zinc-200 group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#026eff]" />
                                    <span>Register New Asset</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                            <Link
                                href={route('role-profiles.index')}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition text-xs font-medium text-slate-700 dark:text-zinc-200 group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>Workload Role Profiles</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                            <Link
                                href={route('mismatches.index')}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition text-xs font-medium text-slate-700 dark:text-zinc-200 group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span>Audit Assignment Mismatches</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                            <Link
                                href={route('maintenance.index')}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition text-xs font-medium text-slate-700 dark:text-zinc-200 group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <span>Maintenance & Repairs Hub</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
