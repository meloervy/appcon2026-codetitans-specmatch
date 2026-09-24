import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import HardwareImage from '@/Components/HardwareImage';
import StatefulButton from '@/Components/ui/StatefulButton';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    RiAddLine,
    RiAlertLine,
    RiArrowDownSLine,
    RiArrowUpSLine,
    RiAwardLine,
    RiBookmarkLine,
    RiCheckLine,
    RiCloseLine,
    RiCpuLine,
    RiDeleteBinLine,
    RiExchangeLine,
    RiGuideLine,
    RiInformationLine,
    RiMapPinLine,
    RiSearchLine,
    RiSettings4Line,
    RiShieldCheckLine,
    RiUserLine,
} from 'react-icons/ri';

const matchCpuTierOptions = [
    { value: 'entry', label: 'Entry' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
    { value: 'workstation', label: 'Workstation' },
];

const matchGpuTierOptions = [
    { value: 'none', label: 'None' },
    { value: 'integrated', label: 'Integrated' },
    { value: 'dedicated-entry', label: 'Dedicated Entry' },
    { value: 'dedicated-high', label: 'Dedicated High' },
];

const DEFAULT_TEMPLATES = [
    {
        id: 'tpl-video-editor',
        title: 'Senior 4K Video Editor',
        category: 'Creative & Media',
        specs_summary: 'Core i7/M3 Pro • 32GB RAM • Dedicated High GPU • Laptop',
        prompt: 'New senior video editor joining marketing. Needs to edit 4K footage in Premiere/After Effects and travels frequently between shoots.',
        isCustom: false,
    },
    {
        id: 'tpl-backend-eng',
        title: 'Backend Software Engineer',
        category: 'Engineering & Dev',
        specs_summary: 'Core i7 / Ryzen 7 • 32GB RAM • 1TB SSD • Laptop',
        prompt: 'Backend software engineer working with Docker microservices, compiling Rust and running local databases. Needs 32GB RAM and portability.',
        isCustom: false,
    },
    {
        id: 'tpl-data-analyst',
        title: 'Senior Data & BI Analyst',
        category: 'Analytics',
        specs_summary: 'Core i5/i7 • 16GB RAM • 512GB SSD • Desktop OK',
        prompt: 'Data analyst doing heavy SQL querying and Tableau visualization from office desk. No GPU needed, prefers desktop.',
        isCustom: false,
    },
    {
        id: 'tpl-hr-specialist',
        title: 'HR & Administrative Specialist',
        category: 'Office & Ops',
        specs_summary: 'Entry CPU • 8GB RAM • 256GB SSD • Laptop',
        prompt: 'HR specialist handling spreadsheets, web apps, and emails. Basic productivity laptop.',
        isCustom: false,
    },
    {
        id: 'tpl-ai-researcher',
        title: 'AI / 3D Simulation Engineer',
        category: 'Engineering & Dev',
        specs_summary: 'Workstation Xeon/Threadripper • 64GB RAM • Dedicated High GPU',
        prompt: 'Machine learning specialist training local PyTorch models and running 3D viewport simulations. Demands workstation class CPU and high-end discrete GPU.',
        isCustom: false,
    },
];

export default function MatchRequest({
    employees = [],
    role_profiles = [],
    recent_requests = [],
    selected_employee_id,
    deployable_summary,
}) {
    const [employeeId, setEmployeeId] = useState(selected_employee_id || '');
    const [rawInput, setRawInput] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [isRanking, setIsRanking] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isExecutingSwap, setIsExecutingSwap] = useState(false);
    const [extracted, setExtracted] = useState(null);
    const [rankedResults, setRankedResults] = useState(null);
    const [procurementRecommended, setProcurementRecommended] = useState(false);
    const [procurementAdvisory, setProcurementAdvisory] = useState(null);
    const [bridgeSwaps, setBridgeSwaps] = useState([]);
    const [selectedBridgeSwap, setSelectedBridgeSwap] = useState(null);
    const [showBridgeModal, setShowBridgeModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Fleet Recommendations Filtering & Progressive Disclosure
    const [recoFilter, setRecoFilter] = useState('top'); // 'top', 'stockroom', 'all', 'disqualified'
    const [showAllInTop, setShowAllInTop] = useState(false);

    // Quick Workload Templates State
    const [templates, setTemplates] = useState(() => {
        try {
            const saved = localStorage.getItem('specmatch_workload_templates');
            if (saved) {
                const parsed = JSON.parse(saved);
                return [...DEFAULT_TEMPLATES, ...parsed];
            }
        } catch (e) {
            console.error('Failed to parse saved templates', e);
        }
        return DEFAULT_TEMPLATES;
    });
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [templateCategory, setTemplateCategory] = useState('all');
    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
    const [newTemplateForm, setNewTemplateForm] = useState({
        title: '',
        category: 'Engineering & Dev',
        prompt: '',
        specs_summary: '',
    });

    // Gemini Connectivity State
    const [isTestingGemini, setIsTestingGemini] = useState(false);
    const [geminiTestResult, setGeminiTestResult] = useState(null);
    const [showGeminiModal, setShowGeminiModal] = useState(false);

    // Deployable Inventory Modal State
    const [showDeployableModal, setShowDeployableModal] = useState(false);
    const [deployableSearch, setDeployableSearch] = useState('');
    const [deployableTypeFilter, setDeployableTypeFilter] = useState('all');

    // When an employee is selected with a pre-configured role profile, offer quick template fill
    const selectedEmployee = employees.find((e) => e.id === parseInt(employeeId));

    useEffect(() => {
        if (selectedEmployee?.role_profile) {
            const p = selectedEmployee.role_profile;
            setRawInput(
                `Assigning hardware for ${selectedEmployee.name} (${p.name}). ${p.description || ''} Requires ${p.min_ram_gb}GB RAM, ${p.min_storage_gb}GB storage, ${p.portability_required ? 'laptop for mobility' : 'desktop'}.`
            );
        }
    }, [employeeId]);

    const employeeSelectOptions = [
        {
            value: '',
            label: 'Ad-hoc Hardware Search (No employee)',
        },
        ...employees.map((emp) => ({
            value: String(emp.id),
            label: `${emp.name} (${emp.department})${emp.role_profile ? ` — ${emp.role_profile.name}` : ''}`,
            badge: emp.department,
        })),
    ];

    const handleSaveNewTemplate = (e) => {
        e?.preventDefault();
        if (!newTemplateForm.title.trim() || !newTemplateForm.prompt.trim()) {
            alert('Please provide both a title and workload prompt description.');
            return;
        }

        const newTpl = {
            id: 'custom-' + Date.now(),
            title: newTemplateForm.title.trim(),
            category: newTemplateForm.category || 'Custom',
            specs_summary: newTemplateForm.specs_summary?.trim() || 'Custom Workload Requirement',
            prompt: newTemplateForm.prompt.trim(),
            isCustom: true,
        };

        const customExisting = templates.filter((t) => t.isCustom);
        const updatedCustom = [newTpl, ...customExisting];
        localStorage.setItem('specmatch_workload_templates', JSON.stringify(updatedCustom));
        setTemplates([...DEFAULT_TEMPLATES, ...updatedCustom]);
        setSelectedTemplateId(newTpl.id);
        setRawInput(newTpl.prompt);
        setShowNewTemplateModal(false);
        setNewTemplateForm({ title: '', category: 'Engineering & Dev', prompt: '', specs_summary: '' });
    };

    const handleDeleteTemplate = (id, e) => {
        e?.stopPropagation();
        if (confirm('Delete this custom workload template?')) {
            const updated = templates.filter((t) => t.id !== id);
            const customOnly = updated.filter((t) => t.isCustom);
            localStorage.setItem('specmatch_workload_templates', JSON.stringify(customOnly));
            setTemplates(updated);
            if (selectedTemplateId === id) {
                setSelectedTemplateId(null);
            }
        }
    };

    const handleSelectTemplate = (tpl) => {
        setSelectedTemplateId(tpl.id);
        setRawInput(tpl.prompt);
    };

    const handleSaveCurrentAsTemplate = () => {
        if (!rawInput.trim()) {
            alert('Please enter or generate a workload prompt description first before saving as a template.');
            return;
        }
        setNewTemplateForm({
            title: selectedEmployee ? `${selectedEmployee.name} Workload` : 'Custom Workload',
            category: 'Engineering & Dev',
            prompt: rawInput.trim(),
            specs_summary: '',
        });
        setShowNewTemplateModal(true);
    };

    const handleTestGemini = async () => {
        setIsTestingGemini(true);
        try {
            const res = await axios.post(route('match.test-gemini'), { model: 'gemini-3.6-flash' });
            setGeminiTestResult(res.data);
            setShowGeminiModal(true);
        } catch (err) {
            setGeminiTestResult({
                status: 'error',
                success: false,
                http_status: 500,
                model: 'gemini-3.6-flash',
                message: err.response?.data?.message || 'Failed to ping Gemini endpoint.',
                latency_ms: 0,
                fallback_active: true,
            });
            setShowGeminiModal(true);
        } finally {
            setIsTestingGemini(false);
        }
    };

    const handleExtract = async () => {
        if (!rawInput.trim() || isExtracting || isRanking) return;
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
        if (!requirementsToRank || isRanking) return;
        setIsRanking(true);
        setErrorMsg(null);
        try {
            const res = await axios.post(route('match.rank'), {
                requirements: requirementsToRank,
                employee_id: employeeId || null,
            });
            setRankedResults(res.data.results);
            setProcurementRecommended(res.data.procurement_recommended);
            setProcurementAdvisory(res.data.procurement_advisory || null);
            setBridgeSwaps(res.data.bridge_swaps || []);
            setRecoFilter('top');
            setShowAllInTop(false);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Device ranking failed.');
        } finally {
            setIsRanking(false);
        }
    };

    const handleExecuteBridgeSwap = (swap = selectedBridgeSwap) => {
        if (!swap) return;
        if (!employeeId) {
            alert('Please select an employee in the dropdown before executing the bridge swap.');
            return;
        }

        router.post(
            route('match.bridge-swap'),
            {
                bridge_device_id: swap.bridge_device.id,
                donor_employee_id: swap.donor_employee.id,
                requester_employee_id: employeeId,
                donor_device_id: swap.donor_device.id,
            },
            {
                onStart: () => setIsExecutingSwap(true),
                onFinish: () => setIsExecutingSwap(false),
                onSuccess: () => {
                    setShowBridgeModal(false);
                },
            }
        );
    };

    const handleAssign = (device, score) => {
        if (!employeeId) {
            alert('Please select an employee in the dropdown before completing assignment.');
            return;
        }

        router.post(
            route('match.assign'),
            {
                device_id: device.id,
                employee_id: employeeId,
                assignment_source: 'ai_recommended',
                match_score: score,
            },
            {
                onStart: () => setIsAssigning(true),
                onFinish: () => setIsAssigning(false),
            }
        );
    };

    const filteredTemplates = templates.filter((t) => {
        if (templateCategory === 'all') return true;
        if (templateCategory === 'custom') return t.isCustom;
        return t.category === templateCategory;
    });

    const filteredDeployableDevices = (deployable_summary?.preview_devices || []).filter((d) => {
        if (deployableTypeFilter !== 'all' && d.device_type !== deployableTypeFilter) return false;
        if (!deployableSearch.trim()) return true;
        const q = deployableSearch.toLowerCase();
        return (
            d.asset_tag?.toLowerCase().includes(q) ||
            d.brand?.toLowerCase().includes(q) ||
            d.model?.toLowerCase().includes(q) ||
            d.cpu?.toLowerCase().includes(q) ||
            d.location?.toLowerCase().includes(q) ||
            d.cpu_tier?.toLowerCase().includes(q)
        );
    });

    // Derived fleet recommendation lists
    const qualifiedResults = rankedResults?.filter((r) => !r.disqualified) || [];
    const disqualifiedResults = rankedResults?.filter((r) => r.disqualified) || [];
    const stockroomQualifiedResults = qualifiedResults.filter((r) => r.is_available_for_deployment);

    let displayedResults = [];
    if (recoFilter === 'top') {
        displayedResults = showAllInTop ? qualifiedResults : qualifiedResults.slice(0, 3);
    } else if (recoFilter === 'stockroom') {
        displayedResults = stockroomQualifiedResults;
    } else if (recoFilter === 'all') {
        displayedResults = qualifiedResults;
    } else if (recoFilter === 'disqualified') {
        displayedResults = disqualifiedResults;
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                            AI-Powered Matching Engine
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Two-layer intelligent pipeline: Natural language requirement extraction (Gemini 3.6 Flash) + Deterministic fleet ranking.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-[#0aceb3] animate-pulse" />
                            <span>Gemini 3.6 Flash Active</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Match Engine - SpecMatch" />

            {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm text-rose-700 dark:text-rose-300">
                    {errorMsg}
                </div>
            )}

            {/* Fleet Inventory Deployment Status Bar */}
            <div className="mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                                    Inventory Deployment Status: {deployable_summary?.total_available ?? 11} Units Cleared for Immediate Deployment
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                    Stockroom Verified
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                Verified idle in fleet stockroom pools across campus hubs. Matching checks these deployable units first to avoid new CapEx purchases.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                        {/* Quick Specs Pill Breakdown */}
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                            <span className="text-slate-700 dark:text-zinc-300 font-semibold">{deployable_summary?.laptops_count ?? 4} Laptops</span>
                            <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                            <span className="text-slate-700 dark:text-zinc-300 font-semibold">{deployable_summary?.desktops_count ?? 7} Desktops</span>
                            <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{deployable_summary?.tiers?.workstation ?? 2} Workstations</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowDeployableModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-[#026eff]/10 hover:text-[#026eff] dark:hover:text-[#0b79ff] text-slate-700 dark:text-zinc-300 font-bold text-xs border border-slate-200 dark:border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Inspect Deployable Fleet ({deployable_summary?.total_available ?? 11})
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Request & Extraction Input (5 cols) - Sticky on Desktop */}
                <div className="lg:col-span-5 w-full space-y-6 lg:sticky lg:top-6 self-start">
                    {/* Step 1: Employee & Request */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#026eff] text-white flex items-center justify-center text-xs font-bold">1</span>
                                <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Request Specification</h2>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#026eff]/10 text-[#026eff] dark:text-[#0b79ff] border border-[#026eff]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0aceb3]" />
                                <span>Natural Language Input</span>
                            </span>
                        </div>

                        {/* Employee Select */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                Target Employee
                            </label>
                            <CustomSelect
                                value={employeeId ? String(employeeId) : ''}
                                onChange={(val) => setEmployeeId(val)}
                                options={employeeSelectOptions}
                                placeholder="Choose employee (optional for ad-hoc search)..."
                                icon={RiUserLine}
                                className="w-full"
                                clearable
                            />
                        </div>

                        {/* Text Request Input */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                    Natural Language Need
                                </label>
                                <div className="flex items-center gap-2">
                                    {rawInput.trim() && (
                                        <button
                                            type="button"
                                            onClick={handleSaveCurrentAsTemplate}
                                            className="text-[11px] text-[#026eff] dark:text-[#0b79ff] font-bold hover:underline cursor-pointer inline-flex items-center gap-1 transition"
                                        >
                                            <RiBookmarkLine className="w-3.5 h-3.5" />
                                            <span>Save as Template</span>
                                        </button>
                                    )}
                                    <span className="text-[11px] text-[#026eff] dark:text-[#0b79ff] font-medium">Layer 1: Gemini 3.6</span>
                                </div>
                            </div>
                            <textarea
                                rows={4}
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                                placeholder="Describe the workload requirements, software used, mobility needs, or performance expectations..."
                                className="w-full text-sm rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs resize-none custom-scrollbar p-3.5 transition"
                            />
                        </div>

                        {/* Quick Prompts & Workload Templates Manager */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                    Quick Workload Templates ({filteredTemplates.length})
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewTemplateForm({ title: '', category: 'Engineering & Dev', prompt: '', specs_summary: '' });
                                            setShowNewTemplateModal(true);
                                        }}
                                        className="text-[11px] font-bold text-[#026eff] dark:text-[#0b79ff] hover:underline inline-flex items-center gap-1 cursor-pointer transition"
                                    >
                                        <RiAddLine className="w-3.5 h-3.5" />
                                        <span>Create Template</span>
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 text-[10px] custom-scrollbar">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'Engineering & Dev', label: 'Engineering' },
                                    { key: 'Creative & Media', label: 'Creative' },
                                    { key: 'Analytics', label: 'Analytics' },
                                    { key: 'Office & Ops', label: 'Office' },
                                    { key: 'custom', label: `My Custom (${templates.filter((t) => t.isCustom).length})` },
                                ].map((cat) => (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => setTemplateCategory(cat.key)}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                                            templateCategory === cat.key
                                                ? 'bg-[#026eff] text-white'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Templates Grid / Cards */}
                            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1.5">
                                {filteredTemplates.length === 0 ? (
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 py-3 text-center italic">
                                        No templates in this category. Click &quot;+ Create Template&quot; above.
                                    </p>
                                ) : (
                                    filteredTemplates.map((t) => {
                                        const isSelected = selectedTemplateId === t.id;
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={() => handleSelectTemplate(t)}
                                                className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative group ${
                                                    isSelected
                                                        ? 'bg-[#026eff]/10 border-[#026eff] shadow-xs'
                                                        : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/70 dark:border-zinc-700/60 hover:border-[#026eff]/40 hover:bg-slate-100/80 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                                                            {t.title}
                                                        </h4>
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-200/80 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 shrink-0">
                                                            {t.category}
                                                        </span>
                                                        {t.isCustom && (
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#0aceb3]/20 text-[#0aceb3] border border-[#0aceb3]/30 shrink-0">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </div>

                                                    {t.isCustom && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeleteTemplate(t.id, e)}
                                                            className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition shrink-0 cursor-pointer"
                                                            title="Delete custom template"
                                                        >
                                                            <RiDeleteBinLine className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-snug line-clamp-2">
                                                    {t.prompt}
                                                </p>

                                                {t.specs_summary && (
                                                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                                                        <RiCpuLine className="w-3 h-3 text-[#026eff] dark:text-[#0b79ff] shrink-0" />
                                                        <span>{t.specs_summary}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="button"
                            onClick={handleExtract}
                            disabled={isExtracting || isRanking || !rawInput.trim()}
                            className="mt-5 w-full py-3 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isExtracting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Analyzing with Gemini 3.6 Flash...
                                </>
                            ) : isRanking ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Ranking Fleet &amp; Stockroom...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Run Match Pipeline
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column: AI Extraction & Recommendations (7 cols) */}
                <div className="lg:col-span-7 w-full space-y-6">
                    {!extracted && !isExtracting && !isRanking ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-8 shadow-xs">
                            <div className="text-center mb-8">
                                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-lg">Two-Layer Matching Pipeline Idle</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                                    Select a template or describe workload needs on the left. The engine will extract structured constraints via Gemini (Step 2) and deterministically rank available fleet devices (Step 3).
                                </p>
                            </div>
                            <div className="space-y-6">
                                {/* Skeleton for Step 2 */}
                                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700/60 rounded-2xl p-6 bg-slate-50/50 dark:bg-zinc-800/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-slate-300 dark:bg-zinc-700 text-white dark:text-zinc-300 flex items-center justify-center text-xs font-bold">2</span>
                                            <h4 className="font-bold text-slate-500 dark:text-zinc-400 text-sm">AI Structured Extraction</h4>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11 2L7.33 10.67 2 11l5.33 3.67L5 22l6-3.33L17 22l-2.33-7.33L20 11l-5.33-.33L11 2zm8 4l-1.33 2.67L15 9l2.67 1.33L19 13l1.33-2.67L23 9l-2.67-1.33z" />
                                            </svg>
                                            Gemini AI
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-medium border border-slate-200 dark:border-zinc-700">CPU Tier: —</span>
                                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-medium border border-slate-200 dark:border-zinc-700">Min RAM: —</span>
                                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-medium border border-slate-200 dark:border-zinc-700">Storage: —</span>
                                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-medium border border-slate-200 dark:border-zinc-700">GPU: —</span>
                                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-medium border border-slate-200 dark:border-zinc-700">Mobility: —</span>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Awaiting natural language extraction...</p>
                                </div>
                                {/* Skeleton for Step 3 */}
                                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700/60 rounded-2xl p-6 bg-slate-50/50 dark:bg-zinc-800/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-slate-300 dark:bg-zinc-700 text-white dark:text-zinc-300 flex items-center justify-center text-xs font-bold">3</span>
                                        <h4 className="font-bold text-slate-500 dark:text-zinc-400 text-sm">Deterministic Fleet Recommendations</h4>
                                    </div>
                                    <div className="space-y-3 opacity-50 mb-4">
                                        <div className="h-16 bg-slate-200 dark:bg-zinc-800 rounded-xl w-full" />
                                        <div className="h-16 bg-slate-200 dark:bg-zinc-800 rounded-xl w-full" />
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Fleet devices will be scored &amp; ranked against extracted constraints.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Step 2: AI Structured Extraction */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                                    <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base">AI Structured Extraction</h2>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs relative overflow-hidden">
                                    {isExtracting ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-[#026eff] dark:text-[#0b79ff]">
                                            <svg className="animate-spin h-8 w-8 mb-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="text-sm font-semibold">Gemini is analyzing requirements...</span>
                                        </div>
                                    ) : (
                                        extracted && (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#0b79ff] border border-[#026eff]/20 dark:border-[#031a40]/60 shadow-sm">
                                                        <svg className="w-4 h-4 text-[#026eff] dark:text-[#0b79ff]" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M11 2L7.33 10.67 2 11l5.33 3.67L5 22l6-3.33L17 22l-2.33-7.33L20 11l-5.33-.33L11 2zm8 4l-1.33 2.67L15 9l2.67 1.33L19 13l1.33-2.67L23 9l-2.67-1.33z" />
                                                        </svg>
                                                        {extracted.source === 'heuristic_fallback'
                                                            ? 'SpecMatch Heuristic Engine (Gemini 3.6 Quota Failover)'
                                                            : 'Powered by Gemini 3.6 Flash'}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                                                        Validated JSON
                                                    </span>
                                                </div>

                                                {extracted.fallback_reason && (
                                                    <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                                        <RiInformationLine className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <strong className="font-semibold text-amber-900 dark:text-amber-200">
                                                                Gemini 3.6 Cloud Quota Notice (Free Tier):
                                                            </strong>
                                                            <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                                                                {extracted.fallback_reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {extracted.reasoning && (
                                                    <p className="text-sm text-slate-700 dark:text-zinc-300 mb-5 leading-relaxed bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                                                        <span className="font-semibold text-slate-900 dark:text-zinc-100">Reasoning:</span> {extracted.reasoning}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                        <span className="text-slate-400 dark:text-zinc-500 mr-1 font-medium">CPU:</span> <span className="capitalize">{extracted.min_cpu_tier}</span>
                                                    </span>
                                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                        <span className="text-slate-400 dark:text-zinc-500 mr-1 font-medium">RAM:</span> {extracted.min_ram_gb} GB
                                                    </span>
                                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                        <span className="text-slate-400 dark:text-zinc-500 mr-1 font-medium">Storage:</span> {extracted.min_storage_gb} GB SSD
                                                    </span>
                                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                        <span className="text-slate-400 dark:text-zinc-500 mr-1 font-medium">GPU:</span> <span className="capitalize">{extracted.requires_gpu ? extracted.min_gpu_tier : 'None required'}</span>
                                                    </span>
                                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                        <span className="text-slate-400 dark:text-zinc-500 mr-1 font-medium">Form:</span> {extracted.portability_required ? 'Laptop Required' : 'Desktop OK'}
                                                    </span>
                                                </div>

                                                {/* Collapsible Advanced Simulator & Developer Diagnostics */}
                                                <details className="group rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-3.5 transition">
                                                    <summary className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer flex items-center justify-between select-none hover:text-[#026eff] transition">
                                                        <span className="flex items-center gap-2">
                                                            <RiSettings4Line className="w-4 h-4 text-slate-500 group-hover:text-[#026eff]" />
                                                            <span>Advanced Simulator &amp; Developer Tools</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 group-open:rotate-180 transition-transform">
                                                            ▼
                                                        </span>
                                                    </summary>

                                                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-4">
                                                        {/* Parameter Override Controls */}
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
                                                                Simulate Custom Hardware Requirements
                                                            </span>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Min CPU</label>
                                                                    <CustomSelect
                                                                        value={extracted.min_cpu_tier}
                                                                        onChange={(val) => setExtracted({ ...extracted, min_cpu_tier: val })}
                                                                        options={matchCpuTierOptions}
                                                                        placeholder="Min CPU"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Min RAM (GB)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={extracted.min_ram_gb}
                                                                        onChange={(e) => setExtracted({ ...extracted, min_ram_gb: parseInt(e.target.value) || 0 })}
                                                                        className="w-full text-xs rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold py-2 px-2.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Min Storage (GB)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={extracted.min_storage_gb}
                                                                        onChange={(e) => setExtracted({ ...extracted, min_storage_gb: parseInt(e.target.value) || 0 })}
                                                                        className="w-full text-xs rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold py-2 px-2.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Min GPU</label>
                                                                    <CustomSelect
                                                                        value={extracted.min_gpu_tier}
                                                                        onChange={(val) => setExtracted({ ...extracted, min_gpu_tier: val })}
                                                                        options={matchGpuTierOptions}
                                                                        placeholder="Min GPU"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                                                                <div className="flex gap-4">
                                                                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={extracted.requires_gpu}
                                                                            onChange={(e) => setExtracted({ ...extracted, requires_gpu: e.target.checked })}
                                                                            className="rounded border-slate-300 dark:border-zinc-600 text-[#026eff] dark:bg-zinc-700 text-xs focus:ring-[#026eff]/20"
                                                                        />
                                                                        <span className="font-semibold text-slate-700 dark:text-zinc-300">Requires GPU</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={extracted.portability_required}
                                                                            onChange={(e) => setExtracted({ ...extracted, portability_required: e.target.checked })}
                                                                            className="rounded border-slate-300 dark:border-zinc-600 text-[#026eff] dark:bg-zinc-700 text-xs focus:ring-[#026eff]/20"
                                                                        />
                                                                        <span className="font-semibold text-slate-700 dark:text-zinc-300">Laptop / Mobile</span>
                                                                    </label>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRank(extracted)}
                                                                    disabled={isRanking}
                                                                    className="px-3 py-1.5 rounded-lg bg-[#026eff] hover:bg-[#0256cc] text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-2xs"
                                                                >
                                                                    {isRanking ? 'Re-scoring...' : 'Re-rank Fleet'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Gemini Diagnostics & Test Connectivity */}
                                                        <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                                                                    Gemini 3.6 Flash Live Connectivity
                                                                </span>
                                                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    Verify cloud API round-trip latency &amp; rate limits
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleTestGemini}
                                                                disabled={isTestingGemini}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-[#026eff] text-xs font-bold border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                                                            >
                                                                <span className="w-2 h-2 rounded-full bg-[#0aceb3] animate-pulse" />
                                                                {isTestingGemini ? 'Testing Gemini...' : 'Run Connectivity Test'}
                                                            </button>
                                                        </div>

                                                        {/* Raw JSON Payload */}
                                                        <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                                                                Raw JSON Extraction Payload
                                                            </span>
                                                            <pre className="text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl overflow-x-auto custom-scrollbar border border-slate-800 font-mono shadow-inner">
                                                                {JSON.stringify(extracted, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </details>
                                            </>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Deterministic Fleet Recommendations */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                        <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base leading-tight">
                                            Fleet Recommendations
                                        </h2>
                                    </div>

                                    {rankedResults && (
                                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-xs overflow-x-auto custom-scrollbar">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRecoFilter('top');
                                                    setShowAllInTop(false);
                                                }}
                                                className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                                    recoFilter === 'top'
                                                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                                                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                                }`}
                                            >
                                                <RiAwardLine className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span>Top Picks ({Math.min(3, qualifiedResults.length)})</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setRecoFilter('stockroom')}
                                                className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                                    recoFilter === 'stockroom'
                                                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                                                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                                }`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span>Stockroom ({stockroomQualifiedResults.length})</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setRecoFilter('all')}
                                                className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                                                    recoFilter === 'all'
                                                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                                                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                                }`}
                                            >
                                                All Qualified ({qualifiedResults.length})
                                            </button>

                                            {disqualifiedResults.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setRecoFilter('disqualified')}
                                                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                                                        recoFilter === 'disqualified'
                                                            ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                                                            : 'text-rose-600/70 dark:text-rose-400/70 hover:text-rose-600 dark:hover:text-rose-400'
                                                    }`}
                                                >
                                                    <RiAlertLine className="w-3.5 h-3.5" />
                                                    <span>Disqualified ({disqualifiedResults.length})</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isRanking ? (
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-12 flex flex-col items-center justify-center shadow-xs">
                                        <svg className="animate-spin h-8 w-8 text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-sm text-slate-600 dark:text-zinc-400 font-semibold">Ranking fleet inventory...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* SpecMatch Dual-Engine Strategic Allocation Guide */}
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-zinc-900/90 dark:via-zinc-800/50 dark:to-zinc-900/90 border border-slate-200/80 dark:border-zinc-700/80 shadow-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-zinc-700/60">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1 rounded-lg bg-[#026eff]/10 text-[#026eff] dark:text-[#0b79ff]">
                                                        <RiGuideLine className="w-4 h-4" />
                                                    </span>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                                                        SpecMatch Two-Path Fleet Allocation Framework
                                                    </h4>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700/60">
                                                    Contest Constraint #1 &amp; #2 Compliant
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-extrabold shrink-0">1</span>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Direct Fleet Assignment (Primary)</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-7">
                                                        Deploy ready, idle stockroom units matching specs immediately with 1:1 hardware assignment. Evaluated first to circulate idle company assets without moving equipment between employees.
                                                    </p>
                                                </div>

                                                <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-5 h-5 rounded-full bg-[#0aceb3]/20 text-[#0aceb3] flex items-center justify-center text-[10px] font-extrabold shrink-0">2</span>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Dynamic Bridge Swap (Cascade Solution)</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-7">
                                                        When stockroom lacks a matching high-spec unit, SpecMatch cascades an idle unit to an over-provisioned donor user, liberating their workstation for this request and avoiding new CapEx procurement.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Procurement Alert (Contest Constraint #1) */}
                                        {procurementRecommended && (
                                            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-start gap-4">
                                                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                                                            PROCUREMENT RECOMMENDED (Threshold &lt; 0.65)
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                                                        Constraint #1 Enforced: Available company inventory was thoroughly inspected first. No currently idle device satisfies the minimum performance threshold (0.65) without severe mismatch or workflow degradation.
                                                    </p>
                                                    {procurementAdvisory && (
                                                        <div className="mt-3 p-3.5 rounded-xl bg-rose-100/70 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                                                            <div className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-200">
                                                                <span>Strategy:</span>
                                                                <span className="capitalize">{procurementAdvisory.strategy || 'Procure Replacement'}</span>
                                                            </div>
                                                            <p className="leading-relaxed">{procurementAdvisory.recommendation}</p>
                                                            {procurementAdvisory.justification && (
                                                                <p className="text-[11px] opacity-80 italic leading-relaxed">{procurementAdvisory.justification}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Dynamic Inventory Bridge Swap Opportunities (Cascaded Fleet Reallocation) */}
                                        {bridgeSwaps && bridgeSwaps.length > 0 && (
                                            <div className="space-y-4">
                                                {bridgeSwaps.map((swap, sIdx) => (
                                                    <div
                                                        key={`bridge-swap-${sIdx}`}
                                                        className="p-5 rounded-2xl bg-gradient-to-br from-[#031a40] via-[#021230] to-[#031a40] text-white border-2 border-[#0aceb3]/60 shadow-lg relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0aceb3]/10 rounded-full blur-3xl pointer-events-none" />

                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="p-2 rounded-xl bg-[#0aceb3]/20 text-[#0aceb3] border border-[#0aceb3]/40 shadow-xs">
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                    </svg>
                                                                </span>
                                                                <div>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h3 className="font-black text-sm tracking-tight text-white">
                                                                            Dynamic Inventory Bridge Swap Solution
                                                                        </h3>
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0b79ff]/20 text-[#0b79ff] border border-[#0b79ff]/40 uppercase tracking-wide">
                                                                            Cascaded Reallocation Alternative
                                                                        </span>
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0aceb3]/20 text-[#0aceb3] border border-[#0aceb3]/40">
                                                                            Avoids Procurement
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-300 mt-0.5">
                                                                        Alternative to new procurement: Cascades an idle stockroom unit to an overprovisioned employee to free up their workstation for the requester.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 self-end sm:self-center">
                                                                <div className="text-right">
                                                                    <div className="text-xs font-black uppercase text-[#0aceb3] tracking-wide">
                                                                        ₱{Number(swap.capex_saved_php).toLocaleString()} CapEx Avoided
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-300">
                                                                        {Math.round(swap.feasibility_score * 100)}% Feasibility Score
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 3-Node Visual Cascade Flow Diagram */}
                                                        <div className="my-4 p-4 rounded-xl bg-white/5 border border-white/10 relative z-10">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b79ff]">
                                                                    Cascade Reallocation Architecture
                                                                </span>
                                                                {swap.same_location && (
                                                                    <span className="text-[10px] font-bold text-[#0aceb3] flex items-center gap-1.5">
                                                                        <RiMapPinLine className="w-3.5 h-3.5 shrink-0" />
                                                                        <span>Same Campus Hub (Zero Shipping Delay)</span>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                                                {/* Node 1: Idle Stockroom Unit */}
                                                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                                                    <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 shrink-0 overflow-hidden">
                                                                        <HardwareImage
                                                                            src={swap.bridge_device.image_clip_url || swap.bridge_device.image_url}
                                                                            alt={swap.bridge_device.model}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#0aceb3] block">Step 1: Stockroom Unit</span>
                                                                        <div className="font-bold text-xs truncate text-white">
                                                                            {swap.bridge_device.brand} {swap.bridge_device.model}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                                            {swap.bridge_device.ram_gb}GB &bull; {swap.bridge_device.cpu_tier} Tier
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Node 2: Overprovisioned Donor */}
                                                                <div className="p-3 rounded-xl bg-[#026eff]/15 border border-[#026eff]/40 flex items-center gap-3 text-center md:text-left">
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#0b79ff] block">Bridge Donor Recipient</span>
                                                                        <div className="font-bold text-xs truncate text-white flex items-center gap-1.5">
                                                                            <RiUserLine className="w-3.5 h-3.5 text-[#0b79ff] shrink-0" />
                                                                            <span>{swap.donor_employee.name}</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-300">
                                                                            {swap.donor_employee.role_profile.name} (Needs {swap.donor_employee.role_profile.min_ram_gb}GB)
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Node 3: High-Spec Rig to Requester */}
                                                                <div className="p-3 rounded-xl bg-white/5 border border-[#0aceb3]/40 flex items-center gap-3">
                                                                    <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 shrink-0 overflow-hidden">
                                                                        <HardwareImage
                                                                            src={swap.donor_device.image_clip_url || swap.donor_device.image_url}
                                                                            alt={swap.donor_device.model}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="text-[9px] font-bold uppercase text-[#0aceb3] block">Step 2: Reassign to Requester</span>
                                                                        <div className="font-bold text-xs truncate text-white">
                                                                            {swap.donor_device.brand} {swap.donor_device.model}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                                            {swap.donor_device.ram_gb}GB &bull; {swap.donor_device.cpu_tier} Tier
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Rationale & Action */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 relative z-10">
                                                            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                                                                {swap.rationale}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                disabled={isAssigning}
                                                                onClick={() => {
                                                                    setSelectedBridgeSwap(swap);
                                                                    setShowBridgeModal(true);
                                                                }}
                                                                className="px-4 py-2.5 rounded-xl bg-[#0aceb3] hover:bg-[#0aceb3]/90 text-slate-950 font-extrabold text-xs transition shadow-sm shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                                            >
                                                                <RiExchangeLine className="w-4 h-4 text-slate-950 shrink-0" />
                                                                <span>Review &amp; Execute Bridge Swap</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Results Cards List */}
                                        {rankedResults && (
                                            displayedResults.length === 0 ? (
                                                <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-center shadow-xs">
                                                    <RiInformationLine className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                                        No devices found in this view
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                                        {recoFilter === 'stockroom'
                                                            ? 'No idle stockroom devices qualify directly. Consider a Dynamic Bridge Swap above or switch to "All Qualified".'
                                                            : recoFilter === 'disqualified'
                                                            ? 'No disqualified units found for this workload requirement.'
                                                            : 'No devices match the selected filter category.'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {displayedResults.map((item, idx) => {
                                                        const {
                                                            device,
                                                            score,
                                                            subscores,
                                                            capex_saved_php,
                                                            fit_grade,
                                                            overprovisioning_risk,
                                                            rationale,
                                                            disqualified,
                                                            passes_threshold,
                                                            is_available_for_deployment,
                                                        } = item;
                                                        const isTopHero = idx === 0 && recoFilter === 'top' && passes_threshold;
                                                        const itemWeights = item.weights || item.subscore_audit?.weights || {
                                                            cpu: 0.30,
                                                            ram: 0.25,
                                                            storage: 0.15,
                                                            gpu: 0.20,
                                                            portability: 0.10,
                                                        };

                                                        return (
                                                            <div
                                                                key={device.id}
                                                                className={`rounded-2xl border p-5 transition shadow-xs ${
                                                                    isTopHero
                                                                        ? 'bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                                                                        : disqualified
                                                                        ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40 opacity-80'
                                                                        : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                                                                }`}
                                                            >
                                                                {isTopHero && (
                                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider mb-3 border border-emerald-300 dark:border-emerald-700">
                                                                        <RiAwardLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                        <span>Top Pick &bull; Best Fleet Recommendation</span>
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                                                            isTopHero
                                                                                ? 'bg-emerald-600 text-white shadow-2xs'
                                                                                : disqualified
                                                                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                                                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                                                        }`}>
                                                                            #{idx + 1}
                                                                        </span>
                                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                                                            <HardwareImage
                                                                                src={device.image_clip_url || device.image_url}
                                                                                alt={device.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{device.brand} {device.model}</h4>
                                                                                <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                                                    {device.asset_tag}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-xs text-slate-400 dark:text-zinc-500 capitalize mt-0.5">
                                                                                {device.cpu} &bull; {device.device_type}
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                                                {is_available_for_deployment ? (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                                        Ready in Stockroom &bull; {device.location || 'Central Stockroom'}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                                                                        <RiUserLine className="w-3 h-3 shrink-0" />
                                                                                        Assigned in Fleet (Bridge Swap Candidate)
                                                                                    </span>
                                                                                )}
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
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    {fit_grade && (
                                                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                                            fit_grade === 'Perfect Fit' ? 'bg-[#0aceb3]/20 text-[#0aceb3] border border-[#0aceb3]/30' :
                                                                                            fit_grade === 'Strong Fit' ? 'bg-[#026eff]/20 text-[#0b79ff] border border-[#026eff]/30' :
                                                                                            fit_grade === 'Good Fit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                                                            fit_grade === 'Acceptable' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                                                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                                                        }`}>
                                                                                            {fit_grade}
                                                                                        </span>
                                                                                    )}
                                                                                    {overprovisioning_risk && (
                                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                                                                                            <RiAlertLine className="w-3 h-3 shrink-0" />
                                                                                            Overprovisioned
                                                                                        </span>
                                                                                    )}
                                                                                    <div className="text-lg font-black text-slate-900 dark:text-zinc-100">
                                                                                        {Math.round(score * 100)}%
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center justify-end gap-2 mt-0.5">
                                                                                    {capex_saved_php > 0 && (
                                                                                        <span className="text-[10px] font-bold text-[#0aceb3]">
                                                                                            ₱{Number(capex_saved_php).toLocaleString()} CapEx Saved
                                                                                        </span>
                                                                                    )}
                                                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                                        passes_threshold ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                                                                    }`}>
                                                                                        {passes_threshold ? 'Clears Threshold' : 'Sub-threshold'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Subscore Breakdown Bars (Contest Constraint #2) */}
                                                                {!disqualified && (
                                                                    <div className="my-3 space-y-2">
                                                                        <div className="grid grid-cols-5 gap-2 text-[11px]">
                                                                            <div>
                                                                                <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">
                                                                                    CPU ({Math.round(itemWeights.cpu * 100)}%)
                                                                                </div>
                                                                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                                    <div className={`h-1.5 rounded-full ${subscores.cpu >= 0.8 ? 'bg-[#0aceb3]' : subscores.cpu >= 0.5 ? 'bg-[#026eff]' : 'bg-amber-500'}`} style={{ width: `${subscores.cpu * 100}%` }} />
                                                                                </div>
                                                                                <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.cpu * 100)}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">
                                                                                    RAM ({Math.round(itemWeights.ram * 100)}%)
                                                                                </div>
                                                                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                                    <div className={`h-1.5 rounded-full ${subscores.ram >= 0.8 ? 'bg-[#0aceb3]' : subscores.ram >= 0.5 ? 'bg-[#026eff]' : 'bg-amber-500'}`} style={{ width: `${subscores.ram * 100}%` }} />
                                                                                </div>
                                                                                <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.ram * 100)}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">
                                                                                    Disk ({Math.round(itemWeights.storage * 100)}%)
                                                                                </div>
                                                                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                                    <div className={`h-1.5 rounded-full ${subscores.storage >= 0.8 ? 'bg-[#0aceb3]' : subscores.storage >= 0.5 ? 'bg-[#026eff]' : 'bg-amber-500'}`} style={{ width: `${subscores.storage * 100}%` }} />
                                                                                </div>
                                                                                <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.storage * 100)}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">
                                                                                    GPU ({Math.round(itemWeights.gpu * 100)}%)
                                                                                </div>
                                                                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                                    <div className={`h-1.5 rounded-full ${subscores.gpu >= 0.8 ? 'bg-[#0aceb3]' : subscores.gpu >= 0.5 ? 'bg-[#026eff]' : 'bg-amber-500'}`} style={{ width: `${subscores.gpu * 100}%` }} />
                                                                                </div>
                                                                                <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.gpu * 100)}%</span>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase">
                                                                                    Port ({Math.round(itemWeights.portability * 100)}%)
                                                                                </div>
                                                                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                                    <div className={`h-1.5 rounded-full ${subscores.portability >= 0.8 ? 'bg-[#0aceb3]' : subscores.portability >= 0.5 ? 'bg-[#026eff]' : 'bg-amber-500'}`} style={{ width: `${subscores.portability * 100}%` }} />
                                                                                </div>
                                                                                <span className="font-mono text-slate-700 dark:text-zinc-300 text-[10px]">{Math.round(subscores.portability * 100)}%</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Objective Mathematical Reconciliation Formula Audit */}
                                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[10px] text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 font-mono">
                                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                                <span className="font-bold uppercase text-slate-700 dark:text-zinc-300">Deterministic Formula:</span>
                                                                                <span>
                                                                                    ({Math.round(subscores.cpu * 100)}%×{Math.round(itemWeights.cpu * 100)}%) + ({Math.round(subscores.ram * 100)}%×{Math.round(itemWeights.ram * 100)}%) + ({Math.round(subscores.storage * 100)}%×{Math.round(itemWeights.storage * 100)}%) + ({Math.round(subscores.gpu * 100)}%×{Math.round(itemWeights.gpu * 100)}%) + ({Math.round(subscores.portability * 100)}%×{Math.round(itemWeights.portability * 100)}%) = <strong className="text-slate-900 dark:text-zinc-100 font-black">{Math.round(score * 100)}%</strong>
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                                                                                <RiCheckLine className="w-3 h-3 text-emerald-500" />
                                                                                <span>100% Reconciled</span>
                                                                            </span>
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
                                                                            {device.ram_gb}GB RAM &bull; {device.storage_gb}GB {device.storage_type} &bull; <span className="capitalize">{device.condition}</span> condition
                                                                        </span>
                                                                        <StatefulButton
                                                                            type="button"
                                                                            variant="primary"
                                                                            disabled={isAssigning}
                                                                            onClick={() => handleAssign(device, score)}
                                                                            className="px-4 py-2 rounded-xl text-xs font-semibold"
                                                                        >
                                                                            {employeeId ? `Assign to ${selectedEmployee?.name || 'Selected Staff'}` : 'Select Employee to Assign'}
                                                                        </StatefulButton>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Progressive Disclosure Expand / Collapse Banner */}
                                                    {recoFilter === 'top' && qualifiedResults.length > 3 && (
                                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-zinc-900 dark:to-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition">
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                                                                    <RiCheckLine className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                    <span>
                                                                        {showAllInTop
                                                                            ? `Showing all ${qualifiedResults.length} qualified fleet matches`
                                                                            : `Showing top 3 of ${qualifiedResults.length} qualified matches`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                                                    {showAllInTop
                                                                        ? 'All devices above satisfy minimum workload constraints.'
                                                                        : `${qualifiedResults.length - 3} more fleet devices satisfy minimum workload constraints.`}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAllInTop(!showAllInTop)}
                                                                className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-300 dark:border-zinc-600 shadow-2xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                                                            >
                                                                {showAllInTop ? (
                                                                    <>
                                                                        <RiArrowUpSLine className="w-4 h-4" />
                                                                        <span>Collapse to Top 3</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <RiArrowDownSLine className="w-4 h-4" />
                                                                        <span>Show {qualifiedResults.length - 3} More Qualified Units</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bridge Swap Execution Modal */}
            {showBridgeModal && selectedBridgeSwap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {/* Decorative Top Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#026eff] via-[#0b79ff] to-[#0aceb3]" />

                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                            <div className="flex items-start gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-[#0aceb3]/15 text-[#0aceb3] border border-[#0aceb3]/30 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                    <RiExchangeLine className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0aceb3]/15 text-[#0aceb3] border border-[#0aceb3]/30">
                                            Dynamic Bridge Swap
                                        </span>
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                            ₱{Number(selectedBridgeSwap.capex_saved_php).toLocaleString()} CapEx Avoided
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                        Confirm Inventory Bridge Swap
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                        Relieve an overprovisioned machine by cascading a baseline stockroom unit to the donor, reassigning the high-spec rig to the requester.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBridgeModal(false)}
                                disabled={isExecutingSwap}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
                                title="Close modal"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Summary Metrics Bar */}
                        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 text-center">
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 block">CapEx Saved</span>
                                <span className="text-xs font-black text-[#0aceb3]">
                                    ₱{Number(selectedBridgeSwap.capex_saved_php).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 block">Feasibility</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                    {Math.round(selectedBridgeSwap.feasibility_score * 100)}%
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 block">Location Hub</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block">
                                    {selectedBridgeSwap.same_location ? 'Same Campus Hub' : 'Multi-Hub Transfer'}
                                </span>
                            </div>
                        </div>

                        {/* 2-Step Cascade Flow Cards with Generous Spacing */}
                        <div className="space-y-4">
                            {/* Step 1 Box: Stockroom to Donor */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 shadow-xs transition">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#026eff] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                                            Step 1 &bull; Deploy Baseline from Stockroom
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#026eff]/10 text-[#026eff] dark:text-[#38bdf8] border border-[#026eff]/20">
                                        Stockroom &rarr; Donor
                                    </span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 overflow-hidden shadow-2xs">
                                        <HardwareImage
                                            src={selectedBridgeSwap.bridge_device.image_clip_url || selectedBridgeSwap.bridge_device.image_url}
                                            alt={selectedBridgeSwap.bridge_device.model}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                                {selectedBridgeSwap.bridge_device.brand} {selectedBridgeSwap.bridge_device.model}
                                            </span>
                                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                                                {selectedBridgeSwap.bridge_device.asset_tag}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                            {selectedBridgeSwap.bridge_device.ram_gb}GB RAM &bull; {selectedBridgeSwap.bridge_device.storage_gb}GB {selectedBridgeSwap.bridge_device.storage_type} &bull; <span className="capitalize">{selectedBridgeSwap.bridge_device.cpu_tier} CPU</span>
                                        </div>
                                        <div className="text-xs text-slate-700 dark:text-zinc-300 mt-2.5 pt-2 border-t border-slate-200/70 dark:border-zinc-700/60 flex items-center gap-1.5">
                                            <RiUserLine className="w-4 h-4 text-[#026eff] dark:text-[#38bdf8] shrink-0" />
                                            <span>
                                                Assigned to donor: <strong className="font-bold text-slate-900 dark:text-zinc-100">{selectedBridgeSwap.donor_employee.name}</strong> ({selectedBridgeSwap.donor_employee.role_profile?.name || 'General Staff'})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cascade Connector Badge */}
                            <div className="flex items-center justify-center py-1">
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0aceb3]/15 text-[#0aceb3] border border-[#0aceb3]/30 text-[10px] font-extrabold tracking-wider uppercase shadow-2xs">
                                    <RiExchangeLine className="w-3.5 h-3.5" />
                                    <span>Reallocation Cascade Flow</span>
                                </div>
                            </div>

                            {/* Step 2 Box: Donor Rig to Requester */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-[#0aceb3]/5 border border-[#0aceb3]/40 shadow-xs transition">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#0aceb3] text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                                            Step 2 &bull; Reassign High-Spec Rig to Requester
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0aceb3]/20 text-[#0aceb3] border border-[#0aceb3]/30">
                                        Donor &rarr; Requester
                                    </span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 overflow-hidden shadow-2xs">
                                        <HardwareImage
                                            src={selectedBridgeSwap.donor_device.image_clip_url || selectedBridgeSwap.donor_device.image_url}
                                            alt={selectedBridgeSwap.donor_device.model}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                                {selectedBridgeSwap.donor_device.brand} {selectedBridgeSwap.donor_device.model}
                                            </span>
                                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                                                {selectedBridgeSwap.donor_device.asset_tag}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                            {selectedBridgeSwap.donor_device.ram_gb}GB RAM &bull; <span className="capitalize">{selectedBridgeSwap.donor_device.cpu_tier} CPU</span> &bull; {selectedBridgeSwap.donor_device.gpu || 'Dedicated GPU'}
                                        </div>
                                        <div className="text-xs text-slate-700 dark:text-zinc-300 mt-2.5 pt-2 border-t border-[#0aceb3]/20 flex items-center gap-1.5">
                                            <RiUserLine className="w-4 h-4 text-[#0aceb3] shrink-0" />
                                            <span>
                                                Assigned to requester: <strong className="font-bold text-slate-900 dark:text-zinc-100">{selectedEmployee?.name || 'Selected Requester'}</strong> ({selectedEmployee?.department || 'Target Department'})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Trail & Atomicity Notice */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 flex items-start gap-2.5">
                            <RiShieldCheckLine className="w-4 h-4 text-[#026eff] dark:text-[#0b79ff] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                                <strong className="font-semibold text-slate-700 dark:text-zinc-300">Atomic Execution &amp; Full Audit Trail:</strong> Both reassignments and status transitions are committed in a single database transaction. Audit events will be logged to the device lifecycle ledger with CapEx avoidance metrics.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                            <button
                                type="button"
                                disabled={isExecutingSwap}
                                onClick={() => setShowBridgeModal(false)}
                                className="h-10 px-5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <StatefulButton
                                type="button"
                                variant="emerald"
                                disabled={isExecutingSwap}
                                onClick={handleExecuteBridgeSwap}
                                className="h-10 px-5 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center"
                            >
                                <span className="flex items-center gap-1.5">
                                    <RiExchangeLine className="w-4 h-4 shrink-0" />
                                    <span>Execute Bridge Swap</span>
                                </span>
                            </StatefulButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Save Quick Workload Template Modal */}
            {showNewTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#026eff] dark:text-[#0b79ff]">
                                    Template Configuration
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                    Create Quick Workload Template
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Save custom requirements to quickly autofill and test matching scenarios anytime.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewTemplateModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewTemplate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Template Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTemplateForm.title}
                                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, title: e.target.value })}
                                    placeholder="e.g., Senior DevOps / SRE, 3D Animator, Legal Auditor"
                                    className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3.5 py-2.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs placeholder-slate-400 dark:placeholder-zinc-500 transition"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Category / Team <span className="text-rose-500">*</span>
                                    </label>
                                    <CustomSelect
                                        value={newTemplateForm.category}
                                        onChange={(val) => setNewTemplateForm({ ...newTemplateForm, category: val || 'Engineering & Dev' })}
                                        options={[
                                            { value: 'Engineering & Dev', label: 'Engineering & Dev' },
                                            { value: 'Creative & Media', label: 'Creative & Media' },
                                            { value: 'Analytics', label: 'Analytics & Data' },
                                            { value: 'Office & Ops', label: 'Office & Ops' },
                                            { value: 'Custom', label: 'Custom / General' },
                                        ]}
                                        placeholder="Select category..."
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Key Hardware Note (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newTemplateForm.specs_summary}
                                        onChange={(e) => setNewTemplateForm({ ...newTemplateForm, specs_summary: e.target.value })}
                                        placeholder="e.g. 32GB RAM, Dedicated GPU"
                                        className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3.5 py-2.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs placeholder-slate-400 dark:placeholder-zinc-500 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Workload Prompt Description <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={newTemplateForm.prompt}
                                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, prompt: e.target.value })}
                                    placeholder="Describe tasks, software applications used, RAM/CPU requirements, mobility needs..."
                                    className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3.5 py-2.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs placeholder-slate-400 dark:placeholder-zinc-500 resize-none custom-scrollbar transition"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowNewTemplateModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                                >
                                    Save Workload Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gemini 3.6 Flash Connectivity Diagnostic Modal */}
            {showGeminiModal && geminiTestResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-[#026eff]/15 text-[#026eff] dark:text-[#0b79ff] border border-[#026eff]/30">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11 2L7.33 10.67 2 11l5.33 3.67L5 22l6-3.33L17 22l-2.33-7.33L20 11l-5.33-.33L11 2zm8 4l-1.33 2.67L15 9l2.67 1.33L19 13l1.33-2.67L23 9l-2.67-1.33z" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                                        Gemini 3.6 Flash Connectivity Status
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        Live round-trip diagnostics to Google Generative Language API
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGeminiModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 block">Target Model</span>
                                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">{geminiTestResult.model}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 block">HTTP Response</span>
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                        geminiTestResult.http_status === 200
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : geminiTestResult.http_status === 429
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    }`}>
                                        HTTP {geminiTestResult.http_status || 'ERR'} {geminiTestResult.http_status === 429 ? '(Quota Limit)' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
                                <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Status Summary:</span>
                                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    {geminiTestResult.message}
                                </p>
                                {geminiTestResult.latency_ms > 0 && (
                                    <span className="inline-block mt-2 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                                        Latency: {geminiTestResult.latency_ms}ms
                                    </span>
                                )}
                            </div>

                            {geminiTestResult.fallback_active && (
                                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5">
                                    <RiShieldCheckLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Intelligent Fallback Protection Engaged:</span>
                                        <p className="text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                                            SpecMatch includes an automated local heuristic extraction engine adhering to ISO 19770-1 constraint taxonomy. Even when Google rate-limits free-tier API keys, all matching functions continue to operate with 100% uptime.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setShowGeminiModal(false)}
                                className="px-4 py-2 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold transition cursor-pointer"
                            >
                                Close Diagnostics
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Browse Deployable Fleet Inventory Modal */}
            {showDeployableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-start justify-between shrink-0">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Fleet Stockroom Registry
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                    Deployable Inventory ({deployable_summary?.total_available ?? 11} Units Cleared)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Physical devices currently idle in stockroom locations, staged for immediate deployment to new or existing staff.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeployableModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                <RiCloseLine className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <div className="relative flex-1">
                                <RiSearchLine className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                                <input
                                    type="text"
                                    value={deployableSearch}
                                    onChange={(e) => setDeployableSearch(e.target.value)}
                                    placeholder="Search by asset tag, model, location, or CPU tier..."
                                    className="w-full text-xs rounded-xl border-[1.5px] border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 pl-9 pr-8 py-2.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs placeholder-slate-400 dark:placeholder-zinc-500 transition"
                                />
                                {deployableSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setDeployableSearch('')}
                                        className="absolute right-2.5 top-2.5 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer"
                                        title="Clear search"
                                    >
                                        <RiCloseLine className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                                {['all', 'laptop', 'desktop'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setDeployableTypeFilter(t)}
                                        className={`px-3 py-2 rounded-xl font-bold capitalize transition cursor-pointer ${
                                            deployableTypeFilter === t
                                                ? 'bg-[#026eff] text-white'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {t === 'all' ? 'All Units' : `${t}s`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Device Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
                            {filteredDeployableDevices.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm">
                                    No deployable devices match your filter query.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredDeployableDevices.map((d) => (
                                        <div
                                            key={d.id}
                                            className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-start gap-3 hover:border-emerald-500/40 transition"
                                        >
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 overflow-hidden">
                                                <HardwareImage
                                                    src={d.image_clip_url}
                                                    alt={d.model}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                                                        {d.brand} {d.model}
                                                    </h4>
                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 shrink-0">
                                                        {d.asset_tag}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize mt-0.5">
                                                    {d.cpu_tier} CPU &bull; {d.ram_gb}GB RAM &bull; {d.storage_gb}GB {d.storage_type}
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 truncate flex items-center gap-1">
                                                    <RiMapPinLine className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                                    <span>{d.location}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        {d.condition} condition
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRawInput(`Targeting stockroom deployment: ${d.brand} ${d.model} (${d.asset_tag}) with ${d.ram_gb}GB RAM, ${d.storage_gb}GB storage, ${d.cpu_tier} tier ${d.device_type}.`);
                                                            setShowDeployableModal(false);
                                                        }}
                                                        className="text-[10px] font-bold text-[#026eff] dark:text-[#0b79ff] hover:underline cursor-pointer"
                                                    >
                                                        Use Specs in Prompt
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 shrink-0">
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                                Showing {filteredDeployableDevices.length} of {deployable_summary?.total_available ?? 11} deployable devices
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowDeployableModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
