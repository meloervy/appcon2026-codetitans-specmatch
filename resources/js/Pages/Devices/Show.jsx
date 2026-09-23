import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function DevicesShow({ device }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showLifecycleModal, setShowLifecycleModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [selectedLogToUpdate, setSelectedLogToUpdate] = useState(null);

    // Edit Device Specs Form
    const { data: editData, setData: setEditData, put: putUpdate, processing: updateProcessing } = useForm({
        asset_tag: device.asset_tag,
        serial_number: device.serial_number || '',
        barcode: device.barcode || '',
        techspecs_id: device.techspecs_id || '',
        device_type: device.device_type,
        brand: device.brand,
        model: device.model,
        location: device.location || '',
        cpu: device.cpu,
        cpu_tier: device.cpu_tier,
        ram_gb: device.ram_gb,
        storage_type: device.storage_type,
        storage_gb: device.storage_gb,
        gpu: device.gpu || '',
        gpu_tier: device.gpu_tier,
        year_acquired: device.year_acquired,
        purchase_cost: device.purchase_cost || '',
        purchase_date: device.purchase_date || '',
        depreciation_rate_percent: device.depreciation_rate_percent || 20.0,
        vendor: device.vendor || '',
        warranty_start: device.warranty_start || '',
        warranty_expiry: device.warranty_expiry || '',
        contract_sla: device.contract_sla || '',
        condition: device.condition,
        status: device.status,
        lifecycle_stage: device.lifecycle_stage,
        notes: device.notes || '',
    });

    // Lifecycle Transition Form
    const { data: lifecycleData, setData: setLifecycleData, post: postLifecycle, processing: lifecycleProcessing, reset: resetLifecycle } = useForm({
        to_stage: device.lifecycle_stage,
        notes: '',
    });

    // Log Maintenance Form
    const { data: maintData, setData: setMaintData, post: postMaintenance, processing: maintProcessing, reset: resetMaintenance } = useForm({
        type: 'repair',
        title: '',
        description: '',
        cost: 0,
        performed_by: '',
        started_at: new Date().toISOString().split('T')[0],
        completed_at: '',
        performance_assessment: '',
        status: 'in_progress',
        send_to_maintenance_stage: true,
    });

    // Update Maintenance Log Form
    const { data: updateMaintData, setData: setUpdateMaintData, put: putMaintenanceLog, processing: updateMaintProcessing } = useForm({
        cost: 0,
        completed_at: new Date().toISOString().split('T')[0],
        performance_assessment: '',
        status: 'completed',
        restore_to_available: true,
    });

    const { post: postRetire } = useForm();

    const handleUpdate = (e) => {
        e.preventDefault();
        putUpdate(route('devices.update', device.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleLifecycleTransition = (e) => {
        e.preventDefault();
        postLifecycle(route('devices.lifecycle.update', device.id), {
            onSuccess: () => {
                setShowLifecycleModal(false);
                resetLifecycle();
            },
        });
    };

    const handleCreateMaintenance = (e) => {
        e.preventDefault();
        postMaintenance(route('devices.maintenance.store', device.id), {
            onSuccess: () => {
                setShowMaintenanceModal(false);
                resetMaintenance();
            },
        });
    };

    const handleOpenUpdateLog = (log) => {
        setSelectedLogToUpdate(log);
        setUpdateMaintData({
            cost: log.cost || 0,
            completed_at: log.completed_at || new Date().toISOString().split('T')[0],
            performance_assessment: log.performance_assessment || '',
            status: 'completed',
            restore_to_available: true,
        });
    };

    const handleUpdateMaintenanceLog = (e) => {
        e.preventDefault();
        if (!selectedLogToUpdate) return;
        putMaintenanceLog(route('maintenance.update', selectedLogToUpdate.id), {
            onSuccess: () => {
                setSelectedLogToUpdate(null);
            },
        });
    };

    const handleRetire = () => {
        if (confirm(`Are you sure you want to decommission and retire ${device.asset_tag}? This will release any active employee assignment and move asset to Retirement stage.`)) {
            postRetire(route('devices.retire', device.id));
        }
    };

    // Lifecycle Stage Definition
    const stages = [
        { key: 'acquisition', label: '1. Acquisition', desc: 'Procurement & Staging' },
        { key: 'deployment', label: '2. Deployment', desc: 'Active Fleet Production' },
        { key: 'maintenance', label: '3. Maintenance', desc: 'Repairs & Servicing' },
        { key: 'retirement', label: '4. Retirement', desc: 'Decommissioned / EOL' },
    ];

    const currentStageIndex = stages.findIndex((s) => s.key === device.lifecycle_stage);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xl font-bold bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                            {device.asset_tag}
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900">{device.brand} {device.model}</h1>
                                {device.techspecs_id && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        TechSpecs Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 capitalize mt-0.5">
                                {device.device_type} &bull; {device.location ? `📍 ${device.location}` : 'No Location Set'} &bull; S/N: {device.serial_number || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('devices.index')}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                            &larr; Back
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowMaintenanceModal(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Log Servicing
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLifecycleModal(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                            Stage Transition
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Asset'}
                        </button>
                        {device.status !== 'retired' && (
                            <button
                                type="button"
                                onClick={handleRetire}
                                className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                            >
                                Retire
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${device.asset_tag} - ITAM Details`} />

            <div className="space-y-6">
                {/* 1. Visual Lifecycle Stage Progression Stepper */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">IT Asset Lifecycle Management</span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">Current Phase: <span className="text-indigo-600 capitalize">{device.lifecycle_stage}</span></h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowLifecycleModal(true)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            Transition Stage &rarr;
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stages.map((stage, idx) => {
                            const isCurrent = stage.key === device.lifecycle_stage;
                            const isPast = currentStageIndex > idx;
                            return (
                                <div
                                    key={stage.key}
                                    className={`relative p-4 rounded-xl border transition ${
                                        isCurrent
                                            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                                            : isPast
                                            ? 'bg-emerald-50/40 border-emerald-200'
                                            : 'bg-slate-50/60 border-slate-200 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                            isCurrent ? 'text-indigo-700' : isPast ? 'text-emerald-700' : 'text-slate-400'
                                        }`}>
                                            Stage {idx + 1}
                                        </span>
                                        {isCurrent && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                            </span>
                                        )}
                                        {isPast && (
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="font-bold text-sm text-slate-900">{stage.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{stage.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: ITAM Financials, Hardware Profile, Maintenance Logs, and Audit History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Continuous Tracking: Financial & Contractual Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                                <span>Financial & Contractual Tracking</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                    device.warranty_status === 'Active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : device.warranty_status === 'Expiring Soon'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                }`}>
                                    Warranty: {device.warranty_status}
                                </span>
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <dt className="text-[11px] font-semibold text-slate-400 uppercase">Purchase Cost</dt>
                                    <dd className="text-lg font-bold text-slate-900 mt-1">
                                        ${Number(device.purchase_cost || 1200).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </dd>
                                    <span className="text-[11px] text-slate-400">
                                        {device.purchase_date ? `Purchased: ${device.purchase_date}` : `Acquired: ${device.year_acquired}`}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <dt className="text-[11px] font-semibold text-slate-400 uppercase">Current Book Value</dt>
                                    <dd className="text-lg font-bold text-emerald-600 mt-1">
                                        ${Number(device.current_book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </dd>
                                    <span className="text-[11px] text-slate-400">
                                        Depr: {device.depreciation_rate_percent || 20}%/yr
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <dt className="text-[11px] font-semibold text-slate-400 uppercase">Vendor / Supplier</dt>
                                    <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
                                        {device.vendor || 'Direct OEM'}
                                    </dd>
                                    <span className="text-[11px] text-slate-400 truncate block">
                                        {device.barcode ? `BC: ${device.barcode}` : 'Barcode N/A'}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <dt className="text-[11px] font-semibold text-slate-400 uppercase">Warranty Expiry</dt>
                                    <dd className="text-sm font-bold text-slate-900 mt-1">
                                        {device.warranty_expiry || 'Not Recorded'}
                                    </dd>
                                    <span className="text-[11px] text-slate-400">
                                        {device.days_until_warranty_expiry !== null
                                            ? device.days_until_warranty_expiry > 0
                                                ? `${device.days_until_warranty_expiry} days remaining`
                                                : `${Math.abs(device.days_until_warranty_expiry)} days ago`
                                            : 'No date'}
                                    </span>
                                </div>
                            </div>

                            {device.contract_sla && (
                                <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs flex items-center justify-between text-indigo-900">
                                    <div>
                                        <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] mr-2">SLA Coverage</span>
                                        <span className="font-semibold">{device.contract_sla}</span>
                                    </div>
                                    <span className="text-[11px] text-indigo-600 font-medium">Enterprise Contract</span>
                                </div>
                            )}
                        </div>

                        {/* Hardware Profile Specs */}
                        {isEditing ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                                <h3 className="font-bold text-slate-900 mb-4">Edit Asset Details</h3>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Asset Tag</label>
                                            <input
                                                type="text"
                                                value={editData.asset_tag}
                                                onChange={(e) => setEditData('asset_tag', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Serial Number</label>
                                            <input
                                                type="text"
                                                value={editData.serial_number}
                                                onChange={(e) => setEditData('serial_number', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Location</label>
                                            <input
                                                type="text"
                                                value={editData.location}
                                                onChange={(e) => setEditData('location', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Brand</label>
                                            <input
                                                type="text"
                                                value={editData.brand}
                                                onChange={(e) => setEditData('brand', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Model</label>
                                            <input
                                                type="text"
                                                value={editData.model}
                                                onChange={(e) => setEditData('model', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">CPU</label>
                                            <input
                                                type="text"
                                                value={editData.cpu}
                                                onChange={(e) => setEditData('cpu', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">RAM (GB)</label>
                                            <input
                                                type="number"
                                                value={editData.ram_gb}
                                                onChange={(e) => setEditData('ram_gb', parseInt(e.target.value) || 0)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Storage (GB)</label>
                                            <input
                                                type="number"
                                                value={editData.storage_gb}
                                                onChange={(e) => setEditData('storage_gb', parseInt(e.target.value) || 0)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Purchase Cost ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editData.purchase_cost}
                                                onChange={(e) => setEditData('purchase_cost', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase">Warranty Expiry</label>
                                            <input
                                                type="date"
                                                value={editData.warranty_expiry}
                                                onChange={(e) => setEditData('warranty_expiry', e.target.value)}
                                                className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 rounded-xl border text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateProcessing}
                                            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                                        >
                                            {updateProcessing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                                <h3 className="text-base font-bold text-slate-900 mb-5">Hardware Specification Profile</h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    <div className="border-b border-slate-100 pb-3">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">Processor (CPU)</dt>
                                        <dd className="font-semibold text-slate-900 mt-0.5">{device.cpu}</dd>
                                        <dd className="text-xs text-indigo-600 capitalize font-medium">{device.cpu_tier} Tier</dd>
                                    </div>
                                    <div className="border-b border-slate-100 pb-3">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">Memory (RAM)</dt>
                                        <dd className="font-semibold text-slate-900 mt-0.5">{device.ram_gb} GB</dd>
                                    </div>
                                    <div className="border-b border-slate-100 pb-3">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">Storage Capacity</dt>
                                        <dd className="font-semibold text-slate-900 mt-0.5">{device.storage_gb} GB {device.storage_type}</dd>
                                    </div>
                                    <div className="border-b border-slate-100 pb-3">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">Graphics Accelerator</dt>
                                        <dd className="font-semibold text-slate-900 mt-0.5">{device.gpu || 'N/A'}</dd>
                                        <dd className="text-xs text-slate-500 capitalize">{device.gpu_tier}</dd>
                                    </div>
                                    <div className="border-b border-slate-100 pb-3">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">Physical Condition</dt>
                                        <dd className="font-semibold capitalize text-slate-900 mt-0.5">{device.condition.replace('_', ' ')}</dd>
                                    </div>
                                    <div className="border-b border-slate-100 pb-3">
                                        <dt className="text-xs text-slate-400 uppercase font-semibold">Inventory Status</dt>
                                        <dd className="font-bold uppercase text-xs mt-1">
                                            <span className={`px-2 py-0.5 rounded-full ${
                                                device.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                                                device.status === 'assigned' ? 'bg-slate-100 text-slate-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {device.status.replace('_', ' ')}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                                {device.notes && (
                                    <div className="mt-5 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200/60">
                                        <span className="font-bold text-slate-700">Internal Audit Notes:</span> {device.notes}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Maintenance & Servicing History Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Maintenance & Servicing History</h3>
                                    <p className="text-xs text-slate-500">Repairs, hardware upgrades, and performance assessments.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(true)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-xs transition"
                                >
                                    + Log Activity
                                </button>
                            </div>

                            {(!device.maintenance_logs || device.maintenance_logs.length === 0) ? (
                                <p className="text-sm text-slate-400 italic py-4">No maintenance or servicing activities recorded for this asset.</p>
                            ) : (
                                <div className="space-y-3">
                                    {device.maintenance_logs.map((log) => (
                                        <div key={log.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                                        log.type === 'repair' ? 'bg-rose-100 text-rose-800' :
                                                        log.type === 'upgrade' ? 'bg-indigo-100 text-indigo-800' :
                                                        log.type === 'preventive' ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-slate-200 text-slate-700'
                                                    }`}>
                                                        {log.type}
                                                    </span>
                                                    <h4 className="font-bold text-sm text-slate-900">{log.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                        log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                        log.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {log.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        ${Number(log.cost).toFixed(2)}
                                                    </span>
                                                    {log.status !== 'completed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenUpdateLog(log)}
                                                            className="text-xs text-indigo-600 font-semibold hover:underline"
                                                        >
                                                            Assess & Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-2">{log.description}</p>
                                            
                                            {log.performance_assessment && (
                                                <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
                                                    <span className="font-bold text-emerald-900">Performance Assessment:</span> {log.performance_assessment}
                                                </div>
                                            )}

                                            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                                                <span>Technician: {log.performed_by || 'Internal IT'}</span>
                                                <span>Started: {new Date(log.started_at).toLocaleDateString()} {log.completed_at && `&bull; Completed: ${new Date(log.completed_at).toLocaleDateString()}`}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lifecycle Audit Trail */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Lifecycle Audit Trail</h3>
                            {(!device.lifecycle_events || device.lifecycle_events.length === 0) ? (
                                <p className="text-sm text-slate-400 italic">No lifecycle transition events recorded.</p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {device.lifecycle_events.map((evt) => (
                                        <div key={evt.id} className="py-3 flex items-start justify-between text-xs">
                                            <div>
                                                <div className="font-semibold text-slate-800">
                                                    Transitioned from <span className="uppercase text-slate-500">{evt.from_stage}</span> &rarr; <span className="uppercase font-bold text-indigo-600">{evt.to_stage}</span>
                                                </div>
                                                <p className="text-slate-600 mt-0.5">{evt.notes}</p>
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    By: {evt.user?.name || 'System / IT Admin'}
                                                </div>
                                            </div>
                                            <div className="text-slate-400 whitespace-nowrap ml-4">
                                                {new Date(evt.created_at).toLocaleDateString()} {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Allocation & Assignment History */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Current Fleet Allocation</h3>
                            {device.active_assignment?.employee ? (
                                <div>
                                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Assigned To</div>
                                        <div className="font-bold text-slate-900 text-lg mt-1">{device.active_assignment.employee.name}</div>
                                        <div className="text-xs text-slate-500">{device.active_assignment.employee.department}</div>
                                        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                                            <span>Since {new Date(device.active_assignment.assigned_at).toLocaleDateString()}</span>
                                            {device.active_assignment.match_score && (
                                                <span className="font-bold text-indigo-700">
                                                    Fit: {Math.round(device.active_assignment.match_score * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold">
                                        ✓
                                    </div>
                                    <div className="font-bold text-emerald-900 text-sm">Available for Assignment</div>
                                    <p className="text-xs text-emerald-700 mt-1">This unit is currently idle in company inventory.</p>
                                    <Link
                                        href={route('match.index')}
                                        className="mt-4 inline-block w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                                    >
                                        Assign via Match Engine
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Assignment History */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Historical Assignments</h3>
                            {(!device.assignments || device.assignments.length === 0) ? (
                                <p className="text-sm text-slate-400 italic">No historical assignments logged for this device.</p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {device.assignments.map((asg) => (
                                        <div key={asg.id} className="py-3 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-900">{asg.employee?.name}</span>
                                                {asg.match_score && (
                                                    <span className="font-bold text-slate-600">
                                                        {Math.round(asg.match_score * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                {new Date(asg.assigned_at).toLocaleDateString()}
                                                {asg.unassigned_at && ` &rarr; ${new Date(asg.unassigned_at).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Transition Lifecycle Stage */}
            {showLifecycleModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Transition Lifecycle Stage</h3>
                            <button onClick={() => setShowLifecycleModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleLifecycleTransition} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Target Lifecycle Stage</label>
                                <select
                                    value={lifecycleData.to_stage}
                                    onChange={(e) => setLifecycleData('to_stage', e.target.value)}
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200 font-semibold"
                                >
                                    <option value="acquisition">Acquisition (Procurement / Intake)</option>
                                    <option value="deployment">Deployment (Active In-Service)</option>
                                    <option value="maintenance">Maintenance (Servicing / In-Repair)</option>
                                    <option value="retirement">Retirement (Decommissioned)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Audit Notes / Justification</label>
                                <textarea
                                    rows={3}
                                    value={lifecycleData.notes}
                                    onChange={(e) => setLifecycleData('notes', e.target.value)}
                                    placeholder="Reason for stage change, approval reference, or incident number..."
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLifecycleModal(false)}
                                    className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={lifecycleProcessing}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                                >
                                    {lifecycleProcessing ? 'Transitioning...' : 'Confirm Transition'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Log Maintenance Activity */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Log Maintenance / Servicing</h3>
                            <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleCreateMaintenance} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Activity Type</label>
                                    <select
                                        value={maintData.type}
                                        onChange={(e) => setMaintData('type', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    >
                                        <option value="repair">Repair</option>
                                        <option value="upgrade">Hardware Upgrade</option>
                                        <option value="preventive">Preventive Servicing</option>
                                        <option value="inspection">Inspection / Audit</option>
                                        <option value="replacement">Component Replacement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={maintData.cost}
                                        onChange={(e) => setMaintData('cost', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Activity Title</label>
                                <input
                                    type="text"
                                    value={maintData.title}
                                    onChange={(e) => setMaintData('title', e.target.value)}
                                    placeholder="e.g. Battery replacement & thermal cleaning"
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Technician / Vendor</label>
                                <input
                                    type="text"
                                    value={maintData.performed_by}
                                    onChange={(e) => setMaintData('performed_by', e.target.value)}
                                    placeholder="e.g. Internal IT Support, Apex Tech"
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Description of Work</label>
                                <textarea
                                    rows={2}
                                    value={maintData.description}
                                    onChange={(e) => setMaintData('description', e.target.value)}
                                    placeholder="Specific parts changed, symptoms observed..."
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Status</label>
                                    <select
                                        value={maintData.status}
                                        onChange={(e) => setMaintData('status', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="flex items-center mt-5">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={maintData.send_to_maintenance_stage}
                                            onChange={(e) => setMaintData('send_to_maintenance_stage', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Move Asset to Maintenance Stage
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={maintProcessing}
                                    className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
                                >
                                    {maintProcessing ? 'Logging...' : 'Record Maintenance Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Complete Servicing & Record Performance Assessment */}
            {selectedLogToUpdate && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900">Assess & Complete Servicing</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{selectedLogToUpdate.title}</p>
                            </div>
                            <button onClick={() => setSelectedLogToUpdate(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateMaintenanceLog} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Final Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={updateMaintData.cost}
                                        onChange={(e) => setUpdateMaintData('cost', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700">Completion Date</label>
                                    <input
                                        type="date"
                                        value={updateMaintData.completed_at}
                                        onChange={(e) => setUpdateMaintData('completed_at', e.target.value)}
                                        className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700">Post-Maintenance Performance Assessment *</label>
                                <textarea
                                    rows={3}
                                    value={updateMaintData.performance_assessment}
                                    onChange={(e) => setUpdateMaintData('performance_assessment', e.target.value)}
                                    placeholder="e.g. CPU benchmark scores restored, temperature reduced by 8°C under stress test, 0 memory faults logged..."
                                    className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Assess the performance of the asset to verify full restoration of operational capacity.
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                                    <input
                                        type="checkbox"
                                        checked={updateMaintData.restore_to_available}
                                        onChange={(e) => setUpdateMaintData('restore_to_available', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Restore Asset back to Active Deployment Stage
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
                                    disabled={updateMaintProcessing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                                >
                                    {updateMaintProcessing ? 'Saving...' : 'Mark Servicing Completed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
