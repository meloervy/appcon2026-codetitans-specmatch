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
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assignment Mismatch Radar</h1>
                        <p className="text-sm text-slate-500 mt-1">
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
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Flagged Assignments</span>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{mismatches.length}</span>
                        <span className="text-xs text-slate-500 font-medium">below {threshold} threshold</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs bg-rose-50/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Under-Provisioned (Productivity Risk)</span>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-rose-600">{underProvisioned.length}</span>
                        <span className="text-xs text-rose-600 font-medium">insufficient hardware</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs bg-amber-50/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Over-Provisioned (Fleet Waste)</span>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">{overProvisioned.length}</span>
                        <span className="text-xs text-amber-600 font-medium">high-spec unit tied to light role</span>
                    </div>
                </div>
            </div>

            {/* Mismatches Detailed Table */}
            <div className="space-y-4">
                {mismatches.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                            ✓
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Fleet Perfectly Aligned</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
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
                                className={`bg-white rounded-2xl border p-6 shadow-xs transition ${
                                    isUnder ? 'border-rose-200/80 hover:border-rose-300' : 'border-amber-200/80 hover:border-amber-300'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl text-white font-black shrink-0 ${
                                            isUnder ? 'bg-rose-600' : 'bg-amber-500'
                                        }`}>
                                            {Math.round(score * 100)}%
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="font-bold text-slate-900 text-base">{employee.name}</h3>
                                                <span className="text-xs text-slate-500">({employee.department})</span>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    isUnder ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {classification}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Role Benchmark: <span className="font-semibold text-slate-700">{role_profile.name}</span>
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
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                                        <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2">
                                            Role Profile Requirements
                                        </div>
                                        <div className="space-y-1.5 text-slate-700">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Min CPU:</span>
                                                <span className="font-semibold capitalize">{role_profile.min_cpu_tier}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Min RAM:</span>
                                                <span className="font-semibold">{role_profile.min_ram_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Min Storage:</span>
                                                <span className="font-semibold">{role_profile.min_storage_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">GPU Requirement:</span>
                                                <span className="font-semibold">{role_profile.requires_gpu ? `Required (${role_profile.min_gpu_tier})` : 'None'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Mobility:</span>
                                                <span className="font-semibold">{role_profile.portability_required ? 'Laptop Required' : 'Desktop OK'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* What Is Currently Assigned */}
                                    <div className={`p-4 rounded-xl border ${
                                        isUnder ? 'bg-rose-50/40 border-rose-200' : 'bg-amber-50/40 border-amber-200'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                                                Currently Assigned Device
                                            </span>
                                            <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                {device.asset_tag}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-slate-700">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Hardware Model:</span>
                                                <span className="font-semibold">{device.brand} {device.model}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Assigned CPU:</span>
                                                <span className="font-semibold capitalize">{device.cpu_tier} ({device.cpu})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Assigned RAM:</span>
                                                <span className="font-semibold">{device.ram_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Assigned Storage:</span>
                                                <span className="font-semibold">{device.storage_gb} GB {device.storage_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Graphics:</span>
                                                <span className="font-semibold capitalize">{device.gpu_tier}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Device Type:</span>
                                                <span className="font-semibold capitalize">{device.device_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deterministic Rationale */}
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                                    <span className="font-bold text-slate-900">Diagnosis Rationale:</span> {rationale}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </AuthenticatedLayout>
    );
}
