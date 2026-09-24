import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import FileUpload from '@/Components/ui/FileUpload';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import {
    RiArrowLeftLine,
    RiBarcodeLine,
    RiCheckLine,
    RiCloseLine,
    RiCpuLine,
    RiImageAddLine,
    RiLoader4Line,
    RiMapPinLine,
    RiMoneyDollarCircleLine,
    RiPriceTag3Line,
    RiPulseLine,
    RiSearchLine,
    RiSparklingLine,
} from 'react-icons/ri';

const deviceTypeOptions = [
    { value: 'laptop', label: 'Laptop (Mobile Workstation / Portable)' },
    { value: 'desktop', label: 'Desktop / Workstation (Stationary)' },
];

const cpuTierOptions = [
    { value: 'entry', label: 'Entry (Celeron, Core i3, older quad-core)' },
    { value: 'mid', label: 'Mid (Core i5, Ryzen 5, Apple base)' },
    { value: 'high', label: 'High (Core i7/i9, Ryzen 7/9, M3 Pro/Max)' },
    { value: 'workstation', label: 'Workstation (Xeon, Threadripper)' },
];

const storageTypeOptions = [
    { value: 'SSD', label: 'SSD (NVMe / Solid State)' },
    { value: 'HDD', label: 'HDD (Mechanical Hard Drive)' },
];

const gpuTierOptions = [
    { value: 'none', label: 'None' },
    { value: 'integrated', label: 'Integrated (Intel UHD/Iris, Radeon 780M)' },
    { value: 'dedicated-entry', label: 'Dedicated Entry (GTX 1650, RTX 3050)' },
    { value: 'dedicated-high', label: 'Dedicated High (RTX 4070+, Ada, A-series)' },
];

const lifecycleStageOptions = [
    { value: 'acquisition', label: 'Acquisition (Procured / Staging / Intake)' },
    { value: 'deployment', label: 'Deployment (Active In-Service)' },
    { value: 'maintenance', label: 'Maintenance (Servicing / In-Repair)' },
    { value: 'retirement', label: 'Retirement (Decommissioned / Recycled)' },
];

const conditionOptions = [
    { value: 'excellent', label: 'Excellent (Like New / Minimal Wear)' },
    { value: 'good', label: 'Good (Normal Operational Wear)' },
    { value: 'fair', label: 'Fair (Noticeable Scratches / Moderate Wear)' },
    { value: 'needs_repair', label: 'Needs Repair (Degraded Hardware)' },
    { value: 'retired', label: 'Retired (Decommissioned)' },
];

const statusOptions = [
    { value: 'available', label: 'Available (Pool Stockroom)' },
    { value: 'assigned', label: 'Assigned to Staff' },
    { value: 'in_repair', label: 'Under Servicing / In Repair' },
    { value: 'retired', label: 'Retired / Archived' },
];

