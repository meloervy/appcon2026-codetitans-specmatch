import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExpandableCardContainer from '@/Components/ui/ExpandableCard';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    RiShieldUserLine,
    RiCpuLine,
    RiRamLine,
    RiHardDriveLine,
    RiMacbookLine,
    RiComputerLine,
    RiAddLine,
    RiEditLine,
    RiSparklingLine,
    RiTeamLine,
} from 'react-icons/ri';

export default function RoleProfilesIndex({ profiles }) {
    const [showModal, setShowModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        min_cpu_tier: 'mid',
        min_ram_gb: 16,
        min_storage_gb: 512,
        requires_gpu: false,
        min_gpu_tier: 'none',
        portability_required: false,
        description: '',
    });

    const openCreate = () => {
        setEditingProfile(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (profile) => {
        setEditingProfile(profile);
        setData({
            name: profile.name,
            min_cpu_tier: profile.min_cpu_tier,
            min_ram_gb: profile.min_ram_gb,
            min_storage_gb: profile.min_storage_gb,
            requires_gpu: Boolean(profile.requires_gpu),
            min_gpu_tier: profile.min_gpu_tier || 'none',
            portability_required: Boolean(profile.portability_required),
            description: profile.description || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProfile) {
            put(route('role-profiles.update', editingProfile.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('role-profiles.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    // Render collapsed card
    const renderCard = (profile) => (
        <div className="h-full bg-white dark:bg-zinc-900 rounded-3xl border-[1.5px] border-slate-200 dark:border-zinc-800 p-6 shadow-xs hover:shadow-md hover:border-[#026eff]/50 dark:hover:border-[#026eff]/50 transition-all flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] flex items-center justify-center shrink-0">
                            <RiShieldUserLine className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-[#026eff] transition-colors">
                                {profile.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
                                <RiTeamLine className="w-3.5 h-3.5" />
                                <span>{profile.employees_count || 0} assigned staff</span>
                            </div>
                        </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60">
                        {profile.portability_required ? 'Laptop' : 'Desktop/Any'}
                    </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {profile.description || 'No workload description configured.'}
                </p>

                {/* Specs Matrix Preview */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                        <RiCpuLine className="w-3.5 h-3.5 text-[#026eff] shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">CPU Tier</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize">{profile.min_cpu_tier}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                        <RiRamLine className="w-3.5 h-3.5 text-[#0aceb3] shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">RAM</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{profile.min_ram_gb} GB</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                        <RiHardDriveLine className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Storage</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{profile.min_storage_gb} GB</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                        <RiSparklingLine className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">GPU</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {profile.requires_gpu ? profile.min_gpu_tier : 'Integrated'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                    Click to view workload matrix &rarr;
                </span>
                <span className="text-xs font-bold text-[#026eff] dark:text-[#0b79ff] group-hover:underline">
                    Inspect
                </span>
            </div>
        </div>
    );

    // Render expanded card view (modal)
    const renderExpanded = (profile, close) => (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-3xl bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] flex items-center justify-center shrink-0 shadow-sm">
                    <RiShieldUserLine className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                            {profile.name}
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0aceb3]/15 text-[#0aceb3]">
                            Active Profile
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Currently assigned to {profile.employees_count || 0} active employees in company directory
                    </p>
                </div>
            </div>

            {/* Workload Description */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1.5">
                    Job Function & Workload Description
                </span>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-sm">
                    {profile.description || 'No workload narrative specified for this role.'}
                </p>
            </div>

            {/* Hardware Specification Thresholds Matrix */}
            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-3">
                    Objective Hardware Specification Thresholds
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-1">
                            <RiCpuLine className="w-4 h-4 text-[#026eff]" />
                            <span className="text-[11px] font-bold uppercase">Min CPU Tier</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-zinc-100 capitalize">
                            {profile.min_cpu_tier}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-1">
                            <RiRamLine className="w-4 h-4 text-[#0aceb3]" />
                            <span className="text-[11px] font-bold uppercase">Min Memory</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                            {profile.min_ram_gb} GB RAM
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-1">
                            <RiHardDriveLine className="w-4 h-4 text-blue-500" />
                            <span className="text-[11px] font-bold uppercase">Min Storage</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                            {profile.min_storage_gb} GB
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-1">
                            <RiSparklingLine className="w-4 h-4 text-amber-500" />
                            <span className="text-[11px] font-bold uppercase">GPU Requirement</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                            {profile.requires_gpu ? profile.min_gpu_tier : 'Integrated'}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-2xs sm:col-span-2">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-1">
                            {profile.portability_required ? (
                                <RiMacbookLine className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <RiComputerLine className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-[11px] font-bold uppercase">Mobility Requirement</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                            {profile.portability_required ? 'Laptop Required (Remote/Hybrid)' : 'Desktop or Laptop Permitted'}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Match Engine Criteria Note */}
            <div className="p-4 rounded-2xl bg-[#026eff]/10 dark:bg-[#031a40]/40 border border-[#026eff]/20 text-xs">
                <span className="font-bold text-[#026eff] dark:text-[#38bdf8] block mb-1">
                    ⚡ Match Engine Scoring Directive
                </span>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Devices evaluated for this role receive fit scoring based on RAM capacity (35%), CPU computing tier (30%), Storage architecture (15%), GPU capabilities (10%), and Form Factor (10%). Units exceeding requirements by &gt;50% RAM or 2 CPU tiers are tagged as overprovisioned donors for dynamic Bridge Swapping.
                </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={() => {
                        close();
                        openEdit(profile);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold shadow-xs transition"
                >
                    <RiEditLine className="w-4 h-4" />
                    Edit Profile Configuration
                </button>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                            Role & Workload Profiles
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Objective hardware specifications per job function for scoring and mismatch detection.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#026eff] text-sm font-semibold text-white hover:bg-[#0256cc] shadow-sm transition self-start sm:self-auto"
                    >
                        <RiAddLine className="w-4 h-4" />
                        Create Role Profile
                    </button>
                </div>
            }
        >
            <Head title="Role Profiles - SpecMatch" />

            {/* Expandable Cards Grid */}
            <ExpandableCardContainer
                cards={profiles}
                renderCard={renderCard}
                renderExpanded={renderExpanded}
                gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            />

            {/* Create / Edit Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                {editingProfile ? 'Edit Role Profile' : 'New Role Profile'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                                    Role Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Lead Frontend Engineer"
                                    className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                                        Min CPU Tier
                                    </label>
                                    <select
                                        value={data.min_cpu_tier}
                                        onChange={(e) => setData('min_cpu_tier', e.target.value)}
                                        className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-medium py-2.5 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                    >
                                        <option value="entry">Entry</option>
                                        <option value="mid">Mid</option>
                                        <option value="high">High</option>
                                        <option value="workstation">Workstation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                                        Min RAM (GB)
                                    </label>
                                    <input
                                        type="number"
                                        min="4"
                                        value={data.min_ram_gb}
                                        onChange={(e) => setData('min_ram_gb', parseInt(e.target.value) || 0)}
                                        className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                                        Min Storage (GB)
                                    </label>
                                    <input
                                        type="number"
                                        min="64"
                                        value={data.min_storage_gb}
                                        onChange={(e) => setData('min_storage_gb', parseInt(e.target.value) || 0)}
                                        className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                                        Min GPU Tier
                                    </label>
                                    <select
                                        value={data.min_gpu_tier}
                                        onChange={(e) => setData('min_gpu_tier', e.target.value)}
                                        className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-medium py-2.5 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                        disabled={!data.requires_gpu}
                                    >
                                        <option value="none">None</option>
                                        <option value="integrated">Integrated</option>
                                        <option value="dedicated-entry">Dedicated Entry</option>
                                        <option value="dedicated-high">Dedicated High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.requires_gpu}
                                        onChange={(e) => setData('requires_gpu', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-zinc-600 text-[#026eff] focus:ring-[#026eff] bg-white dark:bg-zinc-700"
                                    />
                                    Requires Dedicated/Capable GPU
                                </label>
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.portability_required}
                                        onChange={(e) => setData('portability_required', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-zinc-600 text-[#026eff] focus:ring-[#026eff] bg-white dark:bg-zinc-700"
                                    />
                                    Portability Required (Laptop Essential)
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                                    Workload Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Applications used, performance expectations..."
                                    className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-sm py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-750 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-[#026eff] text-white text-xs font-bold hover:bg-[#0256cc] transition shadow-xs"
                                >
                                    {editingProfile ? 'Save Changes' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
