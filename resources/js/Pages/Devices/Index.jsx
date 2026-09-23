import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function DevicesIndex({ devices, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deviceType, setDeviceType] = useState(filters.device_type || '');
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier || '');
    const [condition, setCondition] = useState(filters.condition || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('devices.index'), {
            search,
            status,
            device_type: deviceType,
            cpu_tier: cpuTier,
            condition,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
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
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hardware Inventory</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Track and filter company devices, specifications, and allocation status.
                        </p>
                    </div>
                    <Link
                        href={route('devices.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition self-start sm:self-auto"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Register New Device
                    </Link>
                </div>
            }
        >
            <Head title="Devices - SpecMatch" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2">
                        <input
                            type="text"
                            placeholder="Search asset tag, brand, model, cpu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder-slate-400"
                        />
                    </div>
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-slate-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="available">Available</option>
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
                            <option value="">All Types</option>
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
                            <option value="entry">Entry</option>
                            <option value="mid">Mid</option>
                            <option value="high">High</option>
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
                        {(search || status || deviceType || cpuTier || condition) && (
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
                                <th className="py-3.5 px-4">Asset Tag</th>
                                <th className="py-3.5 px-4">Hardware</th>
                                <th className="py-3.5 px-4">CPU & RAM</th>
                                <th className="py-3.5 px-4">Storage & GPU</th>
                                <th className="py-3.5 px-4">Condition</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Current User</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {devices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        No devices found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                devices.data.map((device) => (
                                    <tr key={device.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-4 px-4 font-mono font-bold text-slate-900">
                                            <Link href={route('devices.show', device.id)} className="text-indigo-600 hover:underline">
                                                {device.asset_tag}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-slate-900">{device.brand} {device.model}</div>
                                            <div className="text-xs text-slate-400 capitalize">{device.device_type} • {device.year_acquired}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-xs font-medium text-slate-800">{device.cpu}</div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600 capitalize">
                                                    {device.cpu_tier}
                                                </span>
                                                <span className="text-xs text-slate-600 font-semibold">
                                                    {device.ram_gb} GB RAM
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-xs text-slate-800 font-medium">
                                                {device.storage_gb} GB {device.storage_type}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {device.gpu_tier !== 'none' ? (
                                                    <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
                                                        {device.gpu || device.gpu_tier}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">No dedicated GPU</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                                device.condition === 'excellent' ? 'bg-emerald-50 text-emerald-700' :
                                                device.condition === 'good' ? 'bg-blue-50 text-blue-700' :
                                                device.condition === 'fair' ? 'bg-amber-50 text-amber-700' :
                                                'bg-rose-50 text-rose-700'
                                            }`}>
                                                {device.condition.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                device.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                                                device.status === 'assigned' ? 'bg-slate-100 text-slate-700' :
                                                device.status === 'in_repair' ? 'bg-amber-100 text-amber-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {device.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {device.active_assignment?.employee ? (
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {device.active_assignment.employee.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {device.active_assignment.employee.department}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned (Idle)</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={route('devices.show', device.id)}
                                                className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                Manage &rarr;
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
                            Showing <span className="font-semibold">{devices.from}</span> to <span className="font-semibold">{devices.to}</span> of <span className="font-semibold">{devices.total}</span> devices
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
