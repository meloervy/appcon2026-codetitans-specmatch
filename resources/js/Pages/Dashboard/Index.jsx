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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">IT Asset Operations & Intelligence</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            Hardware inventory tracking, straight-line depreciation, lifecycle phases, and smart workload matching.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('devices.create')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-xs transition"
                        >
                            + Register Asset
                        </Link>
                        <Link
                            href={route('match.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#026eff] text-sm font-semibold text-white hover:bg-[#0256cc] shadow-sm transition"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Run Match Pipeline
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="ITAM Operations Dashboard - SpecMatch" />

            {/* Lifecycle Stages Ribbon */}
            <div className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Fleet Lifecycle Phase Distribution</span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">Total Authoritative Inventory: {metrics.total_devices + (metrics.retired_devices || 0)} Units</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 block">1. Acquisition</span>
                            <span className="text-xl font-black text-sky-950 dark:text-sky-200 mt-0.5 block">{stageBreakdown.acquisition || 0}</span>
                            <span className="text-[11px] text-sky-600 dark:text-sky-400/80">Procurement & Staging</span>
                        </div>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[10px] font-bold shadow-xs"><span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>NEW</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">2. Deployment</span>
                            <span className="text-xl font-black text-emerald-950 dark:text-emerald-200 mt-0.5 block">{stageBreakdown.deployment || 0}</span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80">In Active Circulation</span>
                        </div>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[10px] font-bold shadow-xs"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>LIVE</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">3. Maintenance</span>
                            <span className="text-xl font-black text-amber-950 dark:text-amber-200 mt-0.5 block">{stageBreakdown.maintenance || 0}</span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400/80">Repair & Servicing</span>
                        </div>
                        <Link href={route('maintenance.index')} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[10px] font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-700 transition">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>LOGS
                        </Link>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">4. Retirement</span>
                            <span className="text-xl font-black text-slate-800 dark:text-zinc-200 mt-0.5 block">{stageBreakdown.retirement || 0}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Decommissioned / EOL</span>
                        </div>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[10px] font-bold shadow-xs"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>EOL</span>
                    </div>
                </div>
            </div>

            {/* Financial Tracking & Capital Valuation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Initial Capital Invested */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Fleet Acquisition Spend</span>
                        <span className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                            ₱{Number(metrics.total_acquisition_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                        Total capital invested in active computer fleet.
                    </p>
                </div>

                {/* Depreciated Residual Book Value */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Residual Book Value</span>
                        <span className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                            ₱{Number(metrics.current_book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                        Depreciated straight-line asset balance across operational lifespan.
                    </p>
                </div>

                {/* Maintenance Spend & Servicing */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Maintenance & Servicing</span>
                        <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                            ₱{Number(metrics.total_maintenance_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                        <span className="font-semibold text-amber-700 dark:text-amber-400">{metrics.active_maintenance_count} in servicing</span>
                        <Link href={route('maintenance.index')} className="text-[#026eff] dark:text-[#0b79ff] font-semibold hover:underline">
                            Open Hub &rarr;
                        </Link>
                    </div>
                </div>

                {/* Procurement Avoidance Savings */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Procurement Avoidance</span>
                        <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            ₱{metrics.procurement_savings.toLocaleString()}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Saved</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                        Capital saved by matching idle fleet vs purchasing new units.
                    </p>
                </div>
            </div>

            {/* Critical ITAM Alerts Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Warranty Alert */}
                {metrics.expiring_warranties_count > 0 && (
                    <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/60 p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                                    {metrics.expiring_warranties_count} Warranties Expiring Soon (&le; 60 Days)
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                    Service contracts approaching expiration. Review extended coverage options.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('devices.index')}
                            className="px-3 py-1.5 rounded-lg border border-amber-600 dark:border-amber-500 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 shrink-0 transition"
                        >
                            View Assets
                        </Link>
                    </div>
                )}

                {/* Redundancy / Efficiency Optimization Alert */}
                {metrics.idle_high_spec_count > 0 && (
                    <div className="rounded-2xl bg-[#026eff]/10 dark:bg-[#031a40]/20 border border-[#026eff]/20 dark:border-[#031a40]/60 p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#026eff] text-white shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                                    {metrics.idle_high_spec_count} Redundant High-Spec Assets Available
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                                    High-performance machines currently idle. Optimize fleet efficiency before procuring.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('match.index')}
                            className="px-3 py-1.5 rounded-lg border border-[#026eff] text-[#026eff] dark:text-[#0b79ff] text-xs font-bold hover:bg-[#026eff]/10 shrink-0 transition"
                        >
                            Assign Assets
                        </Link>
                    </div>
                )}
            </div>

            {/* Mismatch Alert Banner */}
            {metrics.mismatch_count > 0 && (
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-amber-950/20 border border-amber-300 dark:border-amber-900/60 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                                {metrics.mismatch_count} Active Assignment Mismatches Detected
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
                                Devices currently assigned fail workload benchmarks (under-provisioned or over-allocated waste).
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('mismatches.index')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-600 dark:border-amber-500 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition shrink-0 self-start md:self-auto group"
                    >
                        <span>Review Mismatches</span>
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            )}

            {/* Quick Actions & Available Fleet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Available Devices Snapshot */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-lg">Available Fleet for Assignment</h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Currently idle units ready to be circulation-matched</p>
                        </div>
                        <Link href={route('devices.index', { status: 'available' })} className="text-xs font-semibold text-[#026eff] dark:text-[#0b79ff] hover:underline">
                            View All Available ({metrics.idle_devices}) &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {available_fleet.map((device) => (
                            <div key={device.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800/70 transition flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 shrink-0 overflow-hidden shadow-xs">
                                            <HardwareImage
                                                src={device.image_clip_url || device.image_url}
                                                alt={`${device.brand} ${device.model}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                    {device.asset_tag}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                    {device.status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-zinc-100 mt-1.5 text-sm truncate">{device.brand} {device.model}</h4>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{device.cpu}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300">
                                            {device.ram_gb}GB RAM
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300">
                                            {device.storage_gb}GB {device.storage_type}
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300 capitalize">
                                            {device.cpu_tier} CPU
                                        </span>
                                        {device.gpu_tier !== 'none' && (
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#026eff]/10 dark:bg-[#031a40]/60 border border-[#026eff]/15 dark:border-[#031a40]/50 font-medium text-[#026eff] dark:text-[#0b79ff]">
                                                {device.gpu_tier}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 dark:text-zinc-500 capitalize">{device.device_type} &bull; {device.condition}</span>
                                    <Link href={route('devices.show', device.id)} className="font-semibold text-[#026eff] dark:text-[#0b79ff] hover:text-[#026eff] dark:hover:text-[#0b79ff]">
                                        Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Shortcuts */}
                <div className="bg-gradient-to-br from-[#031a40] via-[#021230] to-[#031a40] dark:from-zinc-950 dark:via-zinc-900 dark:to-[#031a40] text-white rounded-2xl p-6 shadow-md border border-[#031a40]/40 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                        <div className="inline-flex p-2.5 rounded-xl bg-white/10 mb-4 backdrop-blur-xs">
                            <svg className="w-6 h-6 text-[#0b79ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">TechSpecs & AI Match</h3>
                        <p className="text-sm text-[#0b79ff]/60 mt-2 leading-relaxed">
                            Continuous IT asset management with 1-click TechSpecs hardware lookup, straight-line depreciation, lifecycle transitions, and intelligent assignment.
                        </p>

                        <div className="mt-6 space-y-2.5">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#0b79ff] flex items-center justify-between">
                                <span>Hardware Identification</span>
                                <span className="font-semibold text-emerald-400">TechSpecs API</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#0b79ff] flex items-center justify-between">
                                <span>AI Extraction Engine</span>
                                <span className="font-semibold text-[#0b79ff]">Gemini AI</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#0b79ff] flex items-center justify-between">
                                <span>Lifecycle Stages</span>
                                <span className="font-semibold text-amber-300">4 Tracked Phases</span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route('match.index')}
                        className="mt-6 w-full py-3 rounded-xl bg-white text-[#031a40] font-bold text-center text-sm hover:bg-[#026eff]/10 transition shadow-sm"
                    >
                        Launch Match Engine &rarr;
                    </Link>
                </div>
            </div>

            {/* Recent Assignments Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-lg">Recent Fleet Assignments</h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Audit trail of equipment deployments and match scores</p>
                    </div>
                    <Link href={route('employees.index')} className="text-xs font-semibold text-[#026eff] dark:text-[#0b79ff] hover:underline">
                        View All Employees &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            <tr>
                                <th className="py-3 px-4">Device</th>
                                <th className="py-3 px-4">Employee</th>
                                <th className="py-3 px-4">Department / Profile</th>
                                <th className="py-3 px-4">Match Fit</th>
                                <th className="py-3 px-4">Source</th>
                                <th className="py-3 px-4">Assigned Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {recent_assignments.map((asg) => (
                                <tr key={asg.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                                        <Link href={route('devices.show', asg.device.id)} className="text-[#026eff] dark:text-[#0b79ff] hover:underline">
                                            {asg.device.asset_tag}
                                        </Link>
                                        <div className="text-xs text-slate-400 dark:text-zinc-500 font-normal">{asg.device.brand} {asg.device.model}</div>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-100">
                                        {asg.employee.name}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-zinc-400">
                                        <div>{asg.employee.department}</div>
                                        <div className="text-slate-400 dark:text-zinc-500">{asg.employee.role_profile?.name || 'Custom Role'}</div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {asg.match_score ? (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                asg.match_score >= 0.8 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                                                asg.match_score >= 0.65 ? 'bg-[#026eff]/15 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff]' :
                                                'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                            }`}>
                                                {Math.round(asg.match_score * 100)}%
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400 dark:text-zinc-500">N/A</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                            {asg.assignment_source.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-zinc-400">
                                        {new Date(asg.assigned_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
