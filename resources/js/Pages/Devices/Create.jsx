import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function DevicesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        asset_tag: '',
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
        condition: 'excellent',
        status: 'available',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('devices.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Register Device</h1>
                        <p className="text-sm text-slate-500 mt-1">Enroll a new hardware unit into authoritative inventory.</p>
                    </div>
                    <Link
                        href={route('devices.index')}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        &larr; Back to Inventory
                    </Link>
                </div>
            }
        >
            <Head title="Register Device - SpecMatch" />

            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Asset Tag */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Asset Tag *</label>
                            <input
                                type="text"
                                value={data.asset_tag}
                                onChange={(e) => setData('asset_tag', e.target.value.toUpperCase())}
                                placeholder="e.g. LAP-042"
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                                required
                            />
                            {errors.asset_tag && <p className="mt-1 text-xs text-rose-600">{errors.asset_tag}</p>}
                        </div>

                        {/* Device Type */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Device Type *</label>
                            <select
                                value={data.device_type}
                                onChange={(e) => setData('device_type', e.target.value)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="laptop">Laptop</option>
                                <option value="desktop">Desktop</option>
                            </select>
                            {errors.device_type && <p className="mt-1 text-xs text-rose-600">{errors.device_type}</p>}
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Brand *</label>
                            <input
                                type="text"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                placeholder="e.g. Dell, Apple, Lenovo"
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                            {errors.brand && <p className="mt-1 text-xs text-rose-600">{errors.brand}</p>}
                        </div>

                        {/* Model */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Model *</label>
                            <input
                                type="text"
                                value={data.model}
                                onChange={(e) => setData('model', e.target.value)}
                                placeholder="e.g. ThinkPad T14s, MacBook Pro"
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                            {errors.model && <p className="mt-1 text-xs text-rose-600">{errors.model}</p>}
                        </div>

                        {/* CPU */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Processor (CPU) *</label>
                            <input
                                type="text"
                                value={data.cpu}
                                onChange={(e) => setData('cpu', e.target.value)}
                                placeholder="e.g. Intel Core i7-13700H, Apple M3"
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                            {errors.cpu && <p className="mt-1 text-xs text-rose-600">{errors.cpu}</p>}
                        </div>

                        {/* CPU Tier */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">CPU Tier *</label>
                            <select
                                value={data.cpu_tier}
                                onChange={(e) => setData('cpu_tier', e.target.value)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="entry">Entry (Celeron, i3, older quad-core)</option>
                                <option value="mid">Mid (Core i5, Ryzen 5, Apple base)</option>
                                <option value="high">High (Core i7/i9, Ryzen 7/9, M3 Pro/Max)</option>
                                <option value="workstation">Workstation (Xeon, Threadripper)</option>
                            </select>
                            {errors.cpu_tier && <p className="mt-1 text-xs text-rose-600">{errors.cpu_tier}</p>}
                        </div>

                        {/* RAM */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">RAM (GB) *</label>
                            <input
                                type="number"
                                min="1"
                                value={data.ram_gb}
                                onChange={(e) => setData('ram_gb', parseInt(e.target.value) || 0)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                            {errors.ram_gb && <p className="mt-1 text-xs text-rose-600">{errors.ram_gb}</p>}
                        </div>

                        {/* Storage Type & GB */}
                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Storage (GB) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.storage_gb}
                                    onChange={(e) => setData('storage_gb', parseInt(e.target.value) || 0)}
                                    className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Disk Type *</label>
                                <select
                                    value={data.storage_type}
                                    onChange={(e) => setData('storage_type', e.target.value)}
                                    className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="SSD">SSD</option>
                                    <option value="HDD">HDD</option>
                                </select>
                            </div>
                        </div>

                        {/* GPU Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Graphics (GPU)</label>
                            <input
                                type="text"
                                value={data.gpu}
                                onChange={(e) => setData('gpu', e.target.value)}
                                placeholder="e.g. NVIDIA RTX 4070, Intel Iris Xe"
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* GPU Tier */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">GPU Tier *</label>
                            <select
                                value={data.gpu_tier}
                                onChange={(e) => setData('gpu_tier', e.target.value)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="none">None</option>
                                <option value="integrated">Integrated (Intel UHD/Iris, Radeon 780M)</option>
                                <option value="dedicated-entry">Dedicated Entry (GTX 1650, RTX 3050)</option>
                                <option value="dedicated-high">Dedicated High (RTX 4070+, Ada, A-series)</option>
                            </select>
                        </div>

                        {/* Year Acquired */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Year Acquired *</label>
                            <input
                                type="number"
                                min="2000"
                                max={new Date().getFullYear() + 1}
                                value={data.year_acquired}
                                onChange={(e) => setData('year_acquired', parseInt(e.target.value) || 2024)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Condition *</label>
                            <select
                                value={data.condition}
                                onChange={(e) => setData('condition', e.target.value)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="needs_repair">Needs Repair</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Inventory Status *</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="available">Available (Idle)</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_repair">In Repair</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Internal Notes</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Battery condition, physical defects, warranty info..."
                            className="mt-1.5 w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('devices.index')}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Registering...' : 'Register Device'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
