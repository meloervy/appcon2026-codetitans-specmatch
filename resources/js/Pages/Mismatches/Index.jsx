import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function MismatchesIndex({ mismatches, threshold }) {
    const underProvisioned = mismatches.filter((m) => m.classification === 'under-provisioned');
    const overProvisioned = mismatches.filter((m) => m.classification === 'over-provisioned');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">Assignment Mismatch Radar</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Continuous fleet audit detecting under-provisioned performance bottlenecks and over-provisioned fleet waste.
                        </p>
                    </div>
                    <Link
                        href={route('match.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition self-start sm:self-auto"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Launch Match Engine
                    </Link>
                </div>
            }
        >
            <Head title="Mismatches - SpecMatch" />

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Total Flagged Assignments</span>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100">{mismatches.length}</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">below {threshold} threshold</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 p-5 shadow-xs bg-rose-50/20 dark:bg-rose-950/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Under-Provisioned (Productivity Risk)</span>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{underProvisioned.length}</span>
                        <span className="text-xs text-rose-600 dark:text-rose-400/80 font-medium">insufficient hardware</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 p-5 shadow-xs bg-amber-50/20 dark:bg-amber-950/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Over-Provisioned (Fleet Waste)</span>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{overProvisioned.length}</span>
                        <span className="text-xs text-amber-600 dark:text-amber-400/80 font-medium">high-spec unit tied to light role</span>
                    </div>
                </div>
            </div>

            {/* Mismatches Detailed Table */}
            <div className="space-y-4">
                {mismatches.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-12 text-center text-slate-400 dark:text-zinc-500">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                            ✓
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Fleet Perfectly Aligned</h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                            All currently assigned devices score above the {threshold} match threshold against their user's role profile.
                        </p>
                    </div>
                ) : (
                    mismatches.map((item) => {
                        const { assignment, device, employee, role_profile, score, classification, rationale, subscores } = item;
                        const isUnder = classification === 'under-provisioned';

                        return (
                            <div
                                key={assignment.id}
                                className={`bg-white dark:bg-zinc-900 rounded-2xl border p-6 shadow-xs transition ${
                                    isUnder
                                        ? 'border-rose-200/80 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-800'
                                        : 'border-amber-200/80 dark:border-amber-900/60 hover:border-amber-300 dark:hover:border-amber-800'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl text-white font-black shrink-0 ${
                                            isUnder ? 'bg-rose-600' : 'bg-amber-500'
                                        }`}>
                                            {Math.round(score * 100)}%
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">{employee.name}</h3>
                                                <span className="text-xs text-slate-500 dark:text-zinc-400">({employee.department})</span>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    isUnder
                                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                                }`}>
                                                    {classification}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                                Role Benchmark: <span className="font-semibold text-slate-700 dark:text-zinc-200">{role_profile.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end lg:self-center">
                                        <Link
                                            href={route('match.index', { employee_id: employee.id })}
                                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm transition"
                                        >
                                            Find Replacement Device &rarr;
                                        </Link>
                                    </div>
                                </div>

                                {/* Comparison Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                                    {/* What Role Demands */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800">
                                        <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-[10px] mb-2">
                                            Role Profile Requirements
                                        </div>
                                        <div className="space-y-1.5 text-slate-700 dark:text-zinc-300">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Min CPU:</span>
                                                <span className="font-semibold capitalize">{role_profile.min_cpu_tier}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Min RAM:</span>
                                                <span className="font-semibold">{role_profile.min_ram_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Min Storage:</span>
                                                <span className="font-semibold">{role_profile.min_storage_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">GPU Requirement:</span>
                                                <span className="font-semibold">{role_profile.requires_gpu ? `Required (${role_profile.min_gpu_tier})` : 'None'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Mobility:</span>
                                                <span className="font-semibold">{role_profile.portability_required ? 'Laptop Required' : 'Desktop OK'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* What Is Currently Assigned */}
                                    <div className={`p-4 rounded-xl border ${
                                        isUnder
                                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                                            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                                    }`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                <img
                                                    src={device.image_clip_url || device.image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Modern_Laptop_Computer.jpg/800px-Modern_Laptop_Computer.jpg'}
                                                    alt=""
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Modern_Laptop_Computer.jpg/800px-Modern_Laptop_Computer.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-[10px]">
                                                        Currently Assigned Device
                                                    </span>
                                                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                        {device.asset_tag}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                                    {device.brand} {device.model}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-slate-700 dark:text-zinc-300">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Assigned CPU:</span>
                                                <span className="font-semibold capitalize">{device.cpu_tier} ({device.cpu})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Assigned RAM:</span>
                                                <span className="font-semibold">{device.ram_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Assigned Storage:</span>
                                                <span className="font-semibold">{device.storage_gb} GB {device.storage_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Graphics:</span>
                                                <span className="font-semibold capitalize">{device.gpu_tier}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-zinc-500">Device Type:</span>
                                                <span className="font-semibold capitalize">{device.device_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deterministic Rationale */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                    <span className="font-bold text-slate-900 dark:text-zinc-100">Diagnosis Rationale:</span> {rationale}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </AuthenticatedLayout>
    );
}
