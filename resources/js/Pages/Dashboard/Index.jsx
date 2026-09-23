import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ metrics, mismatches, recent_assignments, available_fleet }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fleet Operations Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Real-time device circulation, utilization rate, and allocation health.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('devices.create')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                        >
                            + Register Device
                        </Link>
                        <Link
                            href={route('match.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
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
            <Head title="Dashboard - SpecMatch" />

            {/* Mismatch Alert Banner */}
            {metrics.mismatch_count > 0 && (
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">
                                {metrics.mismatch_count} Active Assignment Mismatches Detected
                            </h3>
                            <p className="text-sm text-slate-600 mt-0.5">
                                Devices currently assigned fail workload benchmarks (under-provisioned or over-allocated waste).
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('mismatches.index')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shrink-0 self-start md:self-auto"
                    >
                        Review Mismatches &rarr;
                    </Link>
                </div>
            )}

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Total Devices */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Active Fleet</span>
                        <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{metrics.total_devices}</span>
                        <span className="text-xs text-slate-500 font-medium">units</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                        <span className="text-emerald-600 font-semibold">{metrics.idle_devices} idle</span>
                        <span>•</span>
                        <span>{metrics.in_repair_devices} in repair</span>
                    </div>
                </div>

                {/* Utilization Rate */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Utilization Rate</span>
                        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-indigo-600">{metrics.utilization_rate}%</span>
                        <span className="text-xs text-slate-500 font-medium">{metrics.assigned_devices} / {metrics.total_devices} assigned</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, metrics.utilization_rate)}%` }}
                        />
                    </div>
                </div>

                {/* Mismatches */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Flagged Mismatches</span>
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">{metrics.mismatch_count}</span>
                        <span className="text-xs text-slate-500 font-medium">requiring review</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                        <Link href={route('mismatches.index')} className="text-indigo-600 font-semibold hover:underline">
                            Audit mismatch details &rarr;
                        </Link>
                    </div>
                </div>

                {/* Procurement Savings */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Procurement Avoidance</span>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-emerald-600">
                            ${metrics.procurement_savings.toLocaleString()}
                        </span>
                        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Saved</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                        Savings from optimal inventory reuse vs new purchases.
                    </p>
                </div>
            </div>

            {/* Quick Actions & Available Fleet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Available Devices Snapshot */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Available Fleet for Assignment</h2>
                            <p className="text-xs text-slate-500">Currently idle units ready to be circulation-matched</p>
                        </div>
                        <Link href={route('devices.index', { status: 'available' })} className="text-xs font-semibold text-indigo-600 hover:underline">
                            View All Available ({metrics.idle_devices}) &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {available_fleet.map((device) => (
                            <div key={device.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {device.asset_tag}
                                        </span>
                                        <span className="text-[11px] uppercase font-bold tracking-wide text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                                            {device.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mt-2 text-sm">{device.brand} {device.model}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{device.cpu}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700">
                                            {device.ram_gb}GB RAM
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700">
                                            {device.storage_gb}GB {device.storage_type}
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700 capitalize">
                                            {device.cpu_tier} CPU
                                        </span>
                                        {device.gpu_tier !== 'none' && (
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 font-medium text-indigo-700">
                                                {device.gpu_tier}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 capitalize">{device.device_type} • {device.condition}</span>
                                    <Link href={route('devices.show', device.id)} className="font-semibold text-indigo-600 hover:text-indigo-800">
                                        Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Shortcuts */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="inline-flex p-2.5 rounded-xl bg-white/10 mb-4 backdrop-blur-xs">
                            <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">Smart Match Engine</h3>
                        <p className="text-sm text-indigo-200/80 mt-2 leading-relaxed">
                            Describe any employee requirement in free text. Gemini converts it to hardware parameters and deterministically ranks inventory.
                        </p>

                        <div className="mt-6 space-y-2.5">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-indigo-100 flex items-center justify-between">
                                <span>Layer 1: AI Requirement Parser</span>
                                <span className="font-semibold text-emerald-400">Gemini 2.5</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-indigo-100 flex items-center justify-between">
                                <span>Layer 2: Objective Scoring</span>
                                <span className="font-semibold text-indigo-300">Deterministic</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-indigo-100 flex items-center justify-between">
                                <span>Threshold Constraint</span>
                                <span className="font-semibold text-amber-300">&ge; 0.65 Score</span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route('match.index')}
                        className="mt-6 w-full py-3 rounded-xl bg-white text-indigo-950 font-bold text-center text-sm hover:bg-indigo-50 transition shadow-sm"
                    >
                        Launch Match Engine &rarr;
                    </Link>
                </div>
            </div>

            {/* Recent Assignments Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Recent Fleet Assignments</h2>
                        <p className="text-xs text-slate-500">Historical trail of hardware issuance</p>
                    </div>
                    <Link href={route('employees.index')} className="text-xs font-semibold text-indigo-600 hover:underline">
                        Employee Directory &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">Employee</th>
                                <th className="pb-3">Department</th>
                                <th className="pb-3">Role Profile</th>
                                <th className="pb-3">Device Assigned</th>
                                <th className="pb-3">Match Score</th>
                                <th className="pb-3">Source</th>
                                <th className="pb-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recent_assignments.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/60">
                                    <td className="py-3.5 font-semibold text-slate-900">{item.employee?.name}</td>
                                    <td className="py-3.5 text-slate-500">{item.employee?.department}</td>
                                    <td className="py-3.5">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                            {item.employee?.role_profile?.name || 'Unspecified'}
                                        </span>
                                    </td>
                                    <td className="py-3.5">
                                        <div className="font-medium text-slate-900">{item.device?.brand} {item.device?.model}</div>
                                        <div className="text-xs font-mono text-slate-400">{item.device?.asset_tag}</div>
                                    </td>
                                    <td className="py-3.5">
                                        {item.match_score ? (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                item.match_score >= 0.65 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                            }`}>
                                                {Math.round(item.match_score * 100)}%
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-3.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            {item.assignment_source.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3.5 text-xs text-slate-400">
                                        {new Date(item.assigned_at).toLocaleDateString()}
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
