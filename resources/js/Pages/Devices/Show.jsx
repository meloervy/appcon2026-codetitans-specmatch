import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HardwareImage from '@/Components/HardwareImage';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    RiArrowLeftLine,
    RiToolsLine,
    RiExchangeLine,
    RiEditLine,
    RiArchiveLine,
    RiCloseLine,
    RiMapPinLine,
    RiCheckLine,
    RiArrowRightLine,
    RiShieldCheckLine,
} from 'react-icons/ri';

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
        image_url: device.image_url || '',
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

    const stages = [
        { key: 'acquisition', label: '1. Acquisition', desc: 'Procurement & Staging' },
        { key: 'deployment', label: '2. Deployment', desc: 'Active Production' },
        { key: 'maintenance', label: '3. Maintenance', desc: 'Repairs & Servicing' },
        { key: 'retirement', label: '4. Retirement', desc: 'Decommissioned / EOL' },
    ];

    const currentStageIndex = stages.findIndex((s) => s.key === device.lifecycle_stage);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-base sm:text-lg font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-3 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-2xs">
                            {device.asset_tag}
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-50">{device.brand} {device.model}</h1>
                                {device.techspecs_id && (
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] border border-[#026eff]/20 dark:border-[#031a40]/60">
                                        TechSpecs Verified
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize mt-0.5 flex items-center flex-wrap gap-1.5">
                                <span>{device.device_type}</span>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1">
                                    <RiMapPinLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                    <span>{device.location || 'No Location Set'}</span>
                                </span>
                                <span>&bull;</span>
                                <span>S/N: {device.serial_number || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Back Button */}
                        <Link
                            href={route('devices.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition shadow-2xs cursor-pointer"
                        >
                            <RiArrowLeftLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                            <span>Back</span>
                        </Link>

                        {/* 2. Log Servicing Button */}
                        <button
                            type="button"
                            onClick={() => setShowMaintenanceModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition shadow-2xs cursor-pointer"
                        >
                            <RiToolsLine className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Log Servicing</span>
                        </button>

                        {/* 3. Transition Stage Button */}
                        <button
                            type="button"
                            onClick={() => setShowLifecycleModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/40 border border-[#026eff]/20 dark:border-[#031a40]/60 text-xs font-semibold text-[#026eff] dark:text-[#38bdf8] hover:bg-[#026eff]/20 transition shadow-2xs cursor-pointer"
                        >
                            <RiExchangeLine className="w-4 h-4" />
                            <span>Transition Stage</span>
                        </button>

                        {/* 4. Edit Asset Button */}
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs cursor-pointer ${
                                isEditing
                                    ? 'border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-zinc-100'
                                    : 'border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {isEditing ? (
                                <>
                                    <RiCloseLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                    <span>Cancel Edit</span>
                                </>
                            ) : (
                                <>
                                    <RiEditLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                    <span>Edit Asset</span>
                                </>
                            )}
                        </button>

                        {/* 5. Retire Asset Button */}
                        {device.status !== 'retired' && (
                            <button
                                type="button"
                                onClick={handleRetire}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition shadow-2xs cursor-pointer"
                            >
                                <RiArchiveLine className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                <span>Retire</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${device.asset_tag} - Hardware Details`} />

            <div className="space-y-5">
                {/* 1. Visual Lifecycle Stage Progression Stepper */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4 gap-2">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Asset Lifecycle Phase</span>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                                Current Status: <span className="text-[#026eff] dark:text-[#38bdf8] capitalize">{device.lifecycle_stage}</span>
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowLifecycleModal(true)}
                            className="text-xs font-semibold text-[#026eff] dark:text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <span>Transition Phase</span>
                            <RiArrowRightLine className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stages.map((stage, idx) => {
                            const isCurrent = stage.key === device.lifecycle_stage;
                            const isPast = currentStageIndex > idx;
                            return (
                                <div
                                    key={stage.key}
                                    className={`relative p-3.5 rounded-xl border transition ${
                                        isCurrent
                                            ? 'bg-[#026eff]/10 dark:bg-[#031a40]/40 border-[#026eff]/30 dark:border-[#026eff]/70 ring-1 ring-[#026eff]/20'
                                            : isPast
                                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                                            : 'bg-slate-50/50 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                            isCurrent ? 'text-[#026eff] dark:text-[#38bdf8]' : isPast ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                                        }`}>
                                            Stage {idx + 1}
                                        </span>
                                        {isCurrent && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#026eff] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#026eff]"></span>
                                            </span>
                                        )}
                                        {isPast && (
                                            <RiCheckLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                    </div>
                                    <div className="font-bold text-xs text-slate-900 dark:text-zinc-100">{stage.label}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{stage.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left Column: Device Hero & Specs */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Device Hero Card with Image Clip */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                                <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 overflow-hidden shadow-2xs relative">
                                    <HardwareImage
                                        src={device.image_clip_url || device.image_url}
                                        alt={`${device.brand} ${device.model}`}
                                        className="w-full h-full object-cover object-center"
                                    />
                                    {device.techspecs_id && (
                                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-white font-mono font-semibold">
                                            TechSpecs
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{device.brand} {device.model}</h2>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                            device.status === 'available' ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300' :
                                            device.status === 'assigned' ? 'bg-[#026eff]/15 text-[#026eff] dark:bg-[#031a40]/60 dark:text-[#38bdf8]' :
                                            device.status === 'in_repair' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' :
                                            'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                                        }`}>
                                            {device.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        Asset Tag: <span className="font-mono font-bold text-slate-700 dark:text-zinc-200">{device.asset_tag}</span> &bull; 
                                        Serial: <span className="font-mono">{device.serial_number || 'N/A'}</span> &bull; 
                                        Location: <span className="font-medium text-slate-700 dark:text-zinc-300">{device.location || 'Pool Stock'}</span>
                                    </p>
                                    <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-1.5 text-[11px]">
                                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700">
                                            {device.cpu} ({device.cpu_tier})
                                        </span>
                                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700">
                                            {device.ram_gb} GB RAM
                                        </span>
                                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700">
                                            {device.storage_gb} GB {device.storage_type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial & Contractual Tracking Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 flex items-center justify-between">
                                <span>Financial & Contractual Metrics</span>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-semibold capitalize ${
                                    device.warranty_status === 'active'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                                        : device.warranty_status === 'expiring_soon'
                                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'
                                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50'
                                }`}>
                                    Warranty: {device.warranty_status ? device.warranty_status.replace('_', ' ') : 'Not Recorded'}
                                </span>
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Purchase Cost</dt>
                                    <dd className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                                        ₱{Number(device.purchase_cost || 65000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                        {device.purchase_date ? `Purchased: ${device.purchase_date}` : `Year: ${device.year_acquired}`}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Book Value</dt>
                                    <dd className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                        ₱{Number(device.current_book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                        Depr: {device.depreciation_rate_percent || 20}%/yr
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Vendor</dt>
                                    <dd className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">
                                        {device.vendor || 'Direct Purchase'}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate block">
                                        {device.barcode ? `BC: ${device.barcode}` : 'Barcode N/A'}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Warranty Expiry</dt>
                                    <dd className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                                        {device.warranty_expiry || 'Not Recorded'}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                        {device.days_until_warranty_expiry !== null && device.days_until_warranty_expiry !== undefined
                                            ? device.days_until_warranty_expiry > 0
                                                ? `${device.days_until_warranty_expiry}d remaining`
                                                : `${Math.abs(device.days_until_warranty_expiry)}d ago`
                                            : 'No date'}
                                    </span>
                                </div>
                            </div>

                            {device.contract_sla && (
                                <div className="mt-3 p-3 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/30 border border-[#026eff]/15 dark:border-[#031a40]/50 text-xs flex items-center justify-between text-[#031a40] dark:text-[#38bdf8]">
                                    <div className="flex items-center gap-2">
                                        <RiShieldCheckLine className="w-4 h-4 text-[#026eff] dark:text-[#38bdf8]" />
                                        <div>
                                            <span className="font-bold text-[#026eff] dark:text-[#38bdf8] uppercase tracking-wider text-[9px] mr-2">SLA Coverage</span>
                                            <span className="font-medium text-slate-800 dark:text-zinc-200">{device.contract_sla}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-[#026eff] dark:text-[#38bdf8]">Enterprise SLA</span>
                                </div>
                            )}
                        </div>

                        {/* Hardware Specifications Profile */}
                        {isEditing ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 mb-3">Edit Asset Record</h3>
                                <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">Asset Tag</label>
                                            <input
                                                type="text"
                                                value={editData.asset_tag}
                                                onChange={(e) => setEditData('asset_tag', e.target.value)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">Serial Number</label>
                                            <input
                                                type="text"
                                                value={editData.serial_number}
                                                onChange={(e) => setEditData('serial_number', e.target.value)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">Image URL (Optional)</label>
                                            <input
                                                type="text"
                                                value={editData.image_url}
                                                onChange={(e) => setEditData('image_url', e.target.value)}
                                                placeholder="https://..."
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">Location</label>
                                            <input
                                                type="text"
                                                value={editData.location}
                                                onChange={(e) => setEditData('location', e.target.value)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">Brand</label>
                                            <input
                                                type="text"
                                                value={editData.brand}
                                                onChange={(e) => setEditData('brand', e.target.value)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">Model</label>
                                            <input
                                                type="text"
                                                value={editData.model}
                                                onChange={(e) => setEditData('model', e.target.value)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">CPU</label>
                                            <input
                                                type="text"
                                                value={editData.cpu}
                                                onChange={(e) => setEditData('cpu', e.target.value)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">RAM (GB)</label>
                                            <input
                                                type="number"
                                                value={editData.ram_gb}
                                                onChange={(e) => setEditData('ram_gb', parseInt(e.target.value) || 0)}
                                                className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateProcessing}
                                            className="px-4 py-1.5 rounded-xl bg-[#026eff] text-white font-semibold hover:bg-[#0256cc] transition cursor-pointer"
                                        >
                                            {updateProcessing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">Hardware Specifications</h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 text-xs">
                                    <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2.5">
                                        <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Processor (CPU)</dt>
                                        <dd className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{device.cpu}</dd>
                                        <dd className="text-[10px] text-[#026eff] dark:text-[#38bdf8] capitalize font-medium">{device.cpu_tier} Tier</dd>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2.5">
                                        <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Memory (RAM)</dt>
                                        <dd className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{device.ram_gb} GB</dd>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2.5">
                                        <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Storage Capacity</dt>
                                        <dd className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{device.storage_gb} GB {device.storage_type}</dd>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2.5">
                                        <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Graphics Accelerator</dt>
                                        <dd className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{device.gpu || 'N/A'}</dd>
                                        <dd className="text-[10px] text-slate-500 dark:text-zinc-400 capitalize">{device.gpu_tier}</dd>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2.5">
                                        <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Physical Condition</dt>
                                        <dd className="font-semibold capitalize text-slate-900 dark:text-zinc-100 mt-0.5">{device.condition.replace('_', ' ')}</dd>
                                    </div>
                                    <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-2.5">
                                        <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">Inventory State</dt>
                                        <dd className="font-bold uppercase text-[10px] mt-1">
                                            <span className={`px-2 py-0.5 rounded-full ${
                                                device.status === 'available' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                                                device.status === 'assigned' ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200' :
                                                'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                            }`}>
                                                {device.status.replace('_', ' ')}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                                {device.notes && (
                                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-[11px] text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800">
                                        <span className="font-bold text-slate-700 dark:text-zinc-200">Audit Notes:</span> {device.notes}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Maintenance & Servicing History Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Maintenance & Servicing History</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Repairs, hardware upgrades, and performance assessments.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(true)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition cursor-pointer"
                                >
                                    <RiToolsLine className="w-3.5 h-3.5" />
                                    <span>Log Servicing</span>
                                </button>
                            </div>

                            {(!device.maintenance_logs || device.maintenance_logs.length === 0) ? (
                                <div className="py-6 px-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
                                    No maintenance activities recorded for this asset.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {device.maintenance_logs.map((log) => (
                                        <div key={log.id} className="p-3.5 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 text-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                                                        log.type === 'repair' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' :
                                                        log.type === 'upgrade' ? 'bg-[#026eff]/15 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8]' :
                                                        'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                                    }`}>
                                                        {log.type}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 dark:text-zinc-100">{log.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                                                        log.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                                                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                    }`}>
                                                        {log.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="font-bold text-slate-700 dark:text-zinc-300">
                                                        ₱{Number(log.cost).toFixed(2)}
                                                    </span>
                                                    {log.status !== 'completed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenUpdateLog(log)}
                                                            className="text-[#026eff] dark:text-[#38bdf8] font-semibold hover:underline cursor-pointer"
                                                        >
                                                            Assess & Close
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">{log.description}</p>
                                            
                                            {log.performance_assessment && (
                                                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300">
                                                    <span className="font-bold">Performance Impact:</span> {log.performance_assessment}
                                                </div>
                                            )}

                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 flex items-center justify-between">
                                                <span>Tech: {log.performed_by || 'Internal IT'}</span>
                                                <span>Started: {new Date(log.started_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lifecycle Audit Trail */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Lifecycle Audit Trail</h3>
                            {(!device.lifecycle_events || device.lifecycle_events.length === 0) ? (
                                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No transition events recorded.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                                    {device.lifecycle_events.map((evt) => (
                                        <div key={evt.id} className="py-2.5 flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                                                    <span>Phase</span>
                                                    <span className="uppercase text-slate-500">{evt.from_stage}</span>
                                                    <RiArrowRightLine className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="uppercase font-bold text-[#026eff] dark:text-[#38bdf8]">{evt.to_stage}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">{evt.notes}</p>
                                                <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">
                                                    Auth: {evt.user?.name || 'System IT Admin'}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 whitespace-nowrap ml-3">
                                                {new Date(evt.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Allocation & Assignment History */}
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Current Allocation</h3>
                            {device.active_assignment?.employee ? (
                                <div className="p-4 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/30 border border-[#026eff]/15 dark:border-[#031a40]/50">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#026eff] dark:text-[#38bdf8]">Assigned Employee</div>
                                    <div className="font-bold text-slate-900 dark:text-zinc-100 text-base mt-1">{device.active_assignment.employee.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-zinc-400">{device.active_assignment.employee.department}</div>
                                    <div className="mt-2.5 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                                        <span>Since {new Date(device.active_assignment.assigned_at).toLocaleDateString()}</span>
                                        {device.active_assignment.match_score && (
                                            <span className="font-bold text-[#026eff] dark:text-[#38bdf8]">
                                                Fit: {Math.round(device.active_assignment.match_score * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                                        <RiCheckLine className="w-5 h-5" />
                                    </div>
                                    <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">Available Pool Unit</div>
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Idle in inventory, ready to be matched.</p>
                                    <Link
                                        href={route('match.index')}
                                        className="mt-3.5 inline-block w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-2xs"
                                    >
                                        Assign via Match Engine
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Historical Allocations */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Historical Allocations</h3>
                            {(!device.assignments || device.assignments.length === 0) ? (
                                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No past assignments logged.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                                    {device.assignments.map((asg) => (
                                        <div key={asg.id} className="py-2.5">
                                            <div className="flex items-center justify-between font-medium">
                                                <span className="text-slate-900 dark:text-zinc-100">{asg.employee?.name}</span>
                                                {asg.match_score && (
                                                    <span className="text-slate-500 text-[11px]">
                                                        {Math.round(asg.match_score * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                                                {new Date(asg.assigned_at).toLocaleDateString()}
                                                {asg.unassigned_at && ` to ${new Date(asg.unassigned_at).toLocaleDateString()}`}
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Transition Lifecycle Phase</h3>
                            <button
                                type="button"
                                onClick={() => setShowLifecycleModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer p-1"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleLifecycleTransition} className="mt-3.5 space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Target Lifecycle Stage</label>
                                <select
                                    value={lifecycleData.to_stage}
                                    onChange={(e) => setLifecycleData('to_stage', e.target.value)}
                                    className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold"
                                >
                                    <option value="acquisition">Acquisition (Intake / Staging)</option>
                                    <option value="deployment">Deployment (Active In-Service)</option>
                                    <option value="maintenance">Maintenance (Servicing / In-Repair)</option>
                                    <option value="retirement">Retirement (Decommissioned)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Audit Notes / Reason</label>
                                <textarea
                                    rows={3}
                                    value={lifecycleData.notes}
                                    onChange={(e) => setLifecycleData('notes', e.target.value)}
                                    placeholder="Reason for phase transition..."
                                    className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowLifecycleModal(false)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={lifecycleProcessing}
                                    className="px-4 py-1.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white font-semibold transition cursor-pointer"
                                >
                                    {lifecycleProcessing ? 'Transitioning...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Log Maintenance */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Log Maintenance / Servicing</h3>
                            <button
                                type="button"
                                onClick={() => setShowMaintenanceModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer p-1"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateMaintenance} className="mt-3.5 space-y-3">
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Activity Type</label>
                                    <select
                                        value={maintData.type}
                                        onChange={(e) => setMaintData('type', e.target.value)}
                                        className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    >
                                        <option value="repair">Repair</option>
                                        <option value="upgrade">Hardware Upgrade</option>
                                        <option value="preventive">Preventive Servicing</option>
                                        <option value="inspection">Inspection / Audit</option>
                                        <option value="replacement">Component Replacement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Cost (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={maintData.cost}
                                        onChange={(e) => setMaintData('cost', e.target.value)}
                                        className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Title</label>
                                <input
                                    type="text"
                                    value={maintData.title}
                                    onChange={(e) => setMaintData('title', e.target.value)}
                                    placeholder="e.g. Battery replacement & thermal repaste"
                                    className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Technician / Vendor</label>
                                <input
                                    type="text"
                                    value={maintData.performed_by}
                                    onChange={(e) => setMaintData('performed_by', e.target.value)}
                                    placeholder="e.g. Internal IT Support, Apex Tech"
                                    className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Description of Work</label>
                                <textarea
                                    rows={2}
                                    value={maintData.description}
                                    onChange={(e) => setMaintData('description', e.target.value)}
                                    placeholder="Work performed, components changed..."
                                    className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 items-center">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Status</label>
                                    <select
                                        value={maintData.status}
                                        onChange={(e) => setMaintData('status', e.target.value)}
                                        className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="mt-4">
                                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 dark:text-zinc-300">
                                        <input
                                            type="checkbox"
                                            checked={maintData.send_to_maintenance_stage}
                                            onChange={(e) => setMaintData('send_to_maintenance_stage', e.target.checked)}
                                            className="rounded border-slate-300 dark:border-zinc-700 text-[#026eff] focus:ring-[#026eff]"
                                        />
                                        Set Asset to Maintenance Phase
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={maintProcessing}
                                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition cursor-pointer"
                                >
                                    {maintProcessing ? 'Logging...' : 'Record Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Update / Complete Servicing Log */}
            {selectedLogToUpdate && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Assess & Close Servicing</h3>
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{selectedLogToUpdate.title}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLogToUpdate(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer p-1"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateMaintenanceLog} className="mt-3.5 space-y-3">
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Final Cost (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={updateMaintData.cost}
                                        onChange={(e) => setUpdateMaintData('cost', e.target.value)}
                                        className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Completion Date</label>
                                    <input
                                        type="date"
                                        value={updateMaintData.completed_at}
                                        onChange={(e) => setUpdateMaintData('completed_at', e.target.value)}
                                        className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">Performance Assessment *</label>
                                <textarea
                                    rows={3}
                                    value={updateMaintData.performance_assessment}
                                    onChange={(e) => setUpdateMaintData('performance_assessment', e.target.value)}
                                    placeholder="Empirical performance impact post-servicing (e.g. stress test temperature drops, PassMark scores, memory test passes)..."
                                    className="mt-1 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    required
                                />
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-800 dark:text-zinc-200">
                                    <input
                                        type="checkbox"
                                        checked={updateMaintData.restore_to_available}
                                        onChange={(e) => setUpdateMaintData('restore_to_available', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-zinc-700 text-[#026eff] focus:ring-[#026eff]"
                                    />
                                    Restore Asset back to Active Deployment Phase
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLogToUpdate(null)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMaintProcessing}
                                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer"
                                >
                                    {updateMaintProcessing ? 'Saving...' : 'Complete & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
