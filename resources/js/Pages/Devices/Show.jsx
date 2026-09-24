import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import HardwareImage from '@/Components/HardwareImage';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
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
    RiCheckboxCircleLine,
    RiArrowRightLine,
    RiShieldCheckLine,
    RiSaveLine,
    RiPriceTag3Line,
    RiBarcodeLine,
    RiCpuLine,
    RiHardDrive2Line,
    RiMoneyDollarCircleLine,
    RiPulseLine,
    RiErrorWarningLine,
    RiComputerLine,
    RiInformationLine,
    RiFileCopyLine,
    RiCheckDoubleLine,
    RiUser3Line,
    RiTimeLine,
    RiSpeedUpLine,
    RiSparklingLine,
    RiQrCodeLine,
    RiTv2Line,
    RiDatabase2Line,
    RiEqualizerLine,
} from 'react-icons/ri';

const conditionOptions = [
    { value: 'excellent', label: 'Excellent (Like New / Minimal Wear)', badge: 'Top Spec', icon: RiCheckboxCircleLine },
    { value: 'good', label: 'Good (Normal Operational Wear)', badge: 'Standard', icon: RiCheckLine },
    { value: 'fair', label: 'Fair (Noticeable Scratches / Moderate Wear)', badge: 'Moderate', icon: RiInformationLine },
    { value: 'poor', label: 'Poor (Requires Servicing / Degraded)', badge: 'Degraded', icon: RiErrorWarningLine },
];

const statusOptions = [
    { value: 'available', label: 'Available in Pool Stock', badge: 'Stockroom', icon: RiCheckboxCircleLine },
    { value: 'assigned', label: 'Assigned to Employee', badge: 'In Use', icon: RiUser3Line },
    { value: 'in_repair', label: 'Under Servicing / In Repair', badge: 'Servicing', icon: RiToolsLine },
    { value: 'retired', label: 'Decommissioned / Retired', badge: 'Archived', icon: RiArchiveLine },
];

const lifecycleStageOptions = [
    { value: 'acquisition', label: 'Acquisition (Intake / Staging)', badge: 'Phase 1', icon: RiPulseLine },
    { value: 'deployment', label: 'Deployment (Active In-Service)', badge: 'Phase 2', icon: RiCheckboxCircleLine },
    { value: 'reclaimed', label: 'Reclaimed (Sanitized in Pool Stock)', badge: 'Stock', icon: RiCheckboxCircleLine },
    { value: 'maintenance', label: 'Maintenance (Servicing / In-Repair)', badge: 'Phase 3', icon: RiToolsLine },
    { value: 'retirement', label: 'Retirement (Decommissioned)', badge: 'Phase 4', icon: RiArchiveLine },
];

const maintTypeOptions = [
    { value: 'repair', label: 'Repair', badge: 'Fix', icon: RiToolsLine },
    { value: 'upgrade', label: 'Hardware Upgrade', badge: 'Enhance', icon: RiSpeedUpLine },
    { value: 'preventive', label: 'Preventive Servicing', badge: 'Checkup', icon: RiShieldCheckLine },
    { value: 'inspection', label: 'Inspection / Audit', badge: 'Audit', icon: RiInformationLine },
    { value: 'replacement', label: 'Component Replacement', badge: 'Parts', icon: RiExchangeLine },
];

const maintStatusOptions = [
    { value: 'in_progress', label: 'In Progress', badge: 'Active', icon: RiPulseLine },
    { value: 'scheduled', label: 'Scheduled', badge: 'Upcoming', icon: RiTimeLine },
    { value: 'completed', label: 'Completed', badge: 'Resolved', icon: RiCheckboxCircleLine },
];

