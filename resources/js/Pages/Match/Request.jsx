import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function MatchRequest({ employees, role_profiles, recent_requests, selected_employee_id }) {
    const [employeeId, setEmployeeId] = useState(selected_employee_id || '');
    const [rawInput, setRawInput] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [isRanking, setIsRanking] = useState(false);
    const [extracted, setExtracted] = useState(null);
    const [rankedResults, setRankedResults] = useState(null);
    const [procurementRecommended, setProcurementRecommended] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const { post: postAssign, processing: isAssigning } = useForm();

    // When an employee is selected with a pre-configured role profile, offer quick template fill
    const selectedEmployee = employees.find((e) => e.id === parseInt(employeeId));

    useEffect(() => {
        if (selectedEmployee?.role_profile) {
            const p = selectedEmployee.role_profile;
            setRawInput(`Assigning hardware for ${selectedEmployee.name} (${p.name}). ${p.description || ''} Requires ${p.min_ram_gb}GB RAM, ${p.min_storage_gb}GB storage, ${p.portability_required ? 'laptop for mobility' : 'desktop'}.`);
        }
    }, [employeeId]);

    const examplePrompts = [
        "New senior video editor joining marketing. Needs to edit 4K footage in Premiere/After Effects and travels frequently between shoots.",
        "Backend software engineer working with Docker microservices, compiling Rust and running local databases. Needs 32GB RAM and portability.",
        "Data analyst doing heavy SQL querying and Tableau visualization from office desk. No GPU needed, prefers desktop.",
        "HR specialist handling spreadsheets, web apps, and emails. Basic productivity laptop.",
    ];

    const handleExtract = async () => {
        if (!rawInput.trim()) return;
        setIsExtracting(true);
        setErrorMsg(null);
        try {
            const res = await axios.post(route('match.extract'), {
                raw_input: rawInput,
                employee_id: employeeId || null,
            });
            if (res.data.success) {
                setExtracted(res.data.requirements);
                // Automatically run Layer 2 ranking
                await handleRank(res.data.requirements);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Requirement extraction failed. Please review your input.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleRank = async (requirementsToRank = extracted) => {
        if (!requirementsToRank) return;
        setIsRanking(true);
        setErrorMsg(null);
        try {
            const res = await axios.post(route('match.rank'), {
                requirements: requirementsToRank,
            });
            setRankedResults(res.data.results);
            setProcurementRecommended(res.data.procurement_recommended);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Device ranking failed.');
        } finally {
            setIsRanking(false);
        }
    };

    const handleAssign = (device, score) => {
        if (!employeeId) {
            alert('Please select an employee in the dropdown before completing assignment.');
            return;
        }

        postAssign(route('match.assign'), {
            data: {
                device_id: device.id,
                employee_id: employeeId,
                assignment_source: 'ai_recommended',
                match_score: score,
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">AI-Powered Matching Engine</h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Two-layer intelligent pipeline: Natural language requirement extraction (Gemini) + Deterministic fleet ranking.
                    </p>
                </div>
            }
        >
            <Head title="Match Engine - SpecMatch" />

            {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-300">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Request & Extraction Input (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Step 1: Employee & Request */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Request Specification</h2>
                        </div>

                        {/* Employee Select */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                Target Employee
                            </label>
                            <select
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">-- Choose employee (optional for ad-hoc search) --</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.department}) {emp.role_profile ? `— ${emp.role_profile.name}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Text Request Input */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                    Natural Language Need
                                </label>
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500">Free-form employee request</span>
                            </div>
                            <textarea
                                rows={4}
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                                placeholder="Describe the employee's role, software needs, performance demands, and mobility requirements..."
                                className="mt-1.5 w-full text-sm rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Quick Prompts */}
                        <div className="mt-3">
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Example Templates:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {examplePrompts.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setRawInput(p)}
                                        className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-zinc-750 transition line-clamp-1"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleExtract}
                            disabled={isExtracting || !rawInput.trim()}
                            className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {isExtracting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Analyzing via Gemini AI...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Layer 1: Extract Requirements
                                </>
                            )}
                        </button>
                    </div>

                    {/* Step 2: Extracted Requirements Preview & Adjust */}
                    {extracted && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-indigo-100 dark:border-zinc-800 p-6 shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                                    <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Extracted Requirement Contract</h3>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                                    Validated JSON
                                </span>
                            </div>

                            {/* Gemini Plain-language Reasoning (Contest Constraint #2) */}
                            {extracted.reasoning && (
                                <div className="mb-4 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                    <span className="font-bold text-indigo-950 dark:text-indigo-100">AI Reasoning:</span> {extracted.reasoning}
                                </div>
                            )}

                            {/* Editable Parameters */}
                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-500 dark:text-zinc-400 font-semibold uppercase">Min CPU Tier</label>
                                        <select
                                            value={extracted.min_cpu_tier}
                                            onChange={(e) => setExtracted({ ...extracted, min_cpu_tier: e.target.value })}
                                            className="mt-1 w-full text-xs rounded-lg border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 capitalize font-medium"
                                        >
                                            <option value="entry">Entry</option>
                                            <option value="mid">Mid</option>
                                            <option value="high">High</option>
                                            <option value="workstation">Workstation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-500 dark:text-zinc-400 font-semibold uppercase">Min RAM (GB)</label>
                                        <input
                                            type="number"
                                            value={extracted.min_ram_gb}
                                            onChange={(e) => setExtracted({ ...extracted, min_ram_gb: parseInt(e.target.value) || 0 })}
                                            className="mt-1 w-full text-xs rounded-lg border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-500 dark:text-zinc-400 font-semibold uppercase">Min Storage (GB)</label>
                                        <input
                                            type="number"
                                            value={extracted.min_storage_gb}
                                            onChange={(e) => setExtracted({ ...extracted, min_storage_gb: parseInt(e.target.value) || 0 })}
                                            className="mt-1 w-full text-xs rounded-lg border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-500 dark:text-zinc-400 font-semibold uppercase">Min GPU Tier</label>
                                        <select
                                            value={extracted.min_gpu_tier}
                                            onChange={(e) => setExtracted({ ...extracted, min_gpu_tier: e.target.value })}
                                            className="mt-1 w-full text-xs rounded-lg border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 capitalize font-medium"
                                        >
                                            <option value="none">None</option>
                                            <option value="integrated">Integrated</option>
                                            <option value="dedicated-entry">Dedicated Entry</option>
                                            <option value="dedicated-high">Dedicated High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-1">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={extracted.requires_gpu}
                                            onChange={(e) => setExtracted({ ...extracted, requires_gpu: e.target.checked })}
                                            className="rounded border-slate-300 dark:border-zinc-600 text-indigo-600 dark:bg-zinc-700 text-xs"
                                        />
                                        <span className="font-semibold text-slate-700 dark:text-zinc-300">Requires GPU</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={extracted.portability_required}
                                            onChange={(e) => setExtracted({ ...extracted, portability_required: e.target.checked })}
                                            className="rounded border-slate-300 dark:border-zinc-600 text-indigo-600 dark:bg-zinc-700 text-xs"
                                        />
                                        <span className="font-semibold text-slate-700 dark:text-zinc-300">Laptop / Mobile</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleRank(extracted)}
                                disabled={isRanking}
                                className="mt-4 w-full py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                            >
                                {isRanking ? 'Re-scoring Fleet...' : 'Re-rank Fleet with Modified Specs'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Ranked Recommendations (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                            <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Deterministic Fleet Recommendations</h2>
                        </div>
                        {rankedResults && (
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                                {rankedResults.filter((r) => !r.disqualified).length} qualified available units
                            </span>
                        )}
                    </div>

                    {/* Procurement Alert (Contest Constraint #1) */}
                    {procurementRecommended && (
                        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                                        PROCUREMENT RECOMMENDED (Threshold &lt; 0.65)
                                    </span>
                                </div>
                                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                                    Constraint #1 Enforced: Available company inventory was thoroughly inspected first. No currently idle device satisfies the minimum performance threshold (0.65) without severe mismatch or workflow degradation.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Results Cards List */}
                    {!rankedResults ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-12 text-center text-slate-400 dark:text-zinc-500">
                            <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">No Active Matching Pipeline Run</h3>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                                Enter an employee workload description on the left and click "Extract Requirements" to rank available devices.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rankedResults.map((item, idx) => {
                                const { device, score, subscores, rationale, disqualified, disqualification_reason, passes_threshold } = item;
                                const isTop = idx === 0 && passes_threshold;

                                return (
                                    <div
                                        key={device.id}
                                        className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 transition shadow-xs ${
                                            isTop
                                                ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20'
                                                : disqualified
                                                ? 'border-slate-200 dark:border-zinc-800 opacity-60 bg-slate-50/50 dark:bg-zinc-800/30'
                                                : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                                    isTop ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                                }`}>
                                                    #{idx + 1}
                                                </span>
                                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                    <img
                                                        src={device.image_clip_url || device.image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Modern_Laptop_Computer.jpg/800px-Modern_Laptop_Computer.jpg'}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Modern_Laptop_Computer.jpg/800px-Modern_Laptop_Computer.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{device.brand} {device.model}</h4>
                                                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                            {device.asset_tag}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 dark:text-zinc-500 capitalize mt-0.5">
                                                        {device.cpu} • {device.device_type}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score Badge */}
                                            <div className="flex items-center gap-3 self-end sm:self-center">
                                                {disqualified ? (
                                                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50">
                                                        Disqualified
                                                    </span>
                                                ) : (
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-slate-900 dark:text-zinc-100">
                                                            {Math.round(score * 100)}%
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            passes_threshold ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                                        }`}>
                                                            {passes_threshold ? 'Clears Threshold' : 'Sub-threshold'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subscore Breakdown Bars (Contest Constraint #2) */}
                                        {!disqualified && (
                                            <div className="grid grid-cols-5 gap-2 my-3 text-[11px]">
                                                <div>
                                                    <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">CPU (30%)</div>
                                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${subscores.cpu * 100}%` }} />
                                                    </div>
                                                    <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.cpu * 100)}%</span>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">RAM (25%)</div>
                                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${subscores.ram * 100}%` }} />
                                                    </div>
                                                    <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.ram * 100)}%</span>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">Disk (15%)</div>
                                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${subscores.storage * 100}%` }} />
                                                    </div>
                                                    <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.storage * 100)}%</span>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">GPU (20%)</div>
                                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${subscores.gpu * 100}%` }} />
                                                    </div>
                                                    <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.gpu * 100)}%</span>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">Port (10%)</div>
                                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${subscores.portability * 100}%` }} />
                                                    </div>
                                                    <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.portability * 100)}%</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Deterministic Objective Rationale Box (Contest Constraint #2) */}
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed mt-2">
                                            <span className="font-bold text-slate-900 dark:text-zinc-100">Deterministic Rationale:</span> {rationale}
                                        </div>

                                        {/* Assign Button */}
                                        {!disqualified && (
                                            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                                    {device.ram_gb}GB RAM • {device.storage_gb}GB {device.storage_type} • <span className="capitalize">{device.condition}</span> condition
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={isAssigning}
                                                    onClick={() => handleAssign(device, score)}
                                                    className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 text-white dark:text-zinc-100 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-750 transition disabled:opacity-50"
                                                >
                                                    {employeeId ? `Assign to ${selectedEmployee?.name || 'Selected Staff'}` : 'Select Employee to Assign'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
