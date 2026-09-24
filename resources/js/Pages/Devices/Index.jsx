import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import GooeyInput from '@/Components/ui/GooeyInput';
import ResizableTh from '@/Components/ResizableTh';
import { useResizableColumns } from '@/Hooks/useResizableColumns';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function DevicesIndex({ devices, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [lifecycleStage, setLifecycleStage] = useState(filters.lifecycle_stage || '');
    const [deviceType, setDeviceType] = useState(filters.device_type || '');
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier || '');
    const [condition, setCondition] = useState(filters.condition || '');
    const [wrapText, setWrapText] = useState(false);

    const initialWidths = {
        tag: 150,
        model: 230,
        specs: 230,
        location: 160,
        lifecycle: 130,
        warranty: 120,
        user: 160,
        date: 120,
        action: 90,
    };

    const { widths, startResize, autoExpandCol, resetWidths, isResizing, resizingCol } = useResizableColumns(initialWidths, 'devices_table_v2');

    const handleSort = (sortKey) => {
        const currentSort = filters.sort || 'asset_tag';
        const currentDirection = filters.direction || 'asc';
        const nextDirection = (currentSort === sortKey && currentDirection === 'asc') ? 'desc' : 'asc';

        router.get(route('devices.index'), {
            search,
            status,
            lifecycle_stage: lifecycleStage,
            device_type: deviceType,
            cpu_tier: cpuTier,
            condition,
            sort: sortKey,
            direction: nextDirection,
        }, { preserveState: true, replace: true });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('devices.index'), {
            search,
            status,
            lifecycle_stage: lifecycleStage,
            device_type: deviceType,
            cpu_tier: cpuTier,
            condition,
            sort: filters.sort,
            direction: filters.direction,
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
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">Hardware Inventory</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
                            Authoritative catalog with TechSpecs device clips, lifecycle tracking, and allocation status.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={route('devices.export.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-750 transition"
                        >
                            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Audit PDF
                        </a>
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#026eff] hover:bg-[#0256cc] text-xs font-semibold text-white shadow-2xs transition"
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-3.5 shadow-2xs mb-5">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
                    <div className="lg:col-span-2 flex items-center">
                        <GooeyInput
                            value={search}
                            onValueChange={(val) => setSearch(val)}
                            placeholder="Search tag, serial, model..."
                            collapsedWidth={140}
                            expandedWidth={220}
                            className="w-full justify-start"
                        />
                    </div>
                    <div>
                        <select
                            value={lifecycleStage}
                            onChange={(e) => setLifecycleStage(e.target.value)}
                            className="w-full text-xs font-medium py-2 px-3 rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                        >
                            <option value="">All Lifecycle Stages</option>
                            <option value="acquisition">Acquisition</option>
                            <option value="deployment">Deployment</option>
                            <option value="reclaimed">Reclaimed (In Pool)</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retirement">Retirement</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-xs font-medium py-2 px-3 rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
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
                            className="w-full text-xs font-medium py-2 px-3 rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
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
                            className="w-full text-xs font-medium py-2 px-3 rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
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
                            className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer"
                        >
                            Filter
                        </button>
                        {(search || status || lifecycleStage || deviceType || cpuTier || condition) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-750 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Inventory Table Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
                {/* Column Adjustment & Display Control Toolbar */}
                <div className="px-4 py-2 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/70 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px]">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[#026eff]/10 text-[#026eff] font-bold text-[10px]">↕</span>
                        <span>Click any header to sort • Drag dividers to resize</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={() => handleSort('created_at')}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                filters.sort === 'created_at' || filters.sort === 'date'
                                    ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-750 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                            }`}
                            title="Sort hardware inventory chronologically by registration date"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Sort Chronologically {(filters.sort === 'created_at' || filters.sort === 'date') ? (filters.direction === 'desc' ? '(Newest)' : '(Oldest)') : ''}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setWrapText(!wrapText)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                wrapText
                                    ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-750 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                            }`}
                            title="Toggle text wrapping to reveal long descriptions without truncation"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10l-3-3m0 6l3-3m5 3H4" />
                            </svg>
                            <span>{wrapText ? 'Wrap Text: ON' : 'Wrap Text: OFF'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={resetWidths}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                            title="Reset column widths to default"
                        >
                            Reset Columns
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table
                        className="w-full text-left text-xs table-fixed"
                        style={{ minWidth: `${Math.max(1000, Object.values(widths).reduce((a, b) => a + b, 0))}px` }}
                    >
                        <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-slate-500 dark:text-zinc-400">
                            <tr>
                                <ResizableTh
                                    colKey="tag"
                                    sortKey="tag"
                                    currentSort={filters.sort || 'asset_tag'}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.tag}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'tag'}
                                >
                                    Asset Tag & Serial
                                </ResizableTh>
                                <ResizableTh
                                    colKey="model"
                                    sortKey="model"
                                    currentSort={filters.sort}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.model}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'model'}
                                >
                                    Device Clip & Model
                                </ResizableTh>
                                <ResizableTh
                                    colKey="specs"
                                    sortKey="specs"
                                    currentSort={filters.sort}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.specs}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'specs'}
                                >
                                    Specifications
                                </ResizableTh>
                                <ResizableTh
                                    colKey="location"
                                    sortKey="location"
                                    currentSort={filters.sort}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.location}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'location'}
                                >
                                    Location
                                </ResizableTh>
                                <ResizableTh
                                    colKey="lifecycle"
                                    sortKey="lifecycle"
                                    currentSort={filters.sort}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.lifecycle}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'lifecycle'}
                                >
                                    Lifecycle Phase
                                </ResizableTh>
                                <ResizableTh
                                    colKey="warranty"
                                    sortKey="warranty"
                                    currentSort={filters.sort}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.warranty}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'warranty'}
                                >
                                    Warranty
                                </ResizableTh>
                                <ResizableTh
                                    colKey="user"
                                    width={widths.user}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'user'}
                                >
                                    Current User
                                </ResizableTh>
                                <ResizableTh
                                    colKey="date"
                                    sortKey="created_at"
                                    currentSort={filters.sort}
                                    sortDirection={filters.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.date}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'date'}
                                >
                                    Registered
                                </ResizableTh>
                                <ResizableTh
                                    colKey="action"
                                    width={widths.action}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'action'}
                                    align="right"
                                    resizable={false}
                                >
                                    Action
                                </ResizableTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {devices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                                        No hardware assets found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                devices.data.map((device) => (
                                    <tr key={device.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                                        {/* Tag & Serial */}
                                        <td className="py-3 px-4 font-mono">
                                            <Link href={route('devices.show', device.id)} className="text-[#026eff] dark:text-[#0b79ff] hover:underline font-bold block truncate" title={device.asset_tag}>
                                                {device.asset_tag}
                                            </Link>
                                            <span className={`text-[10px] text-slate-400 dark:text-zinc-500 block ${wrapText ? 'break-all whitespace-normal' : 'truncate'}`} title={device.serial_number || 'No S/N'}>
                                                {device.serial_number ? device.serial_number : 'No S/N'}
                                            </span>
                                        </td>

                                        {/* Device Clip & Model */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700/60 shrink-0 overflow-hidden shadow-2xs">
                                                    <HardwareImage
                                                        src={device.image_clip_url || device.image_url}
                                                        alt={`${device.brand} ${device.model}`}
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`font-semibold text-slate-900 dark:text-zinc-100 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={`${device.brand} ${device.model}`}>
                                                        {device.brand} {device.model}
                                                    </div>
                                                    <div className={`text-[10px] text-slate-400 dark:text-zinc-500 capitalize ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={`${device.device_type} • ${device.year_acquired}`}>
                                                        {device.device_type} &bull; {device.year_acquired}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Specifications */}
                                        <td className="py-3 px-4">
                                            <div className={`font-medium text-slate-800 dark:text-zinc-200 text-[11px] ${wrapText ? 'break-words whitespace-normal leading-snug' : 'truncate'}`} title={device.cpu}>
                                                {device.cpu}
                                            </div>
                                            <div className={`flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400 ${wrapText ? 'flex-wrap' : 'truncate'}`}>
                                                <span className="font-semibold shrink-0">{device.ram_gb}GB RAM</span> &bull; 
                                                <span className="shrink-0">{device.storage_gb}GB {device.storage_type}</span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="py-3 px-4">
                                            <div className={`text-slate-800 dark:text-zinc-200 font-medium ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={device.location || 'Pool Inventory'}>
                                                {device.location || 'Pool Inventory'}
                                            </div>
                                            <div className={`text-[10px] text-slate-400 dark:text-zinc-500 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={device.vendor || 'Direct Purchase'}>
                                                {device.vendor || 'Direct Purchase'}
                                            </div>
                                        </td>

                                        {/* Lifecycle Phase */}
                                        <td className="py-3 px-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                                                device.lifecycle_stage === 'acquisition' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50' :
                                                device.lifecycle_stage === 'deployment' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' :
                                                device.lifecycle_stage === 'reclaimed' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50' :
                                                device.lifecycle_stage === 'maintenance' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50' :
                                                'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50'
                                            }`}>
                                                {device.lifecycle_stage}
                                            </span>
                                        </td>

                                        {/* Warranty */}
                                        <td className="py-3 px-4">
                                            {device.warranty_expiry ? (
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md inline-block ${
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
                                                <div className="min-w-0">
                                                    <div className={`font-semibold text-slate-900 dark:text-zinc-100 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={device.active_assignment.employee.name}>
                                                        {device.active_assignment.employee.name}
                                                    </div>
                                                    <div className={`text-[10px] text-slate-400 dark:text-zinc-500 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={device.active_assignment.employee.department}>
                                                        {device.active_assignment.employee.department}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-zinc-500 italic">Unassigned (Pool)</span>
                                            )}
                                        </td>

                                        {/* Chronological Registration Date */}
                                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                            <div className="font-medium text-slate-700 dark:text-zinc-300">
                                                {device.created_at ? new Date(device.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                                {device.created_at ? new Date(device.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={route('devices.show', device.id)}
                                                className="inline-flex items-center text-xs font-semibold text-[#026eff] dark:text-[#0b79ff] hover:underline"
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
                                        link.active ? 'bg-[#026eff] text-white' : 'border border-slate-200 dark:border-zinc-750 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
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
