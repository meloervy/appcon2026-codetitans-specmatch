import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import ResizableTh from '@/Components/ResizableTh';
import { useResizableColumns } from '@/Hooks/useResizableColumns';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function EmployeesIndex({ employees, role_profiles }) {
    const [showModal, setShowModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [wrapText, setWrapText] = useState(false);

    const initialWidths = {
        employee: 170,
        department: 140,
        role_profile: 160,
        hardware: 240,
        specs: 220,
        actions: 160,
    };

    const { widths, startResize, autoExpandCol, resetWidths, isResizing, resizingCol } = useResizableColumns(initialWidths, 'employees_table');

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        department: '',
        role_profile_id: '',
        notes: '',
    });

    const { post: postUnassign } = useForm();

    const openCreate = () => {
        setEditingEmp(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (emp) => {
        setEditingEmp(emp);
        setData({
            name: emp.name,
            department: emp.department,
            role_profile_id: emp.role_profile_id || '',
            notes: emp.notes || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEmp) {
            put(route('employees.update', editingEmp.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('employees.store'), {
                onSuccess: () => setShowModal(false),
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
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">Company Staff Directory</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Staff profiles, role templates, and currently issued hardware.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#026eff] text-sm font-semibold text-white hover:bg-[#0256cc] shadow-sm transition self-start sm:self-auto"
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
                        <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            <tr>
                                <ResizableTh colKey="employee" width={widths.employee} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'employee'}>Employee</ResizableTh>
                                <ResizableTh colKey="department" width={widths.department} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'department'}>Department</ResizableTh>
                                <ResizableTh colKey="role_profile" width={widths.role_profile} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'role_profile'}>Role Profile</ResizableTh>
                                <ResizableTh colKey="hardware" width={widths.hardware} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'hardware'}>Assigned Hardware</ResizableTh>
                                <ResizableTh colKey="specs" width={widths.specs} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'specs'}>Device Specs</ResizableTh>
                                <ResizableTh colKey="actions" width={widths.actions} onResizeStart={startResize} onAutoExpand={autoExpandCol} isResizing={resizingCol === 'actions'} align="right" resizable={false}>Actions</ResizableTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {employees.map((emp) => {
                                const device = emp.active_assignment?.device;
                                return (
                                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                                        <td className="py-4 px-4 font-semibold text-slate-900 dark:text-zinc-100">
                                            <div className={wrapText ? 'break-words whitespace-normal' : 'truncate'} title={emp.name}>
                                                {emp.name}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 dark:text-zinc-400">
                                            <div className={wrapText ? 'break-words whitespace-normal' : 'truncate'} title={emp.department}>
                                                {emp.department}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {emp.role_profile ? (
                                                <span className={`text-xs px-2.5 py-1 rounded-full bg-[#026eff]/10 dark:bg-[#031a40]/60 border border-[#026eff]/15 dark:border-[#031a40]/50 text-[#026eff] dark:text-[#0b79ff] font-medium inline-block ${wrapText ? 'break-words whitespace-normal' : 'truncate max-w-full'}`} title={emp.role_profile.name}>
                                                    {emp.role_profile.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-zinc-500 italic">No Profile Assigned</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            {device ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                        <HardwareImage
                                                            src={device.image_clip_url || device.image_url}
                                                            alt={device.name}
                                                            className="w-full h-full object-contain"
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
                                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-zinc-400">
                                            {device ? (
                                                <div className={wrapText ? 'break-words whitespace-normal leading-relaxed' : 'truncate'} title={`${device.ram_gb}GB • ${device.storage_gb}GB ${device.storage_type} • ${device.device_type}`}>
                                                    {device.ram_gb}GB • {device.storage_gb}GB {device.storage_type} • <span className="capitalize">{device.device_type}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-zinc-600">—</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right space-x-2">
                                            <Link
                                                href={route('match.index', { employee_id: emp.id })}
                                                className="inline-flex items-center text-xs font-bold text-[#026eff] dark:text-[#0b79ff] hover:text-[#026eff] dark:hover:text-[#0b79ff]"
                                            >
                                                {device ? 'Reassign' : 'Match Device'} &rarr;
                                            </Link>
                                            {device && (
                                                <button
                                                    onClick={() => handleUnassign(emp)}
                                                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium cursor-pointer"
                                                >
                                                    Unassign
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEdit(emp)}
                                                className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                                            >
                                                Edit
                                            </button>
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
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold">
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
                                    className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
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
                                    className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
                                    required
                                />
                                {errors.department && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.department}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">Role / Workload Profile</label>
                                <select
                                    value={data.role_profile_id}
                                    onChange={(e) => setData('role_profile_id', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-[#026eff]"
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
                                    className="px-5 py-2 rounded-xl bg-[#026eff] text-white text-xs font-semibold hover:bg-[#0256cc] shadow-sm transition disabled:opacity-50"
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
