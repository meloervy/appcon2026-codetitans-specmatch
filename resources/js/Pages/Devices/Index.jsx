import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import HardwareImage from '@/Components/HardwareImage';
import ResizableTh from '@/Components/ResizableTh';
import { useResizableColumns } from '@/Hooks/useResizableColumns';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    RiSearchLine,
    RiLayoutGridLine,
    RiTableLine,
    RiFilePdfLine,
    RiToolsLine,
    RiAddLine,
    RiFilter3Line,
    RiRefreshLine,
    RiCheckboxCircleLine,
    RiArrowRightLine,
} from 'react-icons/ri';

export default function DevicesIndex({ devices, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [lifecycleStage, setLifecycleStage] = useState(filters.lifecycle_stage || '');
    const [deviceType, setDeviceType] = useState(filters.device_type || '');
    const [cpuTier, setCpuTier] = useState(filters.cpu_tier || '');
    const [condition, setCondition] = useState(filters.condition || '');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
    const [wrapText, setWrapText] = useState(false);

    const initialWidths = {
        device: 340,
        specs: 280,
        lifecycle: 190,
        user: 220,
        action: 140,
    };

    const { widths, startResize, autoExpandCol, resetWidths, isResizing, resizingCol } = useResizableColumns(initialWidths, 'devices_table_v6');

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('devices.index'),
                {
                    search,
                    status,
                    lifecycle_stage: lifecycleStage,
                    device_type: deviceType,
                    cpu_tier: cpuTier,
                    condition,
                    sort: filters?.sort,
                    direction: filters?.direction,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status, lifecycleStage, deviceType, cpuTier, condition]);

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
        e?.preventDefault();
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

    const activeFilterCount = [search, status, lifecycleStage, deviceType, cpuTier, condition].filter(Boolean).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
                            Hardware Fleet Inventory
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
                            Authoritative catalog with TechSpecs device clips, lifecycle tracking, and allocation status.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={route('devices.export.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                        >
                            <RiFilePdfLine className="w-4 h-4 text-rose-500" />
                            <span>Export Audit PDF</span>
                        </a>
                        <Link
                            href={route('maintenance.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
                        >
                            <RiToolsLine className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Service Hub</span>
                        </Link>
                        <Link
                            href={route('devices.create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-xs font-semibold text-white shadow-2xs transition"
                        >
                            <RiAddLine className="w-4 h-4" />
                            <span>Register Asset</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Hardware Inventory - SpecMatch" />

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-4 shadow-2xs mb-5">
                <form onSubmit={handleFilter} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
                        {/* Search Bar */}
                        <div className="lg:col-span-4 relative">
                            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tag, serial, brand, model, cpu..."
                                className="w-full text-xs font-medium pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                            />
                        </div>

                        {/* Lifecycle Stage Filter */}
                        <div className="lg:col-span-2">
                            <CustomSelect
                                value={lifecycleStage}
                                onChange={(val) => setLifecycleStage(val)}
                                placeholder="All Lifecycle Stages"
                                options={[
                                    { value: 'acquisition', label: 'Acquisition' },
                                    { value: 'deployment', label: 'Deployment' },
                                    { value: 'reclaimed', label: 'Reclaimed (In Pool)' },
                                    { value: 'maintenance', label: 'Maintenance' },
                                    { value: 'retirement', label: 'Retirement' },
                                ]}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="lg:col-span-2">
                            <CustomSelect
                                value={status}
                                onChange={(val) => setStatus(val)}
                                placeholder="All Statuses"
                                options={[
                                    { value: 'available', label: 'Available (Pool)' },
                                    { value: 'assigned', label: 'Assigned' },
                                    { value: 'in_repair', label: 'In Repair' },
                                    { value: 'retired', label: 'Retired' },
                                ]}
                            />
                        </div>

                        {/* CPU Tier Filter */}
                        <div className="lg:col-span-2">
                            <CustomSelect
                                value={cpuTier}
                                onChange={(val) => setCpuTier(val)}
                                placeholder="All CPU Tiers"
                                options={[
                                    { value: 'entry', label: 'Entry Tier' },
                                    { value: 'mid', label: 'Mid Tier' },
                                    { value: 'high', label: 'High Tier' },
                                    { value: 'workstation', label: 'Workstation Tier' },
                                ]}
                            />
                        </div>

                        {/* Filter & Reset Buttons */}
                        <div className="lg:col-span-2 flex items-center gap-1.5">
                            <button
                                type="submit"
                                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                                <RiFilter3Line className="w-3.5 h-3.5" />
                                <span>Filter</span>
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
                    </div>
                </form>

                {/* Toolbar: View Switcher, Sort & Total Count */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {devices.total} Units Cataloged
                        </span>
                        <span>&bull;</span>
                        <span className="hidden sm:inline">Click any row or &quot;View Details&quot; to open device profile</span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* View Switcher: Table vs Cards */}
                        <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/60">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                                }`}
                                title="Table View"
                            >
                                <RiTableLine className="w-3.5 h-3.5" />
                                <span>Table</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                                }`}
                                title="Cards Grid View"
                            >
                                <RiLayoutGridLine className="w-3.5 h-3.5" />
                                <span>Cards</span>
                            </button>
                        </div>

                        {viewMode === 'table' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setWrapText(!wrapText)}
                                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                        wrapText
                                            ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                            : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                                    }`}
                                >
                                    <span>{wrapText ? 'Wrap: ON' : 'Wrap: OFF'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={resetWidths}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                                >
                                    Reset
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* VIEW MODE 1: STREAMLINED DATA TABLE (5 ESSENTIAL COLUMNS) */}
            {viewMode === 'table' ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table
                            className="w-full text-left text-xs table-fixed"
                            style={{ minWidth: `${Math.max(900, Object.values(widths).reduce((a, b) => a + b, 0))}px` }}
                        >
                            <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-slate-500 dark:text-zinc-400">
                                <tr>
                                    {/* 1. Device & Asset Identifiers */}
                                    <ResizableTh
                                        colKey="device"
                                        sortKey="model"
                                        currentSort={filters.sort}
                                        sortDirection={filters.direction || 'asc'}
                                        onSort={handleSort}
                                        width={widths.device}
                                        onResizeStart={startResize}
                                        onAutoExpand={autoExpandCol}
                                        isResizing={resizingCol === 'device'}
                                    >
                                        Device & Asset
                                    </ResizableTh>

                                    {/* 2. Core Specifications */}
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

                                    {/* 3. Lifecycle & Status */}
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
                                        Lifecycle & Status
                                    </ResizableTh>

                                    {/* 4. Current User / Allocation */}
                                    <ResizableTh
                                        colKey="user"
                                        width={widths.user}
                                        onResizeStart={startResize}
                                        onAutoExpand={autoExpandCol}
                                        isResizing={resizingCol === 'user'}
                                    >
                                        Allocation
                                    </ResizableTh>

                                    {/* 5. Action */}
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
                                        <td colSpan={5} className="py-14 text-center text-slate-400 dark:text-zinc-500">
                                            No hardware assets found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    devices.data.map((device) => (
                                        <tr
                                            key={device.id}
                                            onClick={() => router.visit(route('devices.show', device.id))}
                                            className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                                        >
                                            {/* 1. Device & Asset */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 shrink-0 overflow-hidden shadow-2xs p-0.5 group-hover:scale-105 transition-transform">
                                                        <HardwareImage
                                                            src={device.image_clip_url || device.image_url}
                                                            alt={`${device.brand} ${device.model}`}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-[#026eff] dark:text-[#38bdf8] bg-[#026eff]/10 dark:bg-[#026eff]/20 px-2 py-0.5 rounded-md border border-[#026eff]/20">
                                                                {device.asset_tag}
                                                            </span>
                                                            <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize font-medium">
                                                                {device.device_type}
                                                            </span>
                                                        </div>
                                                        <h4 className={`font-bold text-slate-900 dark:text-zinc-100 text-sm mt-1 leading-snug ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`}>
                                                            {device.brand} {device.model}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Specifications */}
                                            <td className="py-4 px-5">
                                                <div className={`font-bold text-slate-900 dark:text-zinc-100 text-sm ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={device.cpu}>
                                                    {device.cpu}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/80">
                                                        {device.ram_gb}GB RAM
                                                    </span>
                                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/80">
                                                        {device.storage_gb}GB {device.storage_type}
                                                    </span>
                                                    {device.gpu_tier && device.gpu_tier !== 'none' && (
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-[#38bdf8] border border-[#026eff]/20 uppercase">
                                                            {device.gpu_tier}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 3. Lifecycle & Status */}
                                            <td className="py-4 px-5">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                                        device.status === 'available'
                                                            ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/60'
                                                            : device.status === 'assigned'
                                                            ? 'bg-[#026eff]/15 text-[#026eff] dark:bg-[#031a40]/60 dark:text-[#0b79ff] border border-[#026eff]/25 dark:border-[#031a40]/60'
                                                            : device.status === 'in_repair'
                                                            ? 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/60'
                                                            : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200'
                                                    }`}>
                                                        <span className="w-2 h-2 rounded-full bg-current"></span>
                                                        {device.status === 'available' ? 'Available' : device.status.replace('_', ' ')}
                                                    </span>

                                                    <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">
                                                        Phase: <strong className="font-semibold text-slate-800 dark:text-zinc-200">{device.lifecycle_stage}</strong>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 4. Current User / Allocation */}
                                            <td className="py-4 px-5">
                                                {device.active_assignment?.employee ? (
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate">
                                                            {device.active_assignment.employee.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                                                            {device.active_assignment.employee.department}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
                                                        <RiCheckboxCircleLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        <span>Pool Ready</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* 5. Action (Clean View Details Button) */}
                                            <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={route('devices.show', device.id)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#026eff] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#026eff] text-slate-700 dark:text-zinc-200 transition shadow-2xs cursor-pointer"
                                                >
                                                    <span>View Details</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* VIEW MODE 2: CARDS GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.data.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                            No hardware assets found matching criteria.
                        </div>
                    ) : (
                        devices.data.map((device) => (
                            <div
                                key={device.id}
                                onClick={() => router.visit(route('devices.show', device.id))}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-2xs hover:shadow-md hover:border-[#026eff]/40 dark:hover:border-[#026eff]/40 transition-all cursor-pointer flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="font-mono text-xs font-bold text-[#026eff] dark:text-[#38bdf8] bg-[#026eff]/10 dark:bg-[#026eff]/20 px-2 py-0.5 rounded-md border border-[#026eff]/20">
                                            {device.asset_tag}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                            device.status === 'available'
                                                ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                : device.status === 'assigned'
                                                ? 'bg-[#026eff]/15 text-[#026eff] dark:bg-[#031a40]/60 dark:text-[#0b79ff]'
                                                : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                        }`}>
                                            {device.status === 'available' ? 'Available' : device.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Photo & Titles */}
                                    <div className="flex items-center gap-3.5 mb-3.5">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden shrink-0 shadow-2xs p-0.5 group-hover:scale-105 transition-transform">
                                            <HardwareImage
                                                src={device.image_clip_url || device.image_url}
                                                alt={`${device.brand} ${device.model}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate">
                                                {device.brand} {device.model}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                                {device.cpu}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Specs Pills */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700">
                                            {device.ram_gb}GB RAM
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700">
                                            {device.storage_gb}GB {device.storage_type}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700 capitalize">
                                            {device.cpu_tier} CPU
                                        </span>
                                    </div>
                                </div>

                                {/* Card Footer: Allocation & Stage */}
                                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs mb-3">
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Allocation</span>
                                        {device.active_assignment?.employee ? (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {device.active_assignment.employee.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[130px] text-xs">
                                                    {device.active_assignment.employee.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                                <RiCheckboxCircleLine className="w-3.5 h-3.5" />
                                                <span>Pool Ready</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Phase</span>
                                        <span className="font-semibold text-slate-700 dark:text-zinc-300 capitalize text-xs mt-0.5 block">
                                            {device.lifecycle_stage}
                                        </span>
                                    </div>
                                </div>

                                {/* Prominent Action Button */}
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Link
                                        href={route('devices.show', device.id)}
                                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#026eff] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#026eff] text-slate-700 dark:text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-[#026eff] group-hover:text-white cursor-pointer"
                                    >
                                        <span>View Device Profile</span>
                                        <RiArrowRightLine className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination Bar */}
            {devices.links && devices.links.length > 3 && (
                <div className="mt-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="text-slate-500 dark:text-zinc-400">
                        Showing <span className="font-semibold text-slate-900 dark:text-zinc-100">{devices.from}</span> to <span className="font-semibold text-slate-900 dark:text-zinc-100">{devices.to}</span> of <span className="font-semibold text-slate-900 dark:text-zinc-100">{devices.total}</span> units
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {devices.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition ${
                                    link.active
                                        ? 'bg-[#026eff] text-white shadow-2xs'
                                        : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
