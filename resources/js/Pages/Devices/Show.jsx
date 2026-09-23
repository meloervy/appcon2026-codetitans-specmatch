import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function DevicesShow({ device }) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        asset_tag: device.asset_tag,
        device_type: device.device_type,
        brand: device.brand,
        model: device.model,
        cpu: device.cpu,
        cpu_tier: device.cpu_tier,
        ram_gb: device.ram_gb,
        storage_type: device.storage_type,
        storage_gb: device.storage_gb,
        gpu: device.gpu || '',
        gpu_tier: device.gpu_tier,
        year_acquired: device.year_acquired,
        condition: device.condition,
        status: device.status,
        notes: device.notes || '',
    });

    const { post: postRetire } = useForm();

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('devices.update', device.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleRetire = () => {
        if (confirm(`Are you sure you want to retire ${device.asset_tag}? This will unassign it from any user and mark it retired.`)) {
            postRetire(route('devices.retire', device.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xl font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-200">
                            {device.asset_tag}
                        </span>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{device.brand} {device.model}</h1>
                            <p className="text-xs text-slate-500 capitalize">{device.device_type} • Acquired {device.year_acquired}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('devices.index')}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            &larr; Back
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-3.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Specs'}
                        </button>
                        {device.status !== 'retired' && (
                            <button
                                type="button"
                                onClick={handleRetire}
                                className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                                Retire Unit
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${device.asset_tag} - SpecMatch`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Specs Card / Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    {isEditing ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                            <h3 className="font-bold text-slate-900 mb-4">Edit Hardware Specification</h3>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">Asset Tag</label>
                                        <input
                                            type="text"
                                            value={data.asset_tag}
                                            onChange={(e) => setData('asset_tag', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">Device Type</label>
                                        <select
                                            value={data.device_type}
                                            onChange={(e) => setData('device_type', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        >
                                            <option value="laptop">Laptop</option>
                                            <option value="desktop">Desktop</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">Brand</label>
                                        <input
                                            type="text"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">Model</label>
                                        <input
                                            type="text"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">CPU</label>
                                        <input
                                            type="text"
                                            value={data.cpu}
                                            onChange={(e) => setData('cpu', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">CPU Tier</label>
                                        <select
                                            value={data.cpu_tier}
                                            onChange={(e) => setData('cpu_tier', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        >
                                            <option value="entry">Entry</option>
                                            <option value="mid">Mid</option>
                                            <option value="high">High</option>
                                            <option value="workstation">Workstation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">RAM (GB)</label>
                                        <input
                                            type="number"
                                            value={data.ram_gb}
                                            onChange={(e) => setData('ram_gb', parseInt(e.target.value) || 0)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">Storage (GB)</label>
                                        <input
                                            type="number"
                                            value={data.storage_gb}
                                            onChange={(e) => setData('storage_gb', parseInt(e.target.value) || 0)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">GPU Tier</label>
                                        <select
                                            value={data.gpu_tier}
                                            onChange={(e) => setData('gpu_tier', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        >
                                            <option value="none">None</option>
                                            <option value="integrated">Integrated</option>
                                            <option value="dedicated-entry">Dedicated Entry</option>
                                            <option value="dedicated-high">Dedicated High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 w-full text-sm rounded-xl border-slate-200"
                                        >
                                            <option value="available">Available</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="in_repair">In Repair</option>
                                            <option value="retired">Retired</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 rounded-xl border text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-5">Hardware Profile</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div className="border-b border-slate-100 pb-3">
                                    <dt className="text-xs text-slate-400 uppercase font-semibold">Processor</dt>
                                    <dd className="font-semibold text-slate-900 mt-0.5">{device.cpu}</dd>
                                    <dd className="text-xs text-indigo-600 capitalize font-medium">{device.cpu_tier} Tier</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <dt className="text-xs text-slate-400 uppercase font-semibold">Memory (RAM)</dt>
                                    <dd className="font-semibold text-slate-900 mt-0.5">{device.ram_gb} GB</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <dt className="text-xs text-slate-400 uppercase font-semibold">Storage</dt>
                                    <dd className="font-semibold text-slate-900 mt-0.5">{device.storage_gb} GB {device.storage_type}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <dt className="text-xs text-slate-400 uppercase font-semibold">Graphics</dt>
                                    <dd className="font-semibold text-slate-900 mt-0.5">{device.gpu || 'N/A'}</dd>
                                    <dd className="text-xs text-slate-500 capitalize">{device.gpu_tier}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <dt className="text-xs text-slate-400 uppercase font-semibold">Condition</dt>
                                    <dd className="font-semibold capitalize text-slate-900 mt-0.5">{device.condition.replace('_', ' ')}</dd>
                                </div>
                                <div className="border-b border-slate-100 pb-3">
                                    <dt className="text-xs text-slate-400 uppercase font-semibold">Inventory State</dt>
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
                                    <span className="font-bold text-slate-700">Notes:</span> {device.notes}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assignment History */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <h3 className="text-base font-bold text-slate-900 mb-4">Assignment History</h3>
                        {device.assignments.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No historical assignments logged for this device.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {device.assignments.map((asg) => (
                                    <div key={asg.id} className="py-3 flex items-center justify-between text-sm">
                                        <div>
                                            <span className="font-semibold text-slate-900">{asg.employee?.name}</span>
                                            <span className="text-xs text-slate-400 ml-2">({asg.employee?.department})</span>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                Assigned: {new Date(asg.assigned_at).toLocaleDateString()}
                                                {asg.unassigned_at && ` — Returned: ${new Date(asg.unassigned_at).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {asg.match_score && (
                                                <span className="text-xs font-bold text-slate-600">
                                                    Score: {Math.round(asg.match_score * 100)}%
                                                </span>
                                            )}
                                            <div className="text-[10px] uppercase font-semibold text-slate-400">
                                                {asg.assignment_source.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Allocation Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Current Allocation</h3>
                        {device.active_assignment?.employee ? (
                            <div>
                                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Assigned To</div>
                                    <div className="font-bold text-slate-900 text-lg mt-1">{device.active_assignment.employee.name}</div>
                                    <div className="text-xs text-slate-500">{device.active_assignment.employee.department}</div>
                                    <div className="mt-3 text-xs text-slate-500">
                                        Since {new Date(device.active_assignment.assigned_at).toLocaleDateString()}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
