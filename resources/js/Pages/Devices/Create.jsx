import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

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
            ? 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80'
            : data.brand.toLowerCase().includes('dell')
            ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80'
            : data.brand.toLowerCase().includes('lenovo')
            ? 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80'
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">Register IT Asset</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Hardware enrollment with automated TechSpecs catalog identification & lifecycle tracking.
                        </p>
                    </div>
                    <Link
                        href={route('devices.index')}
                        className="text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition"
                    >
                        &larr; Back to Inventory
                    </Link>
                </div>
            }
        >
            <Head title="Register IT Asset - SpecMatch" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* TechSpecs API Lookup Card */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/30">
                                    TechSpecs v5 API
                                </span>
                                <h2 className="text-base font-semibold text-white">Automated Asset Identification</h2>
                            </div>
                            <p className="text-xs text-indigo-200/80">
                                Search 180,000+ verified hardware models to auto-fill CPU, RAM, GPU, storage architecture, and tiers.
                            </p>
                        </div>

                        <form onSubmit={handleTechSpecsSearch} className="flex gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="e.g. ThinkPad T14, MacBook Pro, XPS 15"
                                className="w-full sm:w-64 text-xs rounded-xl bg-white/10 border-white/20 text-white placeholder-indigo-200/50 focus:bg-white/20 focus:ring-indigo-400 focus:border-indigo-400"
                            />
                            <button
                                type="submit"
                                disabled={searching || searchQuery.trim().length < 2}
                                className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition flex items-center gap-1.5"
                            >
                                {searching ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Identify
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {apiError && (
                        <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {apiError}
                        </div>
                    )}

                    {/* Search Results Dropdown List */}
                    {searchResults.length > 0 && (
                        <div className="mt-4 bg-slate-900/90 dark:bg-zinc-900/95 border border-white/10 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-white/5">
                            <div className="px-3.5 py-2 bg-white/5 text-[11px] font-semibold text-indigo-200 flex justify-between">
                                <span>TechSpecs Matches ({searchResults.length})</span>
                                <button type="button" onClick={() => setSearchResults([])} className="hover:text-white">&times; Close</button>
                            </div>
                            <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                                {searchResults.map((prod) => (
                                    <div
                                        key={prod.id}
                                        className="p-3 hover:bg-white/10 transition flex items-center justify-between gap-4"
                                    >
                                        <div>
                                            <div className="text-xs font-semibold text-white">
                                                {prod.brand} {prod.model}
                                            </div>
                                            <div className="text-[11px] text-indigo-300/70">
                                                Category: {prod.category || 'Laptop/PC'} &bull; Year: {prod.release_year || 'Recent'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectProduct(prod)}
                                            disabled={loadingDetails}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shrink-0 transition"
                                        >
                                            {loadingDetails && selectedProduct?.id === prod.id ? 'Loading...' : 'Auto-Fill Specs'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {autoFilledNotice && (
                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {autoFilledNotice}
                            </span>
                            <button
                                type="button"
                                onClick={() => setAutoFilledNotice(null)}
                                className="text-emerald-300 hover:text-white font-bold"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Registration Form */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 1. Identification Section */}
                        <div>
                            <div className="border-b border-slate-100 dark:border-zinc-800 pb-2 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                    1. Asset Identification & Tagging
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Physical labeling, serial numbers, and barcode tracking.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Asset Tag *</label>
                                    <input
                                        type="text"
                                        value={data.asset_tag}
                                        onChange={(e) => setData('asset_tag', e.target.value.toUpperCase())}
                                        placeholder="e.g. LAP-023"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                                        required
                                    />
                                    {errors.asset_tag && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.asset_tag}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Serial Number</label>
                                    <input
                                        type="text"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                        placeholder="e.g. C02G45XP19F3"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                                    />
                                    {errors.serial_number && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.serial_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Barcode / QR</label>
                                    <input
                                        type="text"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        placeholder="e.g. BC-LAP-023"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                                    />
                                    {errors.barcode && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.barcode}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Physical Location</label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g. HQ - Level 3 Room 302"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.location && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.location}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Hardware Specifications Section */}
                        <div>
                            <div className="border-b border-slate-100 dark:border-zinc-800 pb-2 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                                    2. Hardware Specifications & Device Image
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Compute, memory, storage, graphics profile, and device photo clip.</p>
                            </div>

                            {/* Image Clip Row */}
                            <div className="mb-4 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                    <img
                                        src={previewImage}
                                        alt="Device clip preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                        Hardware Image Clip URL (TechSpecs or Custom)
                                    </label>
                                    <input
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        placeholder="https://... (Populated automatically by TechSpecs API or enter image URL)"
                                        className="mt-1.5 w-full text-xs rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                                        Display thumbnail for physical inventory audit, inspection, and assignment match cards.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Device Type *</label>
                                    <select
                                        value={data.device_type}
                                        onChange={(e) => setData('device_type', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="laptop">Laptop (Mobile)</option>
                                        <option value="desktop">Desktop / Workstation (Stationary)</option>
                                    </select>
                                    {errors.device_type && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.device_type}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Brand *</label>
                                    <input
                                        type="text"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        placeholder="e.g. Dell, Apple, Lenovo, HP"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.brand && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.brand}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Model *</label>
                                    <input
                                        type="text"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        placeholder="e.g. ThinkPad T14s, MacBook Pro 16"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.model && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.model}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Processor (CPU) *</label>
                                    <input
                                        type="text"
                                        value={data.cpu}
                                        onChange={(e) => setData('cpu', e.target.value)}
                                        placeholder="e.g. Intel Core i7-13700H, Apple M3 Max"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.cpu && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.cpu}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">CPU Tier *</label>
                                    <select
                                        value={data.cpu_tier}
                                        onChange={(e) => setData('cpu_tier', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="entry">Entry (Celeron, Core i3, older quad-core)</option>
                                        <option value="mid">Mid (Core i5, Ryzen 5, Apple base)</option>
                                        <option value="high">High (Core i7/i9, Ryzen 7/9, M3 Pro/Max)</option>
                                        <option value="workstation">Workstation (Xeon, Threadripper)</option>
                                    </select>
                                    {errors.cpu_tier && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.cpu_tier}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">RAM (GB) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.ram_gb}
                                        onChange={(e) => setData('ram_gb', parseInt(e.target.value) || 0)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.ram_gb && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.ram_gb}</p>}
                                </div>

                                <div className="flex gap-2">
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Storage (GB) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.storage_gb}
                                            onChange={(e) => setData('storage_gb', parseInt(e.target.value) || 0)}
                                            className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Disk Type *</label>
                                        <select
                                            value={data.storage_type}
                                            onChange={(e) => setData('storage_type', e.target.value)}
                                            className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="SSD">SSD</option>
                                            <option value="HDD">HDD</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Graphics (GPU)</label>
                                    <input
                                        type="text"
                                        value={data.gpu}
                                        onChange={(e) => setData('gpu', e.target.value)}
                                        placeholder="e.g. NVIDIA RTX 4070, Intel Iris Xe"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">GPU Tier *</label>
                                    <select
                                        value={data.gpu_tier}
                                        onChange={(e) => setData('gpu_tier', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="none">None</option>
                                        <option value="integrated">Integrated (Intel UHD/Iris, Radeon 780M)</option>
                                        <option value="dedicated-entry">Dedicated Entry (GTX 1650, RTX 3050)</option>
                                        <option value="dedicated-high">Dedicated High (RTX 4070+, Ada, A-series)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. ITAM Financial & Contractual Tracking Section */}
                        <div>
                            <div className="border-b border-slate-100 dark:border-zinc-800 pb-2 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    3. Financial, Vendor & Warranty Tracking
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Continuous tracking of procurement investment, straight-line depreciation, and SLAs.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Purchase Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_cost}
                                        onChange={(e) => setData('purchase_cost', e.target.value)}
                                        placeholder="e.g. 1499.00"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={(e) => setData('purchase_date', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Annual Depreciation (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={data.depreciation_rate_percent}
                                        onChange={(e) => setData('depreciation_rate_percent', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Vendor / Supplier</label>
                                    <input
                                        type="text"
                                        value={data.vendor}
                                        onChange={(e) => setData('vendor', e.target.value)}
                                        placeholder="e.g. Dell Direct, CDW, Apple"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Warranty Start</label>
                                    <input
                                        type="date"
                                        value={data.warranty_start}
                                        onChange={(e) => setData('warranty_start', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Warranty Expiration</label>
                                    <input
                                        type="date"
                                        value={data.warranty_expiry}
                                        onChange={(e) => setData('warranty_expiry', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Contractual SLA / Coverage Tier</label>
                                    <input
                                        type="text"
                                        value={data.contract_sla}
                                        onChange={(e) => setData('contract_sla', e.target.value)}
                                        placeholder="e.g. ProSupport Plus NBD Onsite, AppleCare+ Enterprise"
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Lifecycle & Operational Status Section */}
                        <div>
                            <div className="border-b border-slate-100 dark:border-zinc-800 pb-2 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                                    4. Lifecycle Stage & Operational State
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Asset lifecycle positioning and physical health.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Lifecycle Stage *</label>
                                    <select
                                        value={data.lifecycle_stage}
                                        onChange={(e) => setData('lifecycle_stage', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                    >
                                        <option value="acquisition">Acquisition (Procured / Staging)</option>
                                        <option value="deployment">Deployment (Active In-Service)</option>
                                        <option value="maintenance">Maintenance (Servicing / Repair)</option>
                                        <option value="retirement">Retirement (Decommissioned)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Physical Condition *</label>
                                    <select
                                        value={data.condition}
                                        onChange={(e) => setData('condition', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="needs_repair">Needs Repair</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Fleet Availability Status *</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="available">Available (Pool Stock)</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="in_repair">In Repair</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Internal Audit Notes</label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Serial numbers on peripherals, special BIOS configurations, or intake inspections..."
                                    className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                            <Link
                                href={route('devices.index')}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
                            >
                                {processing ? 'Enrolling Asset...' : 'Enroll Asset into Inventory'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
