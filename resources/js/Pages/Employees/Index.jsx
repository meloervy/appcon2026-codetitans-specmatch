import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import ResizableTh from '@/Components/ResizableTh';
import { useResizableColumns } from '@/Hooks/useResizableColumns';
import useOutsideClick from '@/hooks/useOutsideClick';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    RiMoreFill,
    RiExchangeLine,
    RiCloseCircleLine,
    RiEditLine,
    RiArrowRightLine,
    RiSearchLine,
    RiUserAddLine,
    RiTeamLine,
    RiMacbookLine,
    RiAlertLine,
    RiUserStarLine,
    RiFilePdfLine,
    RiFilter3Line,
    RiCheckboxCircleLine,
} from 'react-icons/ri';

export default function EmployeesIndex({ employees, role_profiles = [], departments = [], stats = {}, filters = {} }) {
    const [showModal, setShowModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [wrapText, setWrapText] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [department, setDepartment] = useState(filters?.department || '');
    const [roleProfileId, setRoleProfileId] = useState(filters?.role_profile_id || '');
    const [hardwareStatus, setHardwareStatus] = useState(filters?.hardware_status || '');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);
    const tableContainerRef = useRef(null);

    useOutsideClick(tableContainerRef, () => {
        if (openMenuId !== null) {
            setOpenMenuId(null);
        }
    });

    const initialWidths = {
        employee: 210,
        department: 140,
        role_profile: 160,
        hardware: 220,
        specs: 190,
        date: 130,
        actions: 120,
    };

    const { widths, startResize, autoExpandCol, resetWidths, isResizing, resizingCol } = useResizableColumns(initialWidths, 'employees_table_v5');

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        department: '',
        role_profile_id: '',
        profile_picture: '',
        profile_picture_file: null,
        notes: '',
    });

    const { post: postUnassign } = useForm();

    const handleSort = (sortKey) => {
        const currentSort = filters?.sort || 'name';
        const currentDirection = filters?.direction || 'asc';
        const nextDirection = currentSort === sortKey && currentDirection === 'asc' ? 'desc' : 'asc';

        router.get(
            route('employees.index'),
            {
                search,
                department,
                role_profile_id: roleProfileId,
                hardware_status: hardwareStatus,
                sort: sortKey,
                direction: nextDirection,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('employees.index'),
            {
                search,
                department,
                role_profile_id: roleProfileId,
                hardware_status: hardwareStatus,
                sort: filters?.sort,
                direction: filters?.direction,
            },
            { preserveState: true, replace: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setDepartment('');
        setRoleProfileId('');
        setHardwareStatus('');
        router.get(route('employees.index'));
    };

    const activeFilterCount = [search, department, roleProfileId, hardwareStatus].filter(Boolean).length;
    const employeeList = Array.isArray(employees) ? employees : employees?.data || [];

    const openCreate = () => {
        setEditingEmp(null);
        setFilePreview(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (emp) => {
        setEditingEmp(emp);
        setFilePreview(null);
        setData({
            name: emp.name,
            department: emp.department,
            role_profile_id: emp.role_profile_id || '',
            profile_picture: emp.profile_picture || '',
            profile_picture_file: null,
            notes: emp.notes || '',
        });
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_picture_file', file);
            const previewUrl = URL.createObjectURL(file);
            setFilePreview(previewUrl);
        }
    };

    const handleClearPhoto = () => {
        setData((prev) => ({
            ...prev,
            profile_picture: 'public/user/default-profile-picture.png',
            profile_picture_file: null,
        }));
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEmp) {
            post(route('employees.update', editingEmp.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setFilePreview(null);
                },
                forceFormData: true,
            });
        } else {
            post(route('employees.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    setFilePreview(null);
                },
                forceFormData: true,
            });
        }
    };

    const handleUnassign = (emp) => {
        if (confirm(`Unassign hardware from ${emp.name}? Device will return to Available status.`)) {
            postUnassign(route('employees.unassign', emp.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">Company Staff Directory</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            Workforce profiles, role spec thresholds, and currently issued hardware allocations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={route('employees.export.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                        >
                            <RiFilePdfLine className="w-4 h-4 text-rose-500" />
                            <span>Export Audit PDF</span>
                        </a>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#026eff] text-xs font-semibold text-white hover:bg-[#0256cc] shadow-2xs transition cursor-pointer"
                        >
                            <RiUserAddLine className="w-4 h-4" />
                            <span>Add Employee</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Employees Directory - SpecMatch" />

            {/* 1. KPI Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
                {/* 1. Total Staff */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Workforce</span>
                        <div className="w-8 h-8 rounded-xl bg-[#026eff]/10 dark:bg-[#026eff]/20 flex items-center justify-center text-[#026eff] dark:text-[#38bdf8]">
                            <RiTeamLine className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats?.total || 0}</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">registered staff</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                        <span>Active corporate directory</span>
                    </div>
                </div>

                {/* 2. Equipped with Hardware */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Hardware Equipped</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <RiMacbookLine className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats?.assigned || 0}</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {stats?.assigned_percentage || 0}%
                        </span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, stats?.assigned_percentage || 0))}%` }}
                        ></div>
                    </div>
                </div>

                {/* 3. Hardware Needed */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Needs Hardware</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            stats?.unassigned > 0
                                ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                            <RiAlertLine className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-2xl font-black ${
                            stats?.unassigned > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-zinc-50'
                        }`}>
                            {stats?.unassigned || 0}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">unallocated staff</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                        {stats?.unassigned > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                                ● Ready for AI Match & Issue
                            </span>
                        ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <RiCheckboxCircleLine className="w-3.5 h-3.5" /> 100% staff equipped
                            </span>
                        )}
                    </div>
                </div>

                {/* 4. Role Profiles Configured */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Role Profiles</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <RiUserStarLine className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats?.with_profile || 0}</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">mapped workloads</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                        <span>Objective fit scoring active</span>
                    </div>
                </div>
            </div>

            {/* 2. Advanced Filter & Search Bar */}
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
                                placeholder="Search staff, department, role, or hardware..."
                                className="w-full text-xs font-medium pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                            />
                        </div>

                        {/* Hardware Status Filter */}
                        <div className="lg:col-span-3">
                            <select
                                value={hardwareStatus}
                                onChange={(e) => setHardwareStatus(e.target.value)}
                                className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                            >
                                <option value="">All Allocation Statuses</option>
                                <option value="assigned">Equipped (Assigned)</option>
                                <option value="unassigned">Needs Device (Unassigned)</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div className="lg:col-span-3">
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Role Profile Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={roleProfileId}
                                onChange={(e) => setRoleProfileId(e.target.value)}
                                className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                            >
                                <option value="">All Role Profiles</option>
                                {role_profiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                        <div className="text-slate-500 dark:text-zinc-400 text-[11px]">
                            {activeFilterCount > 0 ? (
                                <span>
                                    Filtering by <strong className="text-slate-800 dark:text-zinc-200">{activeFilterCount}</strong> active criteria
                                </span>
                            ) : (
                                <span>Showing all staff records</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                type="submit"
                                className="py-1.5 px-4 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                                <RiFilter3Line className="w-3.5 h-3.5" />
                                <span>Apply Filters</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div ref={tableContainerRef} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-visible">
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
                                filters?.sort === 'created_at'
                                    ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                            }`}
                            title="Sort employees chronologically by registration date"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Sort Chronologically {filters?.sort === 'created_at' ? (filters?.direction === 'desc' ? '(Newest)' : '(Oldest)') : ''}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setWrapText(!wrapText)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                wrapText
                                    ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                            }`}
                            title="Toggle text wrapping to reveal long employee info without truncation"
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

                <div className="overflow-x-auto min-h-[340px]">
                    <table
                        className="w-full text-left text-sm table-fixed"
                        style={{ minWidth: `${Math.max(900, Object.values(widths).reduce((a, b) => a + b, 0))}px` }}
                    >
                        <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-slate-500 dark:text-zinc-400">
                            <tr>
                                <ResizableTh
                                    colKey="employee"
                                    sortKey="name"
                                    currentSort={filters?.sort || 'name'}
                                    sortDirection={filters?.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.employee}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'employee'}
                                >
                                    Employee
                                </ResizableTh>
                                <ResizableTh
                                    colKey="department"
                                    sortKey="department"
                                    currentSort={filters?.sort || 'name'}
                                    sortDirection={filters?.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.department}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'department'}
                                >
                                    Department
                                </ResizableTh>
                                <ResizableTh
                                    colKey="role_profile"
                                    sortKey="role_profile"
                                    currentSort={filters?.sort || 'name'}
                                    sortDirection={filters?.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.role_profile}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'role_profile'}
                                >
                                    Role Profile
                                </ResizableTh>
                                <ResizableTh
                                    colKey="hardware"
                                    sortKey="hardware"
                                    currentSort={filters?.sort || 'name'}
                                    sortDirection={filters?.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.hardware}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'hardware'}
                                >
                                    Assigned Hardware
                                </ResizableTh>
                                <ResizableTh
                                    colKey="specs"
                                    sortKey="specs"
                                    currentSort={filters?.sort || 'name'}
                                    sortDirection={filters?.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.specs}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'specs'}
                                >
                                    Device Specs
                                </ResizableTh>
                                <ResizableTh
                                    colKey="date"
                                    sortKey="created_at"
                                    currentSort={filters?.sort || 'name'}
                                    sortDirection={filters?.direction || 'asc'}
                                    onSort={handleSort}
                                    width={widths.date}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'date'}
                                >
                                    Registered
                                </ResizableTh>
                                <ResizableTh
                                    colKey="actions"
                                    width={widths.actions}
                                    onResizeStart={startResize}
                                    onAutoExpand={autoExpandCol}
                                    isResizing={resizingCol === 'actions'}
                                    align="right"
                                    resizable={false}
                                >
                                    Actions
                                </ResizableTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {employeeList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-slate-500 dark:text-zinc-400">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <p className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">No employees found</p>
                                            <p className="text-xs text-slate-400 dark:text-zinc-500">
                                                {search ? `No staff matching "${search}". Try another keyword or clear filters.` : 'Start by adding your first employee to the directory.'}
                                            </p>
                                            {search && (
                                                <button
                                                    type="button"
                                                    onClick={clearSearch}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#026eff] hover:underline pt-1 cursor-pointer"
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employeeList.map((emp, index) => {
                                    const device = emp.active_assignment?.device;
                                    const avatarSrc =
                                        emp.profile_picture_url ||
                                        (emp.profile_picture?.startsWith('public/')
                                            ? `/${emp.profile_picture.slice(7)}`
                                            : emp.profile_picture || '/user/default-profile-picture.png');

                                    const isMenuOpen = openMenuId === emp.id;
                                    const isNearBottom = index >= employeeList.length - 2 && employeeList.length > 2;

                                    const actions = [
                                        {
                                            label: device ? 'Reassign' : 'Match Device',
                                            menuLabel: device ? 'Reassign Hardware' : 'Match Device',
                                            href: route('match.index', { employee_id: emp.id }),
                                            icon: device ? RiExchangeLine : RiArrowRightLine,
                                            variant: 'primary',
                                        },
                                        ...(device
                                            ? [
                                                  {
                                                      label: 'Unassign',
                                                      menuLabel: 'Unassign Hardware',
                                                      onClick: () => handleUnassign(emp),
                                                      icon: RiCloseCircleLine,
                                                      variant: 'danger',
                                                  },
                                              ]
                                            : []),
                                        {
                                            label: 'Edit',
                                            menuLabel: 'Edit Employee',
                                            onClick: () => openEdit(emp),
                                            icon: RiEditLine,
                                            variant: 'default',
                                        },
                                    ];

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                                            {/* Employee Profile & Avatar */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 shadow-2xs">
                                                        <img
                                                            src={avatarSrc}
                                                            alt={emp.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/user/default-profile-picture.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className={`font-semibold text-slate-900 dark:text-zinc-100 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={emp.name}>
                                                            {emp.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                                            ID #{emp.id.toString().padStart(4, '0')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">
                                                <div className={wrapText ? 'break-words whitespace-normal' : 'truncate'} title={emp.department}>
                                                    {emp.department}
                                                </div>
                                            </td>

                                            {/* Role Profile */}
                                            <td className="py-3 px-4">
                                                {emp.role_profile ? (
                                                    <span className={`text-xs px-2.5 py-1 rounded-full bg-[#026eff]/10 dark:bg-[#031a40]/60 border border-[#026eff]/15 dark:border-[#031a40]/50 text-[#026eff] dark:text-[#0b79ff] font-medium inline-block ${wrapText ? 'break-words whitespace-normal' : 'truncate max-w-full'}`} title={emp.role_profile.name}>
                                                        {emp.role_profile.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-zinc-500 italic">No Profile Assigned</span>
                                                )}
                                            </td>

                                            {/* Assigned Hardware */}
                                            <td className="py-3 px-4">
                                                {device ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                            <HardwareImage
                                                                src={device.image_clip_url || device.image_url}
                                                                alt={device.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 inline-block truncate" title={device.asset_tag}>
                                                                {device.asset_tag}
                                                            </span>
                                                            <div className={`font-medium text-slate-900 dark:text-zinc-100 text-xs mt-1 ${wrapText ? 'break-words whitespace-normal' : 'truncate'}`} title={`${device.brand} ${device.model}`}>
                                                                {device.brand} {device.model}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded inline-block">
                                                        No Device Assigned
                                                    </span>
                                                )}
                                            </td>

                                            {/* Device Specs */}
                                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-zinc-400">
                                                {device ? (
                                                    <div className={wrapText ? 'break-words whitespace-normal leading-relaxed' : 'truncate'} title={`${device.ram_gb}GB • ${device.storage_gb}GB ${device.storage_type} • ${device.device_type}`}>
                                                        {device.ram_gb}GB • {device.storage_gb}GB {device.storage_type} • <span className="capitalize">{device.device_type}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-zinc-600">—</span>
                                                )}
                                            </td>

                                            {/* Chronological Registration Date */}
                                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                                <div className="font-medium text-slate-700 dark:text-zinc-300">
                                                    {emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                                    {emp.created_at ? new Date(emp.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                {actions.length >= 2 ? (
                                                    <div className="relative inline-flex items-center justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(isMenuOpen ? null : emp.id);
                                                            }}
                                                            className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border transition cursor-pointer ${
                                                                isMenuOpen
                                                                    ? 'bg-[#026eff]/10 border-[#026eff]/30 text-[#026eff] dark:bg-[#026eff]/20 dark:text-[#0b79ff]'
                                                                    : 'bg-white dark:bg-zinc-800/90 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-700/60 shadow-2xs'
                                                            }`}
                                                            title="More Actions"
                                                            aria-label="More Actions"
                                                            aria-expanded={isMenuOpen}
                                                        >
                                                            <RiMoreFill className="w-4 h-4" />
                                                        </button>

                                                        {isMenuOpen && (
                                                            <div
                                                                className={`absolute right-0 z-50 w-48 py-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/90 dark:border-zinc-800 shadow-xl ring-1 ring-black/5 dark:ring-white/5 ${
                                                                    isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                                                }`}
                                                            >
                                                                <div className="px-3 py-1 border-b border-slate-100 dark:border-zinc-800/80 mb-1 flex items-center justify-between">
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                                                        Available Actions
                                                                    </span>
                                                                    <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">
                                                                        #{emp.id.toString().padStart(4, '0')}
                                                                    </span>
                                                                </div>

                                                                <div className="p-1 space-y-0.5">
                                                                    {actions.map((act, actIdx) =>
                                                                        act.href ? (
                                                                            <Link
                                                                                key={actIdx}
                                                                                href={act.href}
                                                                                onClick={() => setOpenMenuId(null)}
                                                                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg text-[#026eff] dark:text-[#0b79ff] hover:bg-[#026eff]/10 dark:hover:bg-[#026eff]/20 transition text-left"
                                                                            >
                                                                                <act.icon className="w-3.5 h-3.5 shrink-0" />
                                                                                <span>{act.menuLabel || act.label}</span>
                                                                            </Link>
                                                                        ) : (
                                                                            <button
                                                                                key={actIdx}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setOpenMenuId(null);
                                                                                    act.onClick();
                                                                                }}
                                                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg transition text-left cursor-pointer ${
                                                                                    act.variant === 'danger'
                                                                                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                                                                        : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                                                                }`}
                                                                            >
                                                                                <act.icon className={`w-3.5 h-3.5 shrink-0 ${act.variant === 'danger' ? 'text-rose-500' : 'text-slate-400 dark:text-zinc-400'}`} />
                                                                                <span>{act.menuLabel || act.label}</span>
                                                                            </button>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                                        {actions.map((act, actIdx) =>
                                                            act.href ? (
                                                                <Link
                                                                    key={actIdx}
                                                                    href={act.href}
                                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#026eff] dark:text-[#0b79ff] hover:text-[#0256cc] dark:hover:text-[#3894ff] px-2.5 py-1 rounded-lg hover:bg-[#026eff]/10 dark:hover:bg-[#026eff]/20 transition shrink-0 whitespace-nowrap"
                                                                >
                                                                    <span>{act.label}</span>
                                                                    <span aria-hidden="true">&rarr;</span>
                                                                </Link>
                                                            ) : (
                                                                <button
                                                                    key={actIdx}
                                                                    type="button"
                                                                    onClick={act.onClick}
                                                                    className={`text-xs font-medium px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 whitespace-nowrap ${
                                                                        act.variant === 'danger'
                                                                            ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                                                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                                                    }`}
                                                                >
                                                                    {act.label}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Bar */}
            {employees.links && employees.links.length > 3 && (
                <div className="mt-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="text-slate-500 dark:text-zinc-400">
                        Showing <span className="font-semibold text-slate-900 dark:text-zinc-100">{employees.from}</span> to <span className="font-semibold text-slate-900 dark:text-zinc-100">{employees.to}</span> of <span className="font-semibold text-slate-900 dark:text-zinc-100">{employees.total}</span> staff members
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {employees.links.map((link, idx) => (
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                {editingEmp ? 'Edit Employee' : 'Add Employee'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold cursor-pointer">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Full Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Maya Lin"
                                    className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Department *</label>
                                <input
                                    type="text"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    placeholder="e.g. Engineering, Design, Finance"
                                    className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                    required
                                />
                                {errors.department && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.department}</p>}
                            </div>

                            {/* Profile Picture Upload & Preview */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1.5">Profile Picture</label>
                                
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-800 shrink-0 shadow-sm">
                                        <img
                                            src={
                                                filePreview ||
                                                (data.profile_picture?.startsWith('public/')
                                                    ? `/${data.profile_picture.slice(7)}`
                                                    : data.profile_picture || '/user/default-profile-picture.png')
                                            }
                                            alt="Avatar Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/user/default-profile-picture.png';
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="employee-avatar-upload"
                                        />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer shadow-2xs"
                                            >
                                                <svg className="w-3.5 h-3.5 text-[#026eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{data.profile_picture_file ? 'Change Photo' : 'Upload Photo'}</span>
                                            </button>

                                            {(data.profile_picture_file || (data.profile_picture && data.profile_picture !== 'public/user/default-profile-picture.png')) && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearPhoto}
                                                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                                                >
                                                    Use Default
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 truncate">
                                            {data.profile_picture_file
                                                ? `${data.profile_picture_file.name} (${(data.profile_picture_file.size / 1024).toFixed(1)} KB)`
                                                : 'PNG, JPG, WEBP up to 5MB. Defaults to corporate icon.'}
                                        </p>
                                    </div>
                                </div>
                                {errors.profile_picture_file && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.profile_picture_file}</p>}
                                {errors.profile_picture && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.profile_picture}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Role / Workload Profile</label>
                                <select
                                    value={data.role_profile_id}
                                    onChange={(e) => setData('role_profile_id', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                >
                                    <option value="">No Profile Assigned</option>
                                    {role_profiles.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Notes</label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Special requirements or location..."
                                    className="mt-1 w-full rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-sm py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-[#026eff] text-white text-xs font-semibold hover:bg-[#0256cc] shadow-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {editingEmp ? 'Save Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