export default function DevicesShow({ device }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showLifecycleModal, setShowLifecycleModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [selectedLogToUpdate, setSelectedLogToUpdate] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    // Edit Device Asset Specs Form
    const {
        data: editData,
        setData: setEditData,
        put: putUpdate,
        processing: updateProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        asset_tag: device.asset_tag || '',
        serial_number: device.serial_number || '',
        barcode: device.barcode || '',
        techspecs_id: device.techspecs_id || '',
        image_url: device.image_url || '',
        device_type: device.device_type || 'laptop',
        brand: device.brand || '',
        model: device.model || '',
        location: device.location || '',
        cpu: device.cpu || '',
        cpu_tier: device.cpu_tier || 'mid',
        ram_gb: device.ram_gb || 16,
        storage_type: device.storage_type || 'SSD',
        storage_gb: device.storage_gb || 512,
        gpu: device.gpu || '',
        gpu_tier: device.gpu_tier || 'none',
        year_acquired: device.year_acquired || new Date().getFullYear(),
        purchase_cost: device.purchase_cost || '',
        purchase_date: device.purchase_date || '',
        depreciation_rate_percent: device.depreciation_rate_percent || 20.0,
        vendor: device.vendor || '',
        warranty_start: device.warranty_start || '',
        warranty_expiry: device.warranty_expiry || '',
        contract_sla: device.contract_sla || '',
        condition: device.condition || 'excellent',
        status: device.status || 'available',
        lifecycle_stage: device.lifecycle_stage || 'deployment',
        notes: device.notes || '',
    });

    // Hardware Photo Lookup State for Edit mode
    const [fetchingPhoto, setFetchingPhoto] = useState(false);
    const [photoNotice, setPhotoNotice] = useState(null);

    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => {
            setCopiedField(null);
        }, 2000);
    };

    const handleFetchHardwarePhoto = async () => {
        if (!editData.brand && !editData.model) {
            setPhotoNotice({ type: 'error', message: 'Please enter a Brand and Model first.' });
            return;
        }
        setFetchingPhoto(true);
        setPhotoNotice(null);
        try {
            const res = await axios.post(route('hardware.image-lookup'), {
                brand: editData.brand,
                model: editData.model,
                device_type: editData.device_type,
            });
            if (res.data.image_url) {
                setEditData('image_url', res.data.image_url);
                setPhotoNotice({
                    type: 'success',
                    message: `Found authentic photo from ${res.data.source === 'wikimedia' ? 'Wikimedia Commons' : 'Hardware Registry'}.`,
                });
            } else {
                setPhotoNotice({
                    type: 'info',
                    message: 'No exact photo found in database. You may enter a custom URL.',
                });
            }
        } catch (err) {
            setPhotoNotice({
                type: 'error',
                message: 'Failed to look up hardware image. Please check network connection.',
            });
        } finally {
            setFetchingPhoto(false);
        }
    };

    const handleCancelEdit = () => {
        resetEdit();
        setPhotoNotice(null);
        setIsEditing(false);
    };

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
            onSuccess: () => {
                setIsEditing(false);
                setPhotoNotice(null);
            },
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
        { key: 'reclaimed', label: '3. Reclaimed', desc: 'Sanitized in Pool' },
        { key: 'maintenance', label: '4. Maintenance', desc: 'Repairs & Servicing' },
        { key: 'retirement', label: '5. Retirement', desc: 'Decommissioned / EOL' },
    ];

    const currentStageIndex = stages.findIndex((s) => s.key === device.lifecycle_stage);

    // Condition styling map
    const conditionConfig = {
        excellent: {
            label: 'Excellent Condition',
            scoreText: '100% Health',
            barWidth: 'w-full',
            barColor: 'bg-emerald-500',
            textColor: 'text-emerald-700 dark:text-emerald-300',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
            badgeBorder: 'border-emerald-200/70 dark:border-emerald-800/60',
            desc: 'Flawless chassis, display, and components. Exceeds standard operating parameters.',
        },
        good: {
            label: 'Good Condition',
            scoreText: '75% Health',
            barWidth: 'w-3/4',
            barColor: 'bg-[#026eff]',
            textColor: 'text-[#026eff] dark:text-[#38bdf8]',
            badgeBg: 'bg-[#026eff]/10 dark:bg-[#031a40]/40',
            badgeBorder: 'border-[#026eff]/20 dark:border-[#026eff]/40',
            desc: 'Minor cosmetic signs of normal operational usage. Full hardware health.',
        },
        fair: {
            label: 'Fair Condition',
            scoreText: '50% Health',
            barWidth: 'w-1/2',
            barColor: 'bg-amber-500',
            textColor: 'text-amber-700 dark:text-amber-300',
            badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
            badgeBorder: 'border-amber-200/70 dark:border-amber-800/60',
            desc: 'Moderate wear or surface scratches. Functional and suitable for general productivity.',
        },
        poor: {
            label: 'Degraded / Poor',
            scoreText: '25% Health',
            barWidth: 'w-1/4',
            barColor: 'bg-rose-500',
            textColor: 'text-rose-700 dark:text-rose-300',
            badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
            badgeBorder: 'border-rose-200/70 dark:border-rose-800/60',
            desc: 'Heavy wear or impending component fatigue. Recommended for servicing intake.',
        },
    };

    const activeCondition = conditionConfig[device.condition] || conditionConfig.good;

    // Status styling map
    const statusConfig = {
        available: {
            label: 'Available in Fleet',
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
            text: 'text-emerald-700 dark:text-emerald-300',
            dot: 'bg-emerald-500',
            border: 'border-emerald-200/80 dark:border-emerald-800/70',
        },
        assigned: {
            label: 'Assigned to Custodian',
            bg: 'bg-[#026eff]/10 dark:bg-[#031a40]/50',
            text: 'text-[#026eff] dark:text-[#38bdf8]',
            dot: 'bg-[#026eff]',
            border: 'border-[#026eff]/20 dark:border-[#026eff]/40',
        },
        in_repair: {
            label: 'Under Servicing / In Repair',
            bg: 'bg-amber-50 dark:bg-amber-950/50',
            text: 'text-amber-700 dark:text-amber-300',
            dot: 'bg-amber-500',
            border: 'border-amber-200/80 dark:border-amber-800/70',
        },
        retired: {
            label: 'Decommissioned / Retired',
            bg: 'bg-slate-100 dark:bg-zinc-800/80',
            text: 'text-slate-700 dark:text-zinc-300',
            dot: 'bg-slate-400',
            border: 'border-slate-200/80 dark:border-zinc-700/80',
        },
    };

    const currentStatus = statusConfig[isEditing ? editData.status : device.status] || statusConfig.available;

    // Financial Metrics & Depreciation Progress
    const purchaseCost = Number(device.purchase_cost || 0);
    const bookValue = Number(device.current_book_value ?? purchaseCost);
    const totalDepreciated = Math.max(0, purchaseCost - bookValue);
    const deprPercent = purchaseCost > 0 ? Math.min(100, Math.max(0, Math.round((totalDepreciated / purchaseCost) * 100))) : 0;
    const retainedPercent = 100 - deprPercent;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-2xs">
                            {isEditing ? (editData.asset_tag || device.asset_tag) : device.asset_tag}
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-50">
                                    {isEditing ? `Editing: ${editData.brand || device.brand} ${editData.model || device.model}` : `${device.brand} ${device.model}`}
                                </h1>
                                {!isEditing && device.techspecs_id && (
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] border border-[#026eff]/20 dark:border-[#031a40]/60">
                                        TechSpecs Verified
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize mt-0.5 flex items-center flex-wrap gap-1.5">
                                <span>{isEditing ? editData.device_type : device.device_type}</span>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1">
                                    <RiMapPinLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                    <span>{(isEditing ? editData.location : device.location) || 'No Location Set'}</span>
                                </span>
                                <span>&bull;</span>
                                <span>S/N: {(isEditing ? editData.serial_number : device.serial_number) || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition shadow-2xs cursor-pointer"
                                >
                                    <RiCloseLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                    <span>Discard Changes</span>
                                </button>
                                <button
                                    type="submit"
                                    form="edit-device-form"
                                    disabled={updateProcessing}
                                    className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {updateProcessing ? (
                                        <>
                                            <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <RiSaveLine className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* 1. Back Button */}
                                <Link
                                    href={route('devices.index')}
                                    className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition shadow-2xs cursor-pointer"
                                >
                                    <RiArrowLeftLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                    <span>Back</span>
                                </Link>

                                {/* 2. Log Servicing Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(true)}
                                    className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition shadow-2xs cursor-pointer"
                                >
                                    <RiToolsLine className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span>Log Servicing</span>
                                </button>

                                {/* 3. Transition Stage Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowLifecycleModal(true)}
                                    className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/40 border border-[#026eff]/20 dark:border-[#031a40]/60 text-xs font-semibold text-[#026eff] dark:text-[#38bdf8] hover:bg-[#026eff]/20 transition shadow-2xs cursor-pointer"
                                >
                                    <RiExchangeLine className="w-4 h-4" />
                                    <span>Transition Stage</span>
                                </button>

                                {/* 4. Edit Asset Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition shadow-2xs cursor-pointer"
                                >
                                    <RiEditLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                    <span>Edit Asset</span>
                                </button>

                                {/* 5. Retire Asset Button */}
                                {device.status !== 'retired' && (
                                    <button
                                        type="button"
                                        onClick={handleRetire}
                                        className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition shadow-2xs cursor-pointer"
                                    >
                                        <RiArchiveLine className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                        <span>Retire</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${device.asset_tag} - ${isEditing ? 'Edit Asset Record' : 'Hardware Details'}`} />

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

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
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
                    {/* Left Column: Device Hero, Financials, Hardware Profile / Edit Form, & Logs */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Device Hero Showcase Card with One-Click Copy and Live Status */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-6 shadow-2xs relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                {/* Hardware Image Container */}
                                <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-zinc-800 dark:to-zinc-800/50 border border-slate-200 dark:border-zinc-700 shrink-0 overflow-hidden shadow-2xs relative group">
                                    <HardwareImage
                                        src={isEditing ? (editData.image_url || device.image_clip_url || device.image_url) : (device.image_clip_url || device.image_url)}
                                        alt={`${device.brand} ${device.model}`}
                                        className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
                                    />
                                    {device.techspecs_id && (
                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] text-white font-mono font-semibold">
                                            TechSpecs
                                        </div>
                                    )}
                                </div>

                                {/* Hero Metadata & Copyable Identifiers */}
                                <div className="flex-1 space-y-2.5 text-center sm:text-left min-w-0">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                                            {device.brand} {device.model}
                                        </h2>

                                        {/* Live Pulsing Status Badge */}
                                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-0.5 rounded-full border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                                            <span className="relative flex h-2 w-2">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStatus.dot}`}></span>
                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.dot}`}></span>
                                            </span>
                                            <span>{currentStatus.label}</span>
                                        </div>
                                    </div>

                                    {/* Copyable Identifiers Pill Row */}
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                                        {/* Asset Tag */}
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(isEditing ? editData.asset_tag : device.asset_tag, 'asset_tag')}
                                            title="Click to copy Asset Tag"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition cursor-pointer text-slate-700 dark:text-zinc-300"
                                        >
                                            <RiPriceTag3Line className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                            <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                                                {isEditing ? editData.asset_tag : device.asset_tag}
                                            </span>
                                            {copiedField === 'asset_tag' ? (
                                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                                    <RiCheckLine className="w-3 h-3" />
                                                    <span>Copied</span>
                                                </span>
                                            ) : (
                                                <RiFileCopyLine className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200" />
                                            )}
                                        </button>

                                        {/* Serial Number */}
                                        {(isEditing ? editData.serial_number : device.serial_number) && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(isEditing ? editData.serial_number : device.serial_number, 'serial')}
                                                title="Click to copy Serial Number"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition cursor-pointer text-slate-700 dark:text-zinc-300"
                                            >
                                                <RiBarcodeLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                                <span className="font-mono text-[11px]">
                                                    SN: {isEditing ? editData.serial_number : device.serial_number}
                                                </span>
                                                {copiedField === 'serial' ? (
                                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                                        <RiCheckLine className="w-3 h-3" />
                                                        <span>Copied</span>
                                                    </span>
                                                ) : (
                                                    <RiFileCopyLine className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200" />
                                                )}
                                            </button>
                                        )}

                                        {/* Barcode */}
                                        {(isEditing ? editData.barcode : device.barcode) && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(isEditing ? editData.barcode : device.barcode, 'barcode')}
                                                title="Click to copy Barcode"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition cursor-pointer text-slate-700 dark:text-zinc-300"
                                            >
                                                <RiQrCodeLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                                <span className="font-mono text-[11px]">
                                                    BC: {isEditing ? editData.barcode : device.barcode}
                                                </span>
                                                {copiedField === 'barcode' ? (
                                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                                        <RiCheckLine className="w-3 h-3" />
                                                        <span>Copied</span>
                                                    </span>
                                                ) : (
                                                    <RiFileCopyLine className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200" />
                                                )}
                                            </button>
                                        )}

                                        {/* Location */}
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-400 text-xs">
                                            <RiMapPinLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                                            <span>{(isEditing ? editData.location : device.location) || 'Pool Stock'}</span>
                                        </span>
                                    </div>

                                    {/* Hardware Spec Quick Pills */}
                                    <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-1.5 text-xs">
                                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200/80 dark:border-zinc-700 flex items-center gap-1.5">
                                            <RiCpuLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                            <span>{device.cpu}</span>
                                        </span>
                                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200/80 dark:border-zinc-700 flex items-center gap-1.5">
                                            <RiDatabase2Line className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                            <span>{device.ram_gb} GB RAM</span>
                                        </span>
                                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200/80 dark:border-zinc-700 flex items-center gap-1.5">
                                            <RiHardDrive2Line className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                            <span>{device.storage_gb} GB {device.storage_type}</span>
                                        </span>
                                        {device.gpu && (
                                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200/80 dark:border-zinc-700 flex items-center gap-1.5">
                                                <RiTv2Line className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                                <span>{device.gpu}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial & Contractual Health Metrics Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50">
                                        <RiMoneyDollarCircleLine className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                                            Financial Valuation & Warranty Health
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                            Amortization timeline, net book value, and vendor coverage.
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[11px] px-3 py-1 rounded-xl font-semibold capitalize border self-start sm:self-auto ${
                                    device.warranty_status === 'active'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                                        : device.warranty_status === 'expiring_soon'
                                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                                }`}>
                                    Warranty: {device.warranty_status ? device.warranty_status.replace('_', ' ') : 'Not Recorded'}
                                </span>
                            </div>

                            {/* 4 Financial Tiles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Purchase Cost</dt>
                                    <dd className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-1">
                                        ₱{Number(purchaseCost || 65000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                                        {device.purchase_date ? `Date: ${device.purchase_date}` : `Acquired: ${device.year_acquired}`}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Current Book Value</dt>
                                    <dd className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                        ₱{Number(bookValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                                        Depr: {device.depreciation_rate_percent || 20}%/yr
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Vendor & Sourcing</dt>
                                    <dd className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-1 truncate">
                                        {device.vendor || 'Direct Purchase'}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate block mt-0.5">
                                        {device.barcode ? `BC: ${device.barcode}` : 'Barcode N/A'}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                                    <dt className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Warranty Expiration</dt>
                                    <dd className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-1">
                                        {device.warranty_expiry || 'Not Recorded'}
                                    </dd>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5 font-medium">
                                        {device.days_until_warranty_expiry !== null && device.days_until_warranty_expiry !== undefined
                                            ? device.days_until_warranty_expiry > 0
                                                ? `${device.days_until_warranty_expiry} days remaining`
                                                : `${Math.abs(device.days_until_warranty_expiry)} days expired`
                                            : 'No date on record'}
                                    </span>
                                </div>
                            </div>

                            {/* Depreciation Visual Meter */}
                            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Amortization & Residual Value Ratio</span>
                                    <span className="font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                                        {deprPercent}% Depreciated ({retainedPercent}% Residual Book Value)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden flex">
                                    <div
                                        style={{ width: `${retainedPercent}%` }}
                                        className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                                        title={`Retained Book Value: ${retainedPercent}%`}
                                    />
                                    <div
                                        style={{ width: `${deprPercent}%` }}
                                        className="bg-slate-400/80 dark:bg-zinc-500 h-full rounded-r-full transition-all duration-500"
                                        title={`Depreciated: ${deprPercent}%`}
                                    />
                                </div>
                            </div>

                            {/* Enterprise SLA Shield Banner */}
                            {device.contract_sla && (
                                <div className="mt-3.5 p-3 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/30 border border-[#026eff]/15 dark:border-[#031a40]/50 text-xs flex items-center justify-between text-[#031a40] dark:text-[#38bdf8]">
                                    <div className="flex items-center gap-2.5">
                                        <RiShieldCheckLine className="w-5 h-5 text-[#026eff] dark:text-[#38bdf8] shrink-0" />
                                        <div>
                                            <span className="font-bold text-[#026eff] dark:text-[#38bdf8] uppercase tracking-wider text-[10px] mr-2">Enterprise SLA Guarantee</span>
                                            <span className="font-medium text-slate-800 dark:text-zinc-200">{device.contract_sla}</span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#026eff] dark:text-[#38bdf8] hidden sm:inline">Active Policy</span>
                                </div>
                            )}
                        </div>

                        {/* Hardware Specifications Profile OR In-Place Asset Edit Form */}
                        {isEditing ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-2xs">
                                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 mb-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
                                            <span className="w-6 h-6 rounded-lg bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] flex items-center justify-center text-xs font-bold border border-[#026eff]/20">
                                                <RiEditLine className="w-3.5 h-3.5" />
                                            </span>
                                            Edit Asset Record
                                        </h3>
                                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                            {device.asset_tag}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                        Update physical tagging, serial number, barcode, facility placement, operational condition, and photo.
                                    </p>
                                </div>

                                <form id="edit-device-form" onSubmit={handleUpdate} className="space-y-4">
                                    {/* Grid 1: Asset Identification & Location */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Asset Tag <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.asset_tag}
                                                onChange={(e) => setEditData('asset_tag', e.target.value.toUpperCase())}
                                                placeholder="e.g. LAP-023"
                                                className={`w-full text-sm font-mono font-bold tracking-wider rounded-xl border ${
                                                    editErrors.asset_tag
                                                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 text-rose-900 dark:text-rose-100'
                                                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                                                } placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition`}
                                                required
                                            />
                                            {editErrors.asset_tag && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                    <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{editErrors.asset_tag}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Serial Number
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.serial_number}
                                                onChange={(e) => setEditData('serial_number', e.target.value)}
                                                placeholder="e.g. C02G45XP19F3"
                                                className={`w-full text-sm font-mono rounded-xl border ${
                                                    editErrors.serial_number
                                                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 text-rose-900 dark:text-rose-100'
                                                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                                                } placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition`}
                                            />
                                            {editErrors.serial_number && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                    <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{editErrors.serial_number}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Barcode
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.barcode}
                                                onChange={(e) => setEditData('barcode', e.target.value)}
                                                placeholder="e.g. 748291038472"
                                                className={`w-full text-sm font-mono rounded-xl border ${
                                                    editErrors.barcode
                                                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 text-rose-900 dark:text-rose-100'
                                                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                                                } placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition`}
                                            />
                                            {editErrors.barcode && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                    <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{editErrors.barcode}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Physical Location
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.location}
                                                onChange={(e) => setEditData('location', e.target.value)}
                                                placeholder="e.g. Floor 3 - IT Storage Room"
                                                className={`w-full text-sm rounded-xl border ${
                                                    editErrors.location
                                                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 text-rose-900 dark:text-rose-100'
                                                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                                                } placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition`}
                                            />
                                            {editErrors.location && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                    <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{editErrors.location}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grid 2: Physical Condition & Fleet Availability Status */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Physical Condition <span className="text-rose-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={editData.condition}
                                                onChange={(val) => setEditData('condition', val)}
                                                options={conditionOptions}
                                                placeholder="Select physical condition..."
                                                size="md"
                                                className="w-full"
                                            />
                                            {editErrors.condition && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                    <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{editErrors.condition}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Fleet Availability Status <span className="text-rose-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={editData.status}
                                                onChange={(val) => setEditData('status', val)}
                                                options={statusOptions}
                                                placeholder="Select fleet status..."
                                                size="md"
                                                className="w-full"
                                            />
                                            {editErrors.status && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                    <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{editErrors.status}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 3: Image URL + Auto-Fetch Accurate Photo */}
                                    <div className="space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                                Device Image URL
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleFetchHardwarePhoto}
                                                disabled={fetchingPhoto}
                                                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                                            >
                                                <RiSparklingLine className="w-3.5 h-3.5" />
                                                {fetchingPhoto ? (
                                                    <span>Searching Wikimedia...</span>
                                                ) : (
                                                    <span>Auto-Fetch Accurate Photo</span>
                                                )}
                                            </button>
                                        </div>
                                        <input
                                            type="url"
                                            value={editData.image_url}
                                            onChange={(e) => setEditData('image_url', e.target.value)}
                                            placeholder="https://... (Auto-fetch via Wikimedia / TechSpecs or enter custom URL)"
                                            className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        />
                                        {photoNotice && (
                                            <p className={`text-xs font-medium ${
                                                photoNotice.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                                                photoNotice.type === 'error' ? 'text-rose-600 dark:text-rose-400' :
                                                'text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {photoNotice.message}
                                            </p>
                                        )}
                                        {editErrors.image_url && (
                                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                <span>{editErrors.image_url}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Section 4: Internal Audit Notes */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                                Internal Audit Notes
                                            </label>
                                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">Optional internal remarks</span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            value={editData.notes}
                                            onChange={(e) => setEditData('notes', e.target.value)}
                                            placeholder="Peripheral serial numbers, physical condition notes, special BIOS configurations, or intake inspection remarks..."
                                            className={`w-full text-sm rounded-xl border ${
                                                editErrors.notes
                                                    ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 text-rose-900 dark:text-rose-100'
                                                    : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                                            } placeholder-slate-400 dark:placeholder-zinc-500 p-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition`}
                                        />
                                        {editErrors.notes && (
                                            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                <RiErrorWarningLine className="w-3.5 h-3.5 shrink-0" />
                                                <span>{editErrors.notes}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="h-8 inline-flex items-center gap-1.5 px-4 rounded-xl border border-slate-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition shadow-2xs cursor-pointer"
                                        >
                                            <RiCloseLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                            <span>Discard</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateProcessing}
                                            className="h-8 inline-flex items-center gap-1.5 px-5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                                        >
                                            {updateProcessing ? (
                                                <>
                                                    <svg className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RiSaveLine className="w-4 h-4" />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/50 text-[#026eff] dark:text-[#38bdf8] flex items-center justify-center border border-[#026eff]/20 dark:border-[#026eff]/40">
                                            <RiCpuLine className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                                                Hardware Specifications & Health Profile
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                Core architecture, computing capacity, and physical rating.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs font-semibold text-[#026eff] dark:text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <RiEditLine className="w-3.5 h-3.5" />
                                        <span>Edit Asset</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                                    {/* CPU Card */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                                            <RiCpuLine className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Processor (CPU)</dt>
                                            <dd className="font-bold text-slate-900 dark:text-zinc-100 text-xs mt-0.5 truncate">{device.cpu}</dd>
                                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] capitalize">
                                                {device.cpu_tier} Performance Tier
                                            </span>
                                        </div>
                                    </div>

                                    {/* RAM Card */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                                            <RiDatabase2Line className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider">System Memory</dt>
                                            <dd className="font-bold text-slate-900 dark:text-zinc-100 text-xs mt-0.5">{device.ram_gb} GB Unified RAM</dd>
                                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                                                High-Speed Bandwidth
                                            </span>
                                        </div>
                                    </div>

                                    {/* Storage Card */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                                            <RiHardDrive2Line className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Storage Capacity</dt>
                                            <dd className="font-bold text-slate-900 dark:text-zinc-100 text-xs mt-0.5">{device.storage_gb} GB {device.storage_type}</dd>
                                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                                                Solid State Drive
                                            </span>
                                        </div>
                                    </div>

                                    {/* GPU Card */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                                            <RiTv2Line className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <dt className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Graphics Accelerator</dt>
                                            <dd className="font-bold text-slate-900 dark:text-zinc-100 text-xs mt-0.5 truncate">{device.gpu || 'Integrated Silicon GPU'}</dd>
                                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 capitalize">
                                                {device.gpu_tier} Tier
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Condition Health Meter */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <RiPulseLine className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                                Physical Health & Integrity
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${activeCondition.badgeBg} ${activeCondition.textColor} ${activeCondition.badgeBorder}`}>
                                            {activeCondition.label} ({activeCondition.scoreText})
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                                        <div className={`${activeCondition.barColor} ${activeCondition.barWidth} h-full rounded-full transition-all duration-500`} />
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                        {activeCondition.desc}
                                    </p>
                                </div>

                                {device.notes && (
                                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-xs text-slate-600 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-800 flex items-start gap-2">
                                        <RiInformationLine className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-zinc-200">Internal Audit Notes:</span> {device.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Maintenance & Servicing History Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                                        Maintenance & Servicing History
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Repairs, hardware upgrades, and performance assessments.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(true)}
                                    className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition shadow-2xs cursor-pointer"
                                >
                                    <RiToolsLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>Log Servicing</span>
                                </button>
                            </div>

                            {(!device.maintenance_logs || device.maintenance_logs.length === 0) ? (
                                <div className="py-6 px-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
                                    No maintenance activities recorded for this asset.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {device.maintenance_logs.map((log) => (
                                        <div key={log.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 text-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                                                        log.type === 'repair' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60' :
                                                        log.type === 'upgrade' ? 'bg-[#026eff]/15 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] border-[#026eff]/20' :
                                                        'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                                                    }`}>
                                                        {log.type}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{log.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider border ${
                                                        log.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60' :
                                                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                                                    }`}>
                                                        {log.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="font-mono font-black text-slate-900 dark:text-zinc-100 text-sm">
                                                        ₱{Number(log.cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {log.status !== 'completed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenUpdateLog(log)}
                                                            className="text-[#026eff] dark:text-[#38bdf8] font-bold hover:underline cursor-pointer text-xs"
                                                        >
                                                            Assess & Close
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">{log.description}</p>
                                            
                                            {log.performance_assessment && (
                                                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                                                    <RiCheckDoubleLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Performance Impact Assessment:</span> {log.performance_assessment}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-3 flex items-center justify-between border-t border-slate-200/50 dark:border-zinc-700/50 pt-2 font-medium">
                                                <span>Technician: {log.performed_by || 'Internal IT Services'}</span>
                                                <span>Started: {new Date(log.started_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lifecycle Audit Trail */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                                Lifecycle Transition Audit Trail
                            </h3>
                            {(!device.lifecycle_events || device.lifecycle_events.length === 0) ? (
                                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No transition events recorded.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                                    {device.lifecycle_events.map((evt) => (
                                        <div key={evt.id} className="py-3 flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                                                    <span className="text-slate-500">Phase Transition:</span>
                                                    <span className="uppercase text-slate-600 dark:text-zinc-400 font-mono text-[11px]">{evt.from_stage}</span>
                                                    <RiArrowRightLine className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="uppercase font-bold text-[#026eff] dark:text-[#38bdf8] font-mono text-[11px]">{evt.to_stage}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-zinc-400">{evt.notes}</p>
                                                <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                    Authorized By: {evt.user?.name || 'IT System Administrator'}
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 whitespace-nowrap ml-3">
                                                {new Date(evt.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Current Allocation & Historical Allocations */}
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
                                Current Custodian Allocation
                            </h3>
                            {device.active_assignment?.employee ? (
                                <div className="p-4 rounded-xl bg-[#026eff]/10 dark:bg-[#031a40]/30 border border-[#026eff]/15 dark:border-[#031a40]/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#026eff] text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                                            {device.active_assignment.employee.name?.substring(0, 2).toUpperCase() || 'EM'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#026eff] dark:text-[#38bdf8]">
                                                Assigned Custodian
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate">
                                                {device.active_assignment.employee.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                                {device.active_assignment.employee.department}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-[#026eff]/15 dark:border-[#031a40]/50 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                                            Assigned: {new Date(device.active_assignment.assigned_at).toLocaleDateString()}
                                        </span>
                                        {device.active_assignment.match_score && (
                                            <span className="font-bold text-[#026eff] dark:text-[#38bdf8] text-[11px] px-2 py-0.5 rounded-md bg-[#026eff]/15 dark:bg-[#031a40]/60">
                                                Fit: {Math.round(device.active_assignment.match_score * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto font-bold text-sm shadow-2xs">
                                        <RiCheckLine className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">Available Pool Unit</div>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                            Asset is idle in warehouse inventory and unassigned.
                                        </p>
                                    </div>
                                    <Link
                                        href={route('match.index')}
                                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-2xs"
                                    >
                                        <RiEqualizerLine className="w-4 h-4" />
                                        <span>Assign via Match Engine</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Historical Allocations */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                                Historical Custodians
                            </h3>
                            {(!device.assignments || device.assignments.length === 0) ? (
                                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No past assignments logged.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                                    {device.assignments.map((asg) => (
                                        <div key={asg.id} className="py-2.5 space-y-1">
                                            <div className="flex items-center justify-between font-medium">
                                                <span className="text-slate-900 dark:text-zinc-100 font-semibold">{asg.employee?.name}</span>
                                                {asg.match_score && (
                                                    <span className="text-slate-500 text-[11px] font-mono">
                                                        {Math.round(asg.match_score * 100)}% fit
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                {new Date(asg.assigned_at).toLocaleDateString()}
                                                {asg.unassigned_at && ` — ${new Date(asg.unassigned_at).toLocaleDateString()}`}
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
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 mb-1">Target Lifecycle Stage</label>
                                <CustomSelect
                                    value={lifecycleData.to_stage}
                                    onChange={(val) => setLifecycleData('to_stage', val)}
                                    options={lifecycleStageOptions}
                                    placeholder="Select lifecycle stage..."
                                    className="w-full"
                                />
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
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 mb-1">Activity Type</label>
                                    <CustomSelect
                                        value={maintData.type}
                                        onChange={(val) => setMaintData('type', val)}
                                        options={maintTypeOptions}
                                        placeholder="Select type..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                                        Cost (₱) <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
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
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                                    Title <span className="text-rose-500 font-bold ml-0.5">*</span>
                                </label>
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
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                                    Description of Work <span className="text-rose-500 font-bold ml-0.5">*</span>
                                </label>
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
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 mb-1">Status</label>
                                    <CustomSelect
                                        value={maintData.status}
                                        onChange={(val) => setMaintData('status', val)}
                                        options={maintStatusOptions}
                                        placeholder="Select status..."
                                        className="w-full"
                                    />
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
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                                        Final Cost (₱) <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
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
                                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                                        Completion Date <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
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
                                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                                    Performance Assessment <span className="text-rose-500 font-bold ml-0.5">*</span>
                                </label>
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