export default function DevicesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        // Identification
        asset_tag: '',
        serial_number: '',
        barcode: '',
        techspecs_id: '',
        image_url: '',
        // Hardware Specifications
        device_type: 'laptop',
        brand: '',
        model: '',
        cpu: '',
        cpu_tier: 'mid',
        ram_gb: 16,
        storage_type: 'SSD',
        storage_gb: 512,
        gpu: '',
        gpu_tier: 'none',
        year_acquired: new Date().getFullYear(),
        // ITAM Financial & Contractual Tracking
        location: '',
        purchase_cost: '',
        purchase_date: new Date().toISOString().split('T')[0],
        depreciation_rate_percent: 20.0,
        vendor: '',
        warranty_start: new Date().toISOString().split('T')[0],
        warranty_expiry: '',
        contract_sla: '',
        // Operational & Lifecycle
        condition: 'excellent',
        status: 'available',
        lifecycle_stage: 'deployment',
        notes: '',
    });

    // TechSpecs API Integration State
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [autoFilledNotice, setAutoFilledNotice] = useState(null);

    // Hardware Photo Lookup State
    const [fetchingPhoto, setFetchingPhoto] = useState(false);
    const [photoNotice, setPhotoNotice] = useState(null);

    const handleFetchHardwarePhoto = async () => {
        if (!data.brand && !data.model) {
            setPhotoNotice({ type: 'error', message: 'Please enter Brand and Model first before fetching photo.' });
            return;
        }
        setFetchingPhoto(true);
        setPhotoNotice(null);
        try {
            const res = await axios.post(route('hardware.image-lookup'), {
                brand: data.brand,
                model: data.model,
                device_type: data.device_type,
            });
            if (res.data.image_url) {
                setData('image_url', res.data.image_url);
                setPhotoNotice({
                    type: 'success',
                    message: `Found authentic photo from ${res.data.source === 'wikimedia' ? 'Wikimedia Commons' : 'Hardware Registry'}.`,
                });
            } else {
                setPhotoNotice({
                    type: 'info',
                    message: 'No exact photo found in Wikimedia database. You may upload a local image or enter a URL.',
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

    const handleTechSpecsSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery || searchQuery.trim().length < 2) return;

        setSearching(true);
        setApiError(null);
        setSearchResults([]);

        try {
            const res = await axios.post(route('techspecs.search'), {
                query: searchQuery.trim(),
                category: data.device_type === 'desktop' ? 'Desktops' : 'Laptops',
            });

            if (res.data.results && res.data.results.length > 0) {
                setSearchResults(res.data.results);
            } else {
                setSearchResults([]);
                setApiError('No hardware matched this query in TechSpecs catalog.');
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to search TechSpecs catalog.');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectProduct = async (product) => {
        setSelectedProduct(product);
        setLoadingDetails(true);
        setApiError(null);

        try {
            const res = await axios.post(route('techspecs.details'), {
                product_id: product.id,
            });

            if (res.data.success && res.data.specs) {
                const specs = res.data.specs;
                setData((prev) => ({
                    ...prev,
                    brand: specs.brand || prev.brand,
                    model: specs.model || prev.model,
                    cpu: specs.cpu || prev.cpu,
                    cpu_tier: specs.cpu_tier || prev.cpu_tier,
                    ram_gb: specs.ram_gb || prev.ram_gb,
                    storage_type: specs.storage_type || prev.storage_type,
                    storage_gb: specs.storage_gb || prev.storage_gb,
                    gpu: specs.gpu || prev.gpu,
                    gpu_tier: specs.gpu_tier || prev.gpu_tier,
                    year_acquired: specs.year_acquired || prev.year_acquired,
                    techspecs_id: specs.techspecs_id || product.id,
                    image_url: specs.image_url || prev.image_url || '',
                    vendor: prev.vendor || specs.brand,
                }));

                setAutoFilledNotice(`Successfully auto-populated hardware specs for "${specs.brand} ${specs.model}" via TechSpecs API.`);
                setSearchResults([]);
            }
        } catch (err) {
            setApiError('Failed to fetch full specification details for this product.');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('devices.store'));
    };

    // Calculate preview image
    const previewImage = data.image_url || (
        data.brand.toLowerCase().includes('apple')
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Macbook_Pro_M1_16_inch.jpg/800px-Macbook_Pro_M1_16_inch.jpg'
            : data.brand.toLowerCase().includes('dell')
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Dell_XPS_15_9500.jpg/800px-Dell_XPS_15_9500.jpg'
            : data.brand.toLowerCase().includes('lenovo')
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/ThinkPad_T14_Gen_1.jpg/800px-ThinkPad_T14_Gen_1.jpg'
            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Modern_Laptop_Computer.jpg/800px-Modern_Laptop_Computer.jpg'
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                            Register Hardware Asset
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
                            Hardware enrollment with TechSpecs v5 automated specification identification and enterprise ITAM lifecycle tracking.
                        </p>
                    </div>
                    <Link
                        href={route('devices.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition shadow-2xs border border-slate-200/80 dark:border-zinc-700 self-start sm:self-auto"
                    >
                        <RiArrowLeftLine className="w-4 h-4" />
                        <span>Back to Inventory</span>
                    </Link>
                </div>
            }
        >
            <Head title="Register Hardware Asset - SpecMatch" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* TechSpecs API Identification Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-slate-700/60 dark:border-zinc-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#026eff]/30 text-[#38bdf8] rounded-lg border border-[#026eff]/40">
                                    <RiSparklingLine className="w-3.5 h-3.5" />
                                    TechSpecs v5 Catalog API
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Automated Asset Identification</h2>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Search over 180,000+ verified hardware models to auto-fill CPU architecture, RAM, GPU tier, and storage specifications.
                            </p>
                        </div>

                        <form onSubmit={handleTechSpecsSearch} className="flex gap-2 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-72">
                                <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. ThinkPad T14, MacBook Pro 16..."
                                    className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-[#026eff] focus:border-[#026eff] transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching || searchQuery.trim().length < 2}
                                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                {searching ? (
                                    <>
                                        <RiLoader4Line className="animate-spin w-4 h-4" />
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <RiSparklingLine className="w-4 h-4" />
                                        <span>Identify Specs</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {apiError && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
                            <span>{apiError}</span>
                            <button type="button" onClick={() => setApiError(null)} className="text-rose-300 hover:text-white font-bold p-1">
                                <RiCloseLine className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Search Results Dropdown List */}
                    {searchResults.length > 0 && (
                        <div className="mt-4 bg-slate-950/95 border border-slate-700/80 rounded-2xl overflow-hidden divide-y divide-slate-800 shadow-xl">
                            <div className="px-4 py-2.5 bg-white/5 text-xs font-semibold text-[#38bdf8] flex justify-between items-center">
                                <span>Verified Catalog Matches ({searchResults.length})</span>
                                <button type="button" onClick={() => setSearchResults([])} className="text-slate-400 hover:text-white text-xs font-medium">
                                    Dismiss
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                                {searchResults.map((prod) => (
                                    <div
                                        key={prod.id}
                                        className="p-3.5 hover:bg-white/5 transition flex items-center justify-between gap-4"
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-white">
                                                {prod.brand} {prod.model}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                Category: {prod.category || 'Laptop / Workstation'} &bull; Release Year: {prod.release_year || 'Recent'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectProduct(prod)}
                                            disabled={loadingDetails}
                                            className="px-3.5 py-1.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {loadingDetails && selectedProduct?.id === prod.id ? (
                                                <>
                                                    <RiLoader4Line className="animate-spin w-3.5 h-3.5" />
                                                    <span>Populating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RiCheckLine className="w-3.5 h-3.5" />
                                                    <span>Auto-Fill Specs</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {autoFilledNotice && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <RiCheckLine className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{autoFilledNotice}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setAutoFilledNotice(null)}
                                className="text-emerald-300 hover:text-white p-1"
                            >
                                <RiCloseLine className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Registration Form Container */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Identification & Tagging */}
                        <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/40 space-y-5">
                            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-[#026eff]/10 text-[#026eff] font-bold text-xs flex items-center justify-center">1</span>
                                        Asset Identification &amp; Tagging
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Physical barcode tagging, serial identification, and site assignment.</p>
                                </div>
                                <RiPriceTag3Line className="w-5 h-5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Asset Tag <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.asset_tag}
                                        onChange={(e) => setData('asset_tag', e.target.value.toUpperCase())}
                                        placeholder="e.g. LAP-042"
                                        className="w-full text-sm font-mono uppercase rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        required
                                    />
                                    {errors.asset_tag && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.asset_tag}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Serial Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                        placeholder="e.g. C02G45XP19F3"
                                        className="w-full text-sm font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                    {errors.serial_number && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.serial_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Barcode / QR Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        placeholder="e.g. BC-LAP-042"
                                        className="w-full text-sm font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                    {errors.barcode && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.barcode}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Physical Location
                                    </label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g. BGC HQ - Floor 12"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                    {errors.location && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.location}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Hardware Specifications & Media Clip */}
                        <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/40 space-y-5">
                            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 font-bold text-xs flex items-center justify-center">2</span>
                                        Hardware Specifications &amp; Media Clip
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Compute, memory, storage architecture, graphics profile, and device photo.</p>
                                </div>
                                <RiCpuLine className="w-5 h-5 text-violet-500 shrink-0" />
                            </div>

                            {/* Image Clip & Dropzone Row */}
                            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-2xs">
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                    <img
                                        src={previewImage}
                                        alt="Device clip preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Modern_Laptop_Computer.jpg/800px-Modern_Laptop_Computer.jpg';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                            Hardware Media Clip URL
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleFetchHardwarePhoto}
                                            disabled={fetchingPhoto || (!data.brand && !data.model)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#026eff]/10 hover:bg-[#026eff]/20 text-[#026eff] dark:text-[#38bdf8] text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer self-start sm:self-auto"
                                        >
                                            {fetchingPhoto ? (
                                                <>
                                                    <RiLoader4Line className="animate-spin w-3.5 h-3.5" />
                                                    <span>Fetching Photo...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RiImageAddLine className="w-3.5 h-3.5" />
                                                    <span>Auto-Fetch Accurate Photo</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <input
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        placeholder="https://... (Populated automatically via Wikimedia / TechSpecs or enter custom URL)"
                                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
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

                                    {/* Aceternity File Upload Dropzone */}
                                    <div className="pt-1">
                                        <FileUpload
                                            onImageSelect={(dataUrl) => {
                                                setData('image_url', dataUrl);
                                                setPhotoNotice({
                                                    type: 'success',
                                                    message: 'Hardware image attached successfully from local upload!',
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specifications Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Device Type <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.device_type}
                                        onChange={(val) => setData('device_type', val)}
                                        options={deviceTypeOptions}
                                        placeholder="Select device type..."
                                    />
                                    {errors.device_type && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.device_type}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Brand <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        placeholder="e.g. Dell, Apple, Lenovo, HP"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        required
                                    />
                                    {errors.brand && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.brand}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Model <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        placeholder="e.g. ThinkPad T14s, MacBook Pro 16"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        required
                                    />
                                    {errors.model && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.model}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Processor (CPU) <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.cpu}
                                        onChange={(e) => setData('cpu', e.target.value)}
                                        placeholder="e.g. Intel Core i7-13700H, Apple M3 Max"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        required
                                    />
                                    {errors.cpu && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.cpu}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        CPU Tier <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.cpu_tier}
                                        onChange={(val) => setData('cpu_tier', val)}
                                        options={cpuTierOptions}
                                        placeholder="Select CPU tier..."
                                    />
                                    {errors.cpu_tier && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.cpu_tier}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        RAM (GB) <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.ram_gb}
                                        onChange={(e) => setData('ram_gb', parseInt(e.target.value) || 0)}
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        required
                                    />
                                    {errors.ram_gb && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.ram_gb}</p>}
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                            Storage (GB) <span className="text-rose-500 font-bold ml-0.5">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.storage_gb}
                                            onChange={(e) => setData('storage_gb', parseInt(e.target.value) || 0)}
                                            className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                            required
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                            Disk Type <span className="text-rose-500 font-bold ml-0.5">*</span>
                                        </label>
                                        <CustomSelect
                                            value={data.storage_type}
                                            onChange={(val) => setData('storage_type', val)}
                                            options={storageTypeOptions}
                                            placeholder="Type..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Graphics (GPU)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.gpu}
                                        onChange={(e) => setData('gpu', e.target.value)}
                                        placeholder="e.g. NVIDIA RTX 4070, Intel Iris Xe"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        GPU Tier <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.gpu_tier}
                                        onChange={(val) => setData('gpu_tier', val)}
                                        options={gpuTierOptions}
                                        placeholder="Select GPU tier..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Acquisition Year
                                    </label>
                                    <input
                                        type="number"
                                        min="2010"
                                        max="2035"
                                        value={data.year_acquired}
                                        onChange={(e) => setData('year_acquired', parseInt(e.target.value) || new Date().getFullYear())}
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: ITAM Financial & Contractual Tracking */}
                        <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/40 space-y-5">
                            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">3</span>
                                        Financial, Vendor &amp; Warranty Tracking
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Continuous tracking of procurement investment, straight-line depreciation, and SLAs.</p>
                                </div>
                                <RiMoneyDollarCircleLine className="w-5 h-5 text-emerald-500 shrink-0" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Purchase Cost (₱)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_cost}
                                        onChange={(e) => setData('purchase_cost', e.target.value)}
                                        placeholder="e.g. 75000.00"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={(e) => setData('purchase_date', e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Annual Depreciation (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={data.depreciation_rate_percent}
                                        onChange={(e) => setData('depreciation_rate_percent', e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Vendor / Supplier
                                    </label>
                                    <input
                                        type="text"
                                        value={data.vendor}
                                        onChange={(e) => setData('vendor', e.target.value)}
                                        placeholder="e.g. Dell Direct, CDW, Apple"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Warranty Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.warranty_start}
                                        onChange={(e) => setData('warranty_start', e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Warranty Expiration Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.warranty_expiry}
                                        onChange={(e) => setData('warranty_expiry', e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Contractual SLA / Coverage Tier
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contract_sla}
                                        onChange={(e) => setData('contract_sla', e.target.value)}
                                        placeholder="e.g. ProSupport Plus NBD Onsite, AppleCare+ Enterprise"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Lifecycle Stage & Fleet Operations */}
                        <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/40 space-y-5">
                            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center">4</span>
                                        Lifecycle Stage &amp; Operational State
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Asset lifecycle positioning, physical health audit, and stock status.</p>
                                </div>
                                <RiPulseLine className="w-5 h-5 text-amber-500 shrink-0" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Lifecycle Stage <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.lifecycle_stage}
                                        onChange={(val) => setData('lifecycle_stage', val)}
                                        options={lifecycleStageOptions}
                                        placeholder="Select lifecycle stage..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Physical Condition <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.condition}
                                        onChange={(val) => setData('condition', val)}
                                        options={conditionOptions}
                                        placeholder="Select condition..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Fleet Availability Status <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <CustomSelect
                                        value={data.status}
                                        onChange={(val) => setData('status', val)}
                                        options={statusOptions}
                                        placeholder="Select status..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Internal Audit Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Serial numbers on peripherals, special BIOS configurations, or intake inspections..."
                                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
                            <Link
                                href={route('devices.index')}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-sm font-bold text-white shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <RiLoader4Line className="animate-spin w-4 h-4" />
                                        <span>Enrolling Asset...</span>
                                    </>
                                ) : (
                                    <>
                                        <RiCheckLine className="w-4 h-4" />
                                        <span>Enroll Asset into Fleet</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
