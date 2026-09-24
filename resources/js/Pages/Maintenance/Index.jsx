import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import HardwareImage from '@/Components/HardwareImage';
import ResizableTh from '@/Components/ResizableTh';
import { useResizableColumns } from '@/Hooks/useResizableColumns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { RiFilter3Line, RiRefreshLine } from 'react-icons/ri';

export default function MaintenanceIndex({ logs, stats, filters }) {
    const [type, setType] = useState(filters.type || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedLogToUpdate, setSelectedLogToUpdate] = useState(null);
    const [wrapText, setWrapText] = useState(false);

    const activeFilterCount = (type ? 1 : 0) + (status ? 1 : 0);

    const initialWidths = {
        device: 220,
        activity: 180,
        scope: 280,
        technician: 160,
        cost: 110,
        timeline: 140,
        status: 110,
        actions: 100,
    };

    const { widths, startResize, autoExpandCol, resetWidths, isResizing, resizingCol } = useResizableColumns(initialWidths, 'maintenance_table');

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
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">IT Maintenance & Servicing</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            Hardware repairs, component upgrades, preventive servicing, and performance assessments.
                        </p>
                    </div>
                    <Link
                        href={route('devices.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 text-sm font-semibold text-white dark:text-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-700 shadow-sm transition self-start sm:self-auto border border-transparent dark:border-zinc-700"
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
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Total Servicing Spend</span>
                            <span className="p-2 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/40 text-[#026eff] dark:text-[#0b79ff]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                            ₱{Number(stats.total_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Cumulative hardware repair & upgrade expenditures</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Active Servicing Queue</span>
                            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                            {stats.active_count || 0} Assets
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Hardware currently in repair or scheduled for maintenance</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Completed Lifecycle Actions</span>
                            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                            {stats.completed_count || 0}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Historical repairs & upgrades logged with performance audits</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 shadow-xs">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div>
                            <CustomSelect
                                value={type}
                                onChange={(val) => setType(val)}
                                placeholder="All Maintenance Types"
                                options={[
                                    { value: 'repair', label: 'Repair' },
                                    { value: 'upgrade', label: 'Hardware Upgrade' },
                                    { value: 'preventive', label: 'Preventive Servicing' },
                                    { value: 'inspection', label: 'Inspection & Diagnostics' },
                                ]}
                            />
                        </div>
                        <div>
                            <CustomSelect
                                value={status}
                                onChange={(val) => setStatus(val)}
                                placeholder="All Statuses"
                                options={[
                                    { value: 'scheduled', label: 'Scheduled' },
                                    { value: 'in_progress', label: 'In Progress' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                            />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="submit"
                                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                                <RiFilter3Line className="w-3.5 h-3.5" />
                                <span>Filter Logs</span>
                            </button>
                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="py-2 px-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                    title="Reset all filters"
                                >
                                    <RiRefreshLine className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {logs.total || logs.data?.length || 0} Maintenance Records
                            </span>
                            {activeFilterCount > 0 && (
                                <>
                                    <span>&bull;</span>
                                    <span>
                                        Filtered by <strong className="text-slate-800 dark:text-zinc-200">{activeFilterCount}</strong> active criteria
                                    </span>
                                </>
                            )}
                            <span>&bull;</span>
                            <span className="hidden sm:inline">Track status, upgrade history, and servicing expenses</span>
                        </div>
                    </div>
                </div>

                {/* Maintenance Logs Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
                    {/* Column Adjustment & Display Control Toolbar */}
                    <div className="px-4 py-2 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/70 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px]">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[#026eff]/10 text-[#026eff] font-bold text-[10px]">↔</span>
                            <span>Drag column dividers to resize • Double-click divider to expand (+120px)</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={() => setWrapText(!wrapText)}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                    wrapText
                                        ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                                }`}
                                title="Toggle text wrapping to reveal full maintenance descriptions without truncation"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10l-3-3m0 6l3-3m5 3H4" />
                                </svg>
                                <span>{wrapText ? 'Wrap Text: ON' : 'Wrap Text: OFF'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={resetWidths}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                                title="Reset column widths to default"
                            >
                                Reset Columns
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table
                            className="w-full text-left text-sm table-fixed"
                            style={{ minWidth: `${Math.max(1000, Object.values(widths).reduce((a, b) => a + b, 0))}px` }}
                        >
                            <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                <tr>
                                    <ResizableTh colKey="device" width={widths.device} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'device'}>Asset Tag & Device</ResizableTh>
                                    <ResizableTh colKey="activity" width={widths.activity} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'activity'}>Activity Title & Type</ResizableTh>
                                    <ResizableTh colKey="scope" width={widths.scope} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'scope'}>Work Scope & Performance Impact</ResizableTh>
                                    <ResizableTh colKey="technician" width={widths.technician} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'technician'}>Technician / Vendor</ResizableTh>
                                    <ResizableTh colKey="cost" width={widths.cost} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'cost'}>Cost (₱)</ResizableTh>
                                    <ResizableTh colKey="timeline" width={widths.timeline} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'timeline'}>Timeline</ResizableTh>
                                    <ResizableTh colKey="status" width={widths.status} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'status'}>Status</ResizableTh>
                                    <ResizableTh colKey="actions" width={widths.actions} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'actions'} align="right" resizable={false}>Actions</ResizableTh>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                                            No maintenance records found matching your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                                            <td className="py-4 px-4 font-mono font-bold">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                        <HardwareImage
                                                            src={log.device?.image_clip_url || log.device?.image_url}
                                                            alt={log.device?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        {log.device ? (
                                                            <Link href={route('devices.show', log.device.id)} className="text-[#026eff] dark:text-[#0b79ff] hover:underline block truncate" title={log.device.asset_tag}>
                                                                {log.device.asset_tag}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-zinc-500">Unknown</span>
                                                        )}
                                                        <div className={`text-[11px] font-normal text-slate-500 dark:text-zinc-400 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={`${log.device?.brand} ${log.device?.model}`}>
                                                            {log.device?.brand} {log.device?.model}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={`font-semibold text-slate-900 dark:text-zinc-100 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={log.title}>{log.title}</div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded border shadow-xs ${
                                                    log.type === 'repair' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-900/50' :
                                                    log.type === 'upgrade' ? 'bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] border-[#026eff]/20 dark:border-[#031a40]/60' :
                                                    log.type === 'preventive' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/50' :
                                                    'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200/50 dark:border-zinc-700/50'
                                                }`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className={`text-xs text-slate-600 dark:text-zinc-300 ${wrapText ? 'break-words whitespace-normal' : 'line-clamp-2'}`} title={log.description}>{log.description}</p>
                                                {log.performance_assessment && (
                                                    <div className="mt-1.5 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                                                        <span className="font-bold">Assessment:</span> <span className={wrapText ? 'break-words whitespace-normal' : 'line-clamp-1'} title={log.performance_assessment}>{log.performance_assessment}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-zinc-300">
                                                <div className={wrapText ? 'break-words whitespace-normal' : 'truncate'} title={log.performed_by || 'Internal IT Desk'}>
                                                    {log.performed_by || 'Internal IT Desk'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-zinc-100">
                                                ₱{Number(log.cost).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-xs text-slate-500 dark:text-zinc-400">
                                                <div>Started: {new Date(log.started_at).toLocaleDateString()}</div>
                                                {log.completed_at && (
                                                    <div className="text-slate-400 dark:text-zinc-500">Done: {new Date(log.completed_at).toLocaleDateString()}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block border shadow-xs ${
                                                    log.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/50' :
                                                    log.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/50' :
                                                    log.status === 'scheduled' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/50 dark:border-sky-900/50' :
                                                    'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200/50 dark:border-zinc-700/50'
                                                }`}>
                                                    {log.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenUpdateModal(log)}
                                                    className="inline-flex items-center text-xs font-bold text-[#026eff] dark:text-[#0b79ff] hover:text-[#026eff] dark:hover:text-[#0b79ff] cursor-pointer"
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
                        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="text-xs text-slate-500 dark:text-zinc-400">
                                Showing <span className="font-semibold">{logs.from}</span> to <span className="font-semibold">{logs.to}</span> of <span className="font-semibold">{logs.total}</span> logs
                            </div>
                            <div className="flex gap-1">
                                {logs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                                            link.active ? 'bg-[#026eff] text-white' : 'border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
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
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-zinc-100">Assess & Update Servicing</h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{selectedLogToUpdate.device?.asset_tag} &bull; {selectedLogToUpdate.title}</p>
                            </div>
                            <button onClick={() => setSelectedLogToUpdate(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSaveUpdate} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Final Incurred Cost (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={updateData.cost}
                                        onChange={(e) => setUpdateData('cost', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Status</label>
                                    <select
                                        value={updateData.status}
                                        onChange={(e) => setUpdateData('status', e.target.value)}
                                        className="mt-1 w-full text-sm font-semibold rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Completion Date</label>
                                <input
                                    type="date"
                                    value={updateData.completed_at}
                                    onChange={(e) => setUpdateData('completed_at', e.target.value)}
                                    className="mt-1 w-full text-sm rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Performance Assessment & Impact *</label>
                                <textarea
                                    rows={3}
                                    value={updateData.performance_assessment}
                                    onChange={(e) => setUpdateData('performance_assessment', e.target.value)}
                                    placeholder="Assess asset performance post-servicing (e.g. stress test temperature, passmark scores, battery health, RAM stability)..."
                                    className="mt-1 w-full text-sm rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                                    This assessment data is recorded as part of the ITAM lifecycle evaluation.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                    <input
                                        type="checkbox"
                                        checked={updateData.restore_to_available}
                                        onChange={(e) => setUpdateData('restore_to_available', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-zinc-600 text-[#026eff] focus:ring-[#026eff] bg-white dark:bg-zinc-700"
                                    />
                                    Transition Asset back to Active Deployment Stage
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLogToUpdate(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
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
