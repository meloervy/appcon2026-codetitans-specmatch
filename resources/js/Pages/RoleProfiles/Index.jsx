import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">Role & Workload Profiles</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            Objective hardware specifications per job function for scoring and mismatch detection.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#026eff] text-sm font-semibold text-white hover:bg-[#0256cc] shadow-sm transition self-start sm:self-auto"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Role Profile
                    </button>
                </div>
            }
        >
            <Head title="Role Profiles - SpecMatch" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                    <div key={profile.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 transition">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">{profile.name}</h3>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full shrink-0">
                                    {profile.employees_count} staff
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                                {profile.description || 'No description provided.'}
                            </p>

                            <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 dark:text-zinc-500 font-medium">Min CPU Tier:</span>
                                    <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-zinc-700">
                                        {profile.min_cpu_tier}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 dark:text-zinc-500 font-medium">Min Memory:</span>
                                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                        {profile.min_ram_gb} GB RAM
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 dark:text-zinc-500 font-medium">Min Storage:</span>
                                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                        {profile.min_storage_gb} GB
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 dark:text-zinc-500 font-medium">GPU Requirement:</span>
                                    <span className={`font-semibold ${profile.requires_gpu ? 'text-[#026eff] dark:text-[#0b79ff]' : 'text-slate-600 dark:text-zinc-400'}`}>
                                        {profile.requires_gpu ? `Required (${profile.min_gpu_tier})` : 'None required'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 dark:text-zinc-500 font-medium">Mobility / Portability:</span>
                                    <span className={`font-semibold ${profile.portability_required ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400'}`}>
                                        {profile.portability_required ? 'Laptop Required' : 'Desktop OK'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end">
                            <button
                                onClick={() => openEdit(profile)}
                                className="text-xs font-bold text-[#026eff] dark:text-[#0b79ff] hover:text-[#026eff] dark:hover:text-[#0b79ff]"
                            >
                                Edit Profile &rarr;
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                {editingProfile ? 'Edit Role Profile' : 'New Role Profile'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Role Title *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Lead Frontend Engineer"
                                    className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Min CPU Tier</label>
                                    <select
                                        value={data.min_cpu_tier}
                                        onChange={(e) => setData('min_cpu_tier', e.target.value)}
                                        className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
                                    >
                                        <option value="entry">Entry</option>
                                        <option value="mid">Mid</option>
                                        <option value="high">High</option>
                                        <option value="workstation">Workstation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Min RAM (GB)</label>
                                    <input
                                        type="number"
                                        min="4"
                                        value={data.min_ram_gb}
                                        onChange={(e) => setData('min_ram_gb', parseInt(e.target.value) || 0)}
                                        className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Min Storage (GB)</label>
                                    <input
                                        type="number"
                                        min="64"
                                        value={data.min_storage_gb}
                                        onChange={(e) => setData('min_storage_gb', parseInt(e.target.value) || 0)}
                                        className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Min GPU Tier</label>
                                    <select
                                        value={data.min_gpu_tier}
                                        onChange={(e) => setData('min_gpu_tier', e.target.value)}
                                        className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
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
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Workload Description</label>
                                <textarea
                                    rows={2}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Applications used, performance expectations..."
                                    className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#026eff] focus:ring-[#026eff]"
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
                                    className="px-5 py-2 rounded-xl bg-[#026eff] text-white text-xs font-semibold hover:bg-[#0256cc] transition"
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
