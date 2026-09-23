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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">IT Asset Inventory</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Physical hardware catalog, lifecycle phase management, warranties, and device assignments.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('maintenance.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
                        >
                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Maintenance Hub
                        </Link>
                        <Link
                            href={route('devices.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Register Asset
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="IT Asset Inventory - SpecMatch" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                    <div className="lg:col-span-2">
                        <input
                            type="text"
                            placeholder="Search tag, serial, brand, model, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder-slate-400"
                        />
                    </div>
                    <div>
                        <select
                            value={lifecycleStage}
                            onChange={(e) => setLifecycleStage(e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-slate-700 font-medium"
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
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-slate-700"
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
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-slate-700"
                        >
                            <option value="">All Hardware Types</option>
                            <option value="laptop">Laptop</option>
                            <option value="desktop">Desktop</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={cpuTier}
                            onChange={(e) => setCpuTier(e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-slate-700"
                        >
                            <option value="">All CPU Tiers</option>
                            <option value="entry">Entry Tier</option>
                            <option value="mid">Mid Tier</option>
                            <option value="high">High Tier</option>
                            <option value="workstation">Workstation</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="w-full py-2 px-3 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                        >
                            Apply
                        </button>
                        {(search || status || lifecycleStage || deviceType || cpuTier || condition) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="py-2 px-3 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="py-3.5 px-4">Asset & Serial</th>
                                <th className="py-3.5 px-4">Hardware Model</th>
                                <th className="py-3.5 px-4">Specifications</th>
                                <th className="py-3.5 px-4">Location / Vendor</th>
                                <th className="py-3.5 px-4">Lifecycle Stage</th>
                                <th className="py-3.5 px-4">Warranty</th>
                                <th className="py-3.5 px-4">Assigned To</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {devices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        No hardware assets found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                devices.data.map((device) => (
                                    <tr key={device.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-4 px-4 font-mono">
                                            <Link href={route('devices.show', device.id)} className="text-indigo-600 hover:underline font-bold block">
                                                {device.asset_tag}
                                            </Link>
                                            <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                                                {device.serial_number ? `S/N: ${device.serial_number}` : 'No S/N'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-slate-900">{device.brand} {device.model}</div>
                                            <div className="text-xs text-slate-400 capitalize">{device.device_type} &bull; {device.year_acquired}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-xs font-medium text-slate-800 truncate max-w-[170px]">{device.cpu}</div>
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                                <span className="font-semibold text-slate-700">{device.ram_gb}GB</span> &bull; 
                                                <span>{device.storage_gb}GB {device.storage_type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-xs font-medium text-slate-900 truncate max-w-[150px]">
                                                {device.location ? `📍 ${device.location}` : 'Unassigned Location'}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate max-w-[150px] mt-0.5">
                                                {device.vendor || 'Direct Purchase'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                device.lifecycle_stage === 'acquisition' ? 'bg-sky-100 text-sky-800' :
                                                device.lifecycle_stage === 'deployment' ? 'bg-emerald-100 text-emerald-800' :
                                                device.lifecycle_stage === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                                                'bg-slate-200 text-slate-700'
                                            }`}>
                                                {device.lifecycle_stage}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {device.warranty_expiry ? (
                                                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                                    device.warranty_status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                                                    device.warranty_status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                                                    'bg-rose-50 text-rose-700 border border-rose-200/50'
                                                }`}>
                                                    {device.warranty_status}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400">Not recorded</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            {device.active_assignment?.employee ? (
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-xs">
                                                        {device.active_assignment.employee.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {device.active_assignment.employee.department}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned (Pool)</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={route('devices.show', device.id)}
                                                className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
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
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Showing <span className="font-semibold">{devices.from}</span> to <span className="font-semibold">{devices.to}</span> of <span className="font-semibold">{devices.total}</span> assets
                        </div>
                        <div className="flex gap-1">
                            {devices.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                                        link.active ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
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
