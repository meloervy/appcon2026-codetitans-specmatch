import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function MaintenanceIndex({ logs, stats, filters }) {
    const [type, setType] = useState(filters.type || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedLogToUpdate, setSelectedLogToUpdate] = useState(null);

    const { data: updateData, setData: setUpdateData, put, processing, reset } = useForm({
        cost: 0,
        completed_at: new Date().toISOString().split('T')[0],
        performance_assessment: '',
        status: 'completed',
        restore_to_available: true,
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('maintenance.index'), {
            type,
            status,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setType('');
        setStatus('');
        router.get(route('maintenance.index'));
    };

    const handleOpenUpdateModal = (log) => {
        setSelectedLogToUpdate(log);
        setUpdateData({
            cost: log.cost || 0,
            completed_at: log.completed_at || new Date().toISOString().split('T')[0],
            performance_assessment: log.performance_assessment || '',
            status: log.status === 'completed' ? 'completed' : 'completed',
            restore_to_available: true,
        });
    };

    const handleSaveUpdate = (e) => {
        e.preventDefault();
        if (!selectedLogToUpdate) return;

        put(route('maintenance.update', selectedLogToUpdate.id), {
            onSuccess: () => {
                setSelectedLogToUpdate(null);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">IT Maintenance & Servicing</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Hardware repairs, component upgrades, preventive servicing, and performance assessments.
                        </p>
                    </div>
                    <Link
                        href={route('devices.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition self-start sm:self-auto"
                    >
                        &larr; View Fleet Inventory
                    </Link>
                </div>
            }
        >
            <Head title="Maintenance & Servicing - SpecMatch" />

            <div className="space-y-6">
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Servicing Spend</span>
                            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                            ${Number(stats.total_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Cumulative hardware repair & upgrade expenditures</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Servicing Queue</span>
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-amber-600">
                            {stats.active_repairs} <span className="text-sm font-semibold text-slate-500">Units</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Scheduled or currently in-progress repairs</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Operations</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-emerald-600">
                            {stats.completed_count} <span className="text-sm font-semibold text-slate-500">Completed</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Fully tested with logged performance impacts</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All Activity Types</option>
                                <option value="repair">Repair</option>
                                <option value="upgrade">Hardware Upgrade</option>
                                <option value="preventive">Preventive Servicing</option>
                                <option value="inspection">Inspection / Audit</option>
                                <option value="replacement">Component Replacement</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="w-full py-2 px-3 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                            >
                                Filter Logs
                            </button>
                            {(type || status) && (
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

                {/* Maintenance Logs Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="py-3.5 px-4">Asset Tag</th>
                                    <th className="py-3.5 px-4">Activity Title & Type</th>
                                    <th className="py-3.5 px-4">Work Scope & Performance Impact</th>
                                    <th className="py-3.5 px-4">Technician / Vendor</th>
                                    <th className="py-3.5 px-4">Cost ($)</th>
                                    <th className="py-3.5 px-4">Timeline</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400">
                                            No maintenance records found matching your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 transition">
                                            <td className="py-4 px-4 font-mono font-bold">
                                                {log.device ? (
                                                    <Link href={route('devices.show', log.device.id)} className="text-indigo-600 hover:underline">
                                                        {log.device.asset_tag}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">Unknown</span>
                                                )}
                                                <div className="text-[11px] font-normal text-slate-500">
                                                    {log.device?.brand} {log.device?.model}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-slate-900">{log.title}</div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                                    log.type === 'repair' ? 'bg-rose-100 text-rose-800' :
                                                    log.type === 'upgrade' ? 'bg-indigo-100 text-indigo-800' :
                                                    log.type === 'preventive' ? 'bg-emerald-100 text-emerald-800' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 max-w-xs">
                                                <p className="text-xs text-slate-600 line-clamp-2">{log.description}</p>
                                                {log.performance_assessment && (
                                                    <div className="mt-1.5 p-2 rounded bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800">
                                                        <span className="font-bold">Assessment:</span> {log.performance_assessment}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-xs font-medium text-slate-700">
                                                {log.performed_by || 'Internal IT Desk'}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-900">
                                                ${Number(log.cost).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-xs text-slate-500">
                                                <div>Started: {new Date(log.started_at).toLocaleDateString()}</div>
                                                {log.completed_at && (
                                                    <div className="text-slate-400">Done: {new Date(log.completed_at).toLocaleDateString()}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                    log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                    log.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                                                    log.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {log.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenUpdateModal(log)}
                                                    className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {log.status === 'completed' ? 'Edit Assessment' : 'Assess & Close'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                Showing <span className="font-semibold">{logs.from}</span> to <span className="font-semibold">{logs.to}</span> of <span className="font-semibold">{logs.total}</span> logs
                            </div>
                            <div className="flex gap-1">
                                {logs.links.map((link, idx) => (
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
            </div>

            {/* Modal: Update / Complete Servicing Log */}
            {selectedLogToUpdate && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900">Assess & Update Servicing</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{selectedLogToUpdate.device?.asset_tag} &bull; {selectedLogToUpdate.title}</p>
                            </div>
                            <button onClick={() => setSelectedLogToUpdate(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSaveUpdate} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Final Incurred Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={updateData.cost}
                                        onChange={(e) => setUpdateData('cost', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Status</label>
                                    <select
                                        value={updateData.status}
                                        onChange={(e) => setUpdateData('status', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200 font-semibold"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Completion Date</label>
                                <input
                                    type="date"
                                    value={updateData.completed_at}
                                    onChange={(e) => setUpdateData('completed_at', e.target.value)}
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Performance Assessment & Impact *</label>
                                <textarea
                                    rows={3}
                                    value={updateData.performance_assessment}
                                    onChange={(e) => setUpdateData('performance_assessment', e.target.value)}
                                    placeholder="Assess asset performance post-servicing (e.g. stress test temperature, passmark scores, battery health, RAM stability)..."
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    This assessment data is recorded as part of the ITAM lifecycle evaluation.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                                    <input
                                        type="checkbox"
                                        checked={updateData.restore_to_available}
                                        onChange={(e) => setUpdateData('restore_to_available', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Transition Asset back to Active Deployment Stage
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLogToUpdate(null)}
                                    className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                                >
                                    {processing ? 'Saving...' : 'Save Assessment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
