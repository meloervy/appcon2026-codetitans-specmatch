import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import ResizableTh from '@/Components/ResizableTh';
import { useResizableColumns } from '@/Hooks/useResizableColumns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useRef, useState } from 'react';

export default function EmployeesIndex({ employees, role_profiles }) {
    const [showModal, setShowModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [wrapText, setWrapText] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Offboarding & Asset Reclamation State
    const [offboardingEmp, setOffboardingEmp] = useState(null);
    const [showOffboardModal, setShowOffboardModal] = useState(false);
    const [offboardForm, setOffboardForm] = useState({
        reason: 'resignation',
        condition: 'good',
        wipe_confirmed: true,
        notes: '',
    });
    const [isOffboarding, setIsOffboarding] = useState(false);
    const [circulationData, setCirculationData] = useState(null);
    const [showCirculationModal, setShowCirculationModal] = useState(false);

    const initialWidths = {
        employee: 210,
        department: 140,
        role_profile: 160,
        hardware: 220,
        specs: 190,
        date: 130,
        actions: 230,
    };

    const { widths, startResize, autoExpandCol, resetWidths, isResizing, resizingCol } = useResizableColumns(initialWidths, 'employees_table_v3');

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        department: '',
        role_profile_id: '',
        profile_picture: '',
        profile_picture_file: null,
        notes: '',
    });

    const { post: postUnassign } = useForm();

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedEmployees = useMemo(() => {
        const list = [...employees];
        const { key, direction } = sortConfig;
        const modifier = direction === 'asc' ? 1 : -1;

        return list.sort((a, b) => {
            let valA, valB;
            switch (key) {
                case 'name':
                case 'employee':
                    valA = (a.name || '').toLowerCase();
                    valB = (b.name || '').toLowerCase();
                    return valA.localeCompare(valB) * modifier;
                case 'department':
                    valA = (a.department || '').toLowerCase();
                    valB = (b.department || '').toLowerCase();
                    return valA.localeCompare(valB) * modifier;
                case 'role_profile':
                    valA = (a.role_profile?.name || '').toLowerCase();
                    valB = (b.role_profile?.name || '').toLowerCase();
                    return valA.localeCompare(valB) * modifier;
                case 'hardware':
                    valA = (a.active_assignment?.device?.brand ? `${a.active_assignment.device.brand} ${a.active_assignment.device.model}` : '').toLowerCase();
                    valB = (b.active_assignment?.device?.brand ? `${b.active_assignment.device.brand} ${b.active_assignment.device.model}` : '').toLowerCase();
                    return valA.localeCompare(valB) * modifier;
                case 'specs':
                    valA = a.active_assignment?.device?.ram_gb || 0;
                    valB = b.active_assignment?.device?.ram_gb || 0;
                    return (valA - valB) * modifier;
                case 'created_at':
                case 'date':
                    valA = new Date(a.created_at || 0).getTime();
                    valB = new Date(b.created_at || 0).getTime();
                    return (valA - valB) * modifier;
                default:
                    return 0;
            }
        });
    }, [employees, sortConfig]);

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

    const handleOpenOffboard = (emp) => {
        setOffboardingEmp(emp);
        setOffboardForm({
            reason: 'resignation',
            condition: emp.active_assignment?.device?.condition || 'good',
            wipe_confirmed: true,
            notes: '',
        });
        setShowOffboardModal(true);
    };

    const handleConfirmOffboard = async (e) => {
        e?.preventDefault();
        if (!offboardingEmp) return;
        setIsOffboarding(true);
        try {
            const res = await axios.post(route('employees.offboard', offboardingEmp.id), offboardForm);
            setShowOffboardModal(false);
            if (res.data.circulation_matches && res.data.circulation_matches.length > 0) {
                setCirculationData(res.data);
                setShowCirculationModal(true);
            } else {
                router.reload();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to offboard employee.');
        } finally {
            setIsOffboarding(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">Company Staff Directory</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                            Staff profiles, role templates, and currently issued hardware.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#026eff] text-sm font-semibold text-white hover:bg-[#0256cc] shadow-sm transition self-start sm:self-auto cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Employee
                    </button>
                </div>
            }
        >
            <Head title="Employees - SpecMatch" />

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
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
                                sortConfig.key === 'created_at'
                                    ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-750 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
                            }`}
                            title="Sort employees chronologically by registration date"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Sort Chronologically {sortConfig.key === 'created_at' ? (sortConfig.direction === 'desc' ? '(Newest)' : '(Oldest)') : ''}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setWrapText(!wrapText)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                wrapText
                                    ? 'bg-[#026eff]/15 text-[#026eff] border-[#026eff]/30 dark:bg-[#026eff]/20 dark:text-sky-300'
                                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-750 hover:bg-slate-50 dark:hover:bg-zinc-700/60'
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
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                            title="Reset column widths to default"
                        >
                            Reset Columns
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table
                        className="w-full text-left text-sm table-fixed"
                        style={{ minWidth: `${Math.max(900, Object.values(widths).reduce((a, b) => a + b, 0))}px` }}
                    >
                        <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-slate-500 dark:text-zinc-400">
                            <tr>
                                <ResizableTh
                                    colKey="employee"
                                    sortKey="name"
                                    currentSort={sortConfig.key}
                                    sortDirection={sortConfig.direction}
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
                                    currentSort={sortConfig.key}
                                    sortDirection={sortConfig.direction}
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
                                    currentSort={sortConfig.key}
                                    sortDirection={sortConfig.direction}
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
                                    currentSort={sortConfig.key}
                                    sortDirection={sortConfig.direction}
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
                                    currentSort={sortConfig.key}
                                    sortDirection={sortConfig.direction}
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
                                    currentSort={sortConfig.key}
                                    sortDirection={sortConfig.direction}
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
                            {sortedEmployees.map((emp) => {
                                const device = emp.active_assignment?.device;
                                const avatarSrc =
                                    emp.profile_picture_url ||
                                    (emp.profile_picture?.startsWith('public/')
                                        ? `/${emp.profile_picture.slice(7)}`
                                        : emp.profile_picture || '/user/default-profile-picture.png');

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
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                                <Link
                                                    href={route('match.index', { employee_id: emp.id })}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#026eff] dark:text-[#0b79ff] hover:text-[#0256cc] dark:hover:text-[#3894ff] px-2 py-1 rounded-lg hover:bg-[#026eff]/10 dark:hover:bg-[#026eff]/20 transition shrink-0 whitespace-nowrap"
                                                >
                                                    <span>{device ? 'Reassign' : 'Match Device'}</span>
                                                    <span aria-hidden="true">&rarr;</span>
                                                </Link>
                                                {device && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenOffboard(emp)}
                                                            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition cursor-pointer shrink-0 whitespace-nowrap"
                                                            title="Offboard employee and reclaim sanitized asset to pool"
                                                        >
                                                            Reclaim
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnassign(emp)}
                                                            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0 whitespace-nowrap"
                                                        >
                                                            Unassign
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(emp)}
                                                    className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0 whitespace-nowrap"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 transition cursor-pointer shadow-2xs"
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
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-750 transition cursor-pointer"
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

            {/* Offboard & Asset Reclamation Modal */}
            {showOffboardModal && offboardingEmp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                    Lifecycle State Transition
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                    Offboard Staff &amp; Reclaim Hardware
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Returns asset to stockroom pool in Reclaimed status with automatic recirculation matching.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOffboardModal(false)}
                                disabled={isOffboarding}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Staff & Asset Overview Card */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3 text-xs">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">Departing Employee</span>
                                <div className="font-bold text-slate-900 dark:text-zinc-100">{offboardingEmp.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{offboardingEmp.department} &bull; {offboardingEmp.role_profile?.name || 'General Staff'}</div>
                            </div>
                            {offboardingEmp.active_assignment?.device && (
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">Reclaimed Asset</span>
                                    <div className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                                        {offboardingEmp.active_assignment.device.asset_tag}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                                        {offboardingEmp.active_assignment.device.brand} {offboardingEmp.active_assignment.device.model}
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleConfirmOffboard} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                        Trigger Reason *
                                    </label>
                                    <select
                                        value={offboardForm.reason}
                                        onChange={(e) => setOffboardForm({ ...offboardForm, reason: e.target.value })}
                                        className="w-full text-xs rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2 px-3 focus:border-[#026eff] shadow-2xs"
                                    >
                                        <option value="resignation">Resignation / Departure</option>
                                        <option value="role_transition">Internal Role Transition</option>
                                        <option value="hardware_upgrade">Hardware Upgrade / Refresh</option>
                                        <option value="contract_end">Contract Conclusion</option>
                                        <option value="other">Other Administrative Reclamation</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                        Inspected Condition *
                                    </label>
                                    <select
                                        value={offboardForm.condition}
                                        onChange={(e) => setOffboardForm({ ...offboardForm, condition: e.target.value })}
                                        className="w-full text-xs rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2 px-3 focus:border-[#026eff] shadow-2xs capitalize"
                                    >
                                        <option value="excellent">Excellent (Like New)</option>
                                        <option value="good">Good (Normal Wear)</option>
                                        <option value="fair">Fair (Usable, Minor Scuffs)</option>
                                        <option value="needs_repair">Needs Repair (Move to Maintenance)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Data Sanitization Verification Checkbox */}
                            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={offboardForm.wipe_confirmed}
                                        onChange={(e) => setOffboardForm({ ...offboardForm, wipe_confirmed: e.target.checked })}
                                        className="rounded border-teal-400 text-teal-600 focus:ring-teal-500 mt-0.5"
                                        required
                                    />
                                    <div className="text-xs">
                                        <span className="font-bold text-teal-950 dark:text-teal-200 block">
                                            Confirm Data Wipe &amp; Sanitization
                                        </span>
                                        <span className="text-[11px] text-teal-800 dark:text-teal-300/90 leading-tight block mt-0.5">
                                            NIST SP 800-88 compliant factory reset executed. No company credentials or confidential user data remain on storage.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                    Reclamation Notes / Accessories Returned
                                </label>
                                <textarea
                                    rows={2}
                                    value={offboardForm.notes}
                                    onChange={(e) => setOffboardForm({ ...offboardForm, notes: e.target.value })}
                                    placeholder="Power adapter returned, external peripherals inspected, physical asset condition..."
                                    className="w-full text-xs rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2 px-3 focus:border-[#026eff] shadow-2xs resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowOffboardModal(false)}
                                    disabled={isOffboarding}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isOffboarding || !offboardForm.wipe_confirmed}
                                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                    {isOffboarding ? 'Processing Reclamation...' : 'Confirm Offboard & Reclaim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recirculation Opportunities Modal (Immediate Re-circulation Matching) */}
            {showCirculationModal && circulationData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 mb-1.5">
                                    ⚡ Asset Returned to Pool
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                    Immediate Recirculation Opportunities ({circulationData.circulation_matches?.length || 0})
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Device <strong>{circulationData.device?.asset_tag}</strong> ({circulationData.device?.brand} {circulationData.device?.model}) is sanitized. The matching engine identified open candidate needs that this asset satisfies:
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCirculationModal(false);
                                    router.reload();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Candidates List */}
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            {circulationData.circulation_matches.map((match, mIdx) => (
                                <div
                                    key={match.employee.id}
                                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between gap-3 hover:border-teal-500/40 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-black shrink-0">
                                            #{mIdx + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate">
                                                    {match.employee.name}
                                                </h4>
                                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                                                    ({match.employee.department})
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">
                                                Role: {match.employee.role_profile?.name || 'General Staff'} &bull; <span className="text-teal-600 dark:text-teal-400 font-semibold">{match.status}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                                                Deficit Context: {match.previous_deficit}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right">
                                            <div className="text-xs font-black text-slate-900 dark:text-zinc-100">
                                                {Math.round(match.score * 100)}%
                                            </div>
                                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#0aceb3]/20 text-[#0aceb3]">
                                                {match.fit_grade}
                                            </span>
                                        </div>
                                        <Link
                                            href={route('match.index', { employee_id: match.employee.id })}
                                            className="px-3 py-1.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold shadow-2xs transition"
                                        >
                                            Deploy Asset &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                                Asset will remain staged in pool until deployed.
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCirculationModal(false);
                                    router.reload();
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
                            >
                                Keep in Stockroom Pool
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
