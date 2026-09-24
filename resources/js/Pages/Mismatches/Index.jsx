import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    RiAlertLine,
    RiArrowRightLine,
    RiCheckboxCircleLine,
    RiCloseLine,
    RiCpuLine,
    RiFlashlightLine,
    RiSearchLine,
    RiShieldUserLine,
} from 'react-icons/ri';

export default function MismatchesIndex({ mismatches, threshold }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdminOrManager = ['admin', 'manager'].includes(user?.role);

    const [filterType, setFilterType] = useState('all');
    const [search, setSearch] = useState('');

    const underProvisioned = useMemo(() => mismatches.filter((m) => m.classification === 'under-provisioned'), [mismatches]);
    const overProvisioned = useMemo(() => mismatches.filter((m) => m.classification === 'over-provisioned'), [mismatches]);

    const filteredMismatches = useMemo(() => {
        return mismatches.filter((item) => {
            if (filterType === 'under-provisioned' && item.classification !== 'under-provisioned') return false;
            if (filterType === 'over-provisioned' && item.classification !== 'over-provisioned') return false;

            if (search.trim()) {
                const q = search.toLowerCase();
                const matchName = item.employee?.name?.toLowerCase().includes(q);
                const matchDept = item.employee?.department?.toLowerCase().includes(q);
                const matchRole = item.role_profile?.name?.toLowerCase().includes(q);
                const matchTag = item.device?.asset_tag?.toLowerCase().includes(q);
                const matchBrand = item.device?.brand?.toLowerCase().includes(q);
                const matchModel = item.device?.model?.toLowerCase().includes(q);
                return matchName || matchDept || matchRole || matchTag || matchBrand || matchModel;
            }

            return true;
        });
    }, [mismatches, filterType, search]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">Assignment Mismatch Radar</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            Continuous fleet audit detecting under-provisioned performance bottlenecks and over-provisioned fleet waste.
                        </p>
                    </div>
                    {isAdminOrManager && (
                        <Link
                            href={route('match.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#026eff] text-sm font-semibold text-white hover:bg-[#0256cc] shadow-sm transition self-start sm:self-auto"
                        >
                            <RiFlashlightLine className="w-4 h-4" />
                            <span>Launch Match Engine</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Mismatches Radar - SpecMatch" />

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`text-left rounded-2xl border p-5 shadow-2xs transition cursor-pointer ${
                        filterType === 'all'
                            ? 'bg-white dark:bg-zinc-900 border-[#026eff] ring-2 ring-[#026eff]/20'
                            : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                    }`}
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Flagged Assignments</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-zinc-100">{mismatches.length}</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">below {threshold} threshold</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType('under-provisioned')}
                    className={`text-left rounded-2xl border p-5 shadow-2xs transition cursor-pointer ${
                        filterType === 'under-provisioned'
                            ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20'
                            : 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60 hover:border-rose-300'
                    }`}
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Under-Provisioned (Productivity Risk)</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{underProvisioned.length}</span>
                        <span className="text-xs text-rose-600 dark:text-rose-400/80 font-medium">insufficient hardware</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType('over-provisioned')}
                    className={`text-left rounded-2xl border p-5 shadow-2xs transition cursor-pointer ${
                        filterType === 'over-provisioned'
                            ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-amber-50/20 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-300'
                    }`}
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Over-Provisioned (Fleet Waste)</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{overProvisioned.length}</span>
                        <span className="text-xs text-amber-600 dark:text-amber-400/80 font-medium">donor unit for re-allocation</span>
                    </div>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-3 sm:p-3.5 shadow-2xs mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search employee name, department, role title, asset tag, brand, or model..."
                        className="w-full text-sm font-medium pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition cursor-pointer"
                            title="Clear search"
                        >
                            <RiCloseLine className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Unified Segmented Filter Group */}
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 shrink-0 self-start sm:self-auto overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                            filterType === 'all'
                                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        All ({mismatches.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('under-provisioned')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                            filterType === 'under-provisioned'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        }`}
                    >
                        Under-Provisioned ({underProvisioned.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('over-provisioned')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                            filterType === 'over-provisioned'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                        }`}
                    >
                        Over-Provisioned ({overProvisioned.length})
                    </button>
                </div>
            </div>

            {/* Mismatches Detailed List */}
            <div className="space-y-4">
                {filteredMismatches.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-12 text-center text-slate-400 dark:text-zinc-500 shadow-2xs">
                        <RiCheckboxCircleLine className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                            {mismatches.length === 0 ? 'Fleet Perfectly Aligned' : 'No Mismatches Match Your Search'}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                            {mismatches.length === 0
                                ? `All currently assigned devices score above the ${threshold} match threshold against their user's role profile.`
                                : 'Try adjusting your search query or filter selection.'}
                        </p>
                    </div>
                ) : (
                    filteredMismatches.map((item) => {
                        const { assignment, device, employee, role_profile, score, classification, rationale } = item;
                        const isUnder = classification === 'under-provisioned';

                        return (
                            <div
                                key={assignment.id}
                                className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 border-l-4 p-6 shadow-2xs transition hover:shadow-md ${
                                    isUnder
                                        ? 'border-l-rose-500'
                                        : 'border-l-amber-500'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3.5 rounded-2xl text-white font-black text-lg shrink-0 flex items-center justify-center min-w-[64px] ${
                                            isUnder ? 'bg-rose-600 shadow-sm' : 'bg-amber-500 shadow-sm'
                                        }`}>
                                            {Math.round(score * 100)}%
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">{employee.name}</h3>
                                                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">({employee.department})</span>
                                                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                                    isUnder
                                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                                                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                                                }`}>
                                                    {classification}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                                Role Benchmark: <strong className="font-semibold text-slate-800 dark:text-zinc-200">{role_profile.name}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end lg:self-center">
                                        <Link
                                            href={route('match.index', { employee_id: employee.id })}
                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#026eff] text-white text-xs font-bold hover:bg-[#0256cc] shadow-2xs transition cursor-pointer"
                                        >
                                            <span>Find Replacement Device</span>
                                            <RiArrowRightLine className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Comparison Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                                    {/* What Role Demands */}
                                    <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
                                        <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-xs mb-3 flex items-center gap-1.5">
                                            <RiShieldUserLine className="w-4 h-4 text-[#026eff]" />
                                            <span>Role Profile Minimum Requirements</span>
                                        </div>
                                        <div className="space-y-2 text-slate-700 dark:text-zinc-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Min CPU:</span>
                                                <span className="font-bold capitalize text-slate-900 dark:text-zinc-100">{role_profile.min_cpu_tier} Tier</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Min RAM:</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{role_profile.min_ram_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Min Storage:</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{role_profile.min_storage_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">GPU Requirement:</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{role_profile.requires_gpu ? `Required (${role_profile.min_gpu_tier})` : 'None'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Mobility:</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{role_profile.portability_required ? 'Laptop Required' : 'Desktop Permitted'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* What Is Currently Assigned */}
                                    <div className={`p-4 rounded-xl border ${
                                        isUnder
                                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                                            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                                    }`}>
                                        <div className="flex items-center gap-3.5 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs p-0.5">
                                                <HardwareImage
                                                    src={device.image_clip_url || device.image_url}
                                                    alt={device.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-[10px]">
                                                        Currently Assigned Device
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                        {device.asset_tag}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                                                    {device.brand} {device.model}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-slate-700 dark:text-zinc-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Assigned CPU:</span>
                                                <span className="font-bold capitalize text-slate-900 dark:text-zinc-100">{device.cpu_tier} ({device.cpu})</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Assigned RAM:</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{device.ram_gb} GB</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Assigned Storage:</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{device.storage_gb} GB {device.storage_type}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Graphics:</span>
                                                <span className="font-bold capitalize text-slate-900 dark:text-zinc-100">{device.gpu_tier}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Device Type:</span>
                                                <span className="font-bold capitalize text-slate-900 dark:text-zinc-100">{device.device_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deterministic Rationale */}
                                <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
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
