import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function DevicesIndex({ devices, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [lifecycleStage, setLifecycleStage] = useState(filters.lifecycle_stage || '');
    const [deviceType, setDeviceType] = useState(filters.device_type || '');
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier || '');
    const [condition, setCondition] = useState(filters.condition || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('devices.index'), {
            search,
            status,
            lifecycle_stage: lifecycleStage,
            device_type: deviceType,
            cpu_tier: cpuTier,
            condition,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setLifecycleStage('');
        setDeviceType('');
        setCpuTier('');
        setCondition('');
        router.get(route('devices.index'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Hardware Inventory</h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Authoritative catalog with TechSpecs device clips, lifecycle tracking, and allocation status.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('maintenance.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition"
                        >
                            <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Maintenance Hub
                        </Link>
                        <Link
                            href={route('devices.create')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-2xs transition"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Register Asset
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Hardware Inventory - SpecMatch" />

            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 p-3.5 shadow-2xs mb-5">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
                    <div className="lg:col-span-2">
                        <input
                            type="text"
                            placeholder="Search tag, serial, brand, model..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-800/60 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <select
                            value={lifecycleStage}
                            onChange={(e) => setLifecycleStage(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-800/60 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Lifecycle Stages</option>
                            <option value="acquisition">Acquisition</option>
                            <option value="deployment">Deployment</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retirement">Retirement</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-800/60 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="available">Available (Idle)</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_repair">In Repair</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={deviceType}
                            onChange={(e) => setDeviceType(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-800/60 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Types</option>
                            <option value="laptop">Laptop</option>
                            <option value="desktop">Desktop</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={cpuTier}
                            onChange={(e) => setCpuTier(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-800/60 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All CPU Tiers</option>
                            <option value="entry">Entry Tier</option>
                            <option value="mid">Mid Tier</option>
                            <option value="high">High Tier</option>
                            <option value="workstation">Workstation</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="submit"
                            className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white transition"
                        >
                            Filter
                        </button>
                        {(search || status || lifecycleStage || deviceType || cpuTier || condition) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-750 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            <tr>
                                <th className="py-3 px-4">Asset Tag & Serial</th>
                                <th className="py-3 px-4">Device Clip & Model</th>
                                <th className="py-3 px-4">Specifications</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Lifecycle Phase</th>
                                <th className="py-3 px-4">Warranty</th>
                                <th className="py-3 px-4">Current User</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {devices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                                        No hardware assets found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                devices.data.map((device) => (
                                    <tr key={device.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                                        {/* Tag & Serial */}
                                        <td className="py-3 px-4 font-mono">
                                            <Link href={route('devices.show', device.id)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold block">
                                                {device.asset_tag}
                                            </Link>
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block truncate max-w-[110px]">
                                                {device.serial_number ? device.serial_number : 'No S/N'}
                                            </span>
                                        </td>

                                        {/* Device Clip & Model */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700/60 shrink-0 overflow-hidden shadow-2xs">
                                                    <img
                                                        src={device.image_clip_url}
                                                        alt={`${device.brand} ${device.model}`}
                                                        className="w-full h-full object-cover object-center"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80';
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[160px]">
                                                        {device.brand} {device.model}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 capitalize">
                                                        {device.device_type} &bull; {device.year_acquired}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Specifications */}
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[160px] text-[11px]">
                                                {device.cpu}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                                                <span className="font-semibold">{device.ram_gb}GB RAM</span> &bull; 
                                                <span>{device.storage_gb}GB {device.storage_type}</span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="py-3 px-4">
                                            <div className="text-slate-800 dark:text-zinc-200 truncate max-w-[130px] font-medium">
                                                {device.location || 'Pool Inventory'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[130px]">
                                                {device.vendor || 'Direct Purchase'}
                                            </div>
                                        </td>

                                        {/* Lifecycle Phase */}
                                        <td className="py-3 px-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                device.lifecycle_stage === 'acquisition' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50' :
                                                device.lifecycle_stage === 'deployment' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' :
                                                device.lifecycle_stage === 'maintenance' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50' :
                                                'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50'
                                            }`}>
                                                {device.lifecycle_stage}
                                            </span>
                                        </td>

                                        {/* Warranty */}
                                        <td className="py-3 px-4">
                                            {device.warranty_expiry ? (
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                                    device.warranty_status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' :
                                                    device.warranty_status === 'expiring_soon' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50' :
                                                    'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50'
                                                }`}>
                                                    {device.warranty_status.replace('_', ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 dark:text-zinc-500">None</span>
                                            )}
                                        </td>

                                        {/* Current User */}
                                        <td className="py-3 px-4">
                                            {device.active_assignment?.employee ? (
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-zinc-100">
                                                        {device.active_assignment.employee.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                        {device.active_assignment.employee.department}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-zinc-500 italic">Unassigned (Pool)</span>
                                            )}
                                        </td>

                                        {/* Action */}
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={route('devices.show', device.id)}
                                                className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                Details &rarr;
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {devices.links && devices.links.length > 3 && (
                    <div className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <div className="text-slate-500 dark:text-zinc-400">
                            Showing <span className="font-semibold text-slate-900 dark:text-zinc-100">{devices.from}</span> to <span className="font-semibold text-slate-900 dark:text-zinc-100">{devices.to}</span> of <span className="font-semibold text-slate-900 dark:text-zinc-100">{devices.total}</span> units
                        </div>
                        <div className="flex gap-1">
                            {devices.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                                        link.active ? 'bg-indigo-600 text-white' : 'border border-slate-200 dark:border-zinc-750 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
