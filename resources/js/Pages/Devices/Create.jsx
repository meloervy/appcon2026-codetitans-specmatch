import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import FileUpload from '@/Components/ui/FileUpload';
import HardwareImage from '@/Components/HardwareImage';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import {
    RiApps2Line,
    RiArrowLeftLine,
    RiBarcodeLine,
    RiCheckboxCircleLine,
    RiCheckLine,
    RiCloseLine,
    RiComputerLine,
    RiCpuLine,
    RiEqualizerLine,
    RiFireLine,
    RiFlashlightLine,
    RiFolderImageLine,
    RiGoogleFill,
    RiImageAddLine,
    RiInformationLine,
    RiLoader4Line,
    RiMagicLine,
    RiMapPinLine,
    RiMoneyDollarCircleLine,
    RiPriceTag3Line,
    RiPulseLine,
    RiSearchLine,
    RiShieldCheckLine,
    RiSparklingLine,
    RiSpeedUpLine,
} from 'react-icons/ri';

const deviceTypeOptions = [
    { value: 'laptop', label: 'Laptop (Mobile Workstation / Portable)' },
    { value: 'desktop', label: 'Desktop / Workstation (Stationary)' },
];

const cpuTierOptions = [
    { value: 'entry', label: 'Entry (Celeron, Core i3, older quad-core, Intel N-series)' },
    { value: 'mid', label: 'Mid (Core i5, Ryzen 5, Apple base, Snapdragon X Plus, Core Ultra 5)' },
    { value: 'high', label: 'High (Core i7/i9, Core Ultra 7/9, Ryzen 7/9, Ryzen AI, Snapdragon X Elite, M3/M4)' },
    { value: 'workstation', label: 'Workstation (Xeon, Threadripper, M-series Ultra)' },
];

const storageTypeOptions = [
    { value: 'SSD', label: 'SSD (NVMe / Solid State)' },
    { value: 'HDD', label: 'HDD (Mechanical Hard Drive)' },
];

const gpuTierOptions = [
    { value: 'none', label: 'None' },
    { value: 'integrated', label: 'Integrated (Intel UHD/Iris/Arc, Snapdragon Adreno, Apple GPU, Radeon 890M)' },
    { value: 'dedicated-entry', label: 'Dedicated Entry (GTX 1650, RTX 3050)' },
    { value: 'dedicated-high', label: 'Dedicated High (RTX 4070+, Ada, A-series, Apple Max/Ultra)' },
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

// Supported Brands for Autocomplete & Quick-Pills
const supportedBrands = [
    'Apple', 'Dell', 'Lenovo', 'HP', 'ASUS', 'Acer', 'Microsoft', 'Samsung',
    'Google', 'Framework', 'MSI', 'Minisforum', 'Beelink', 'Razer', 'Gigabyte', 'Intel', 'LG',
];

// Popular Model Datalist
const supportedModels = [
    'Surface Laptop 7 Copilot+ PC',
    'Surface Pro 11 Copilot+ PC',
    'ThinkPad T14s Gen 6 Snapdragon',
    'XPS 13 9345 Snapdragon',
    'OmniBook X 14 Snapdragon',
    'Vivobook S 15 OLED Snapdragon',
    'Swift 14 AI Snapdragon',
    'Galaxy Book4 Edge',
    'Chromebook Spin 714',
    'Chromebook Plus 515',
    'Chromebook Plus CX34',
    'Chromebook x360 14',
    'IdeaPad Slim 3 Chromebook',
    'Galaxy Chromebook 2',
    'ThinkPad X1 Carbon Gen 12',
    'ThinkPad T14 Gen 5',
    'XPS 14 9440 Core Ultra',
    'XPS 16 9640 Core Ultra',
    'Zenbook S 14 Lunar Lake',
    'Zenbook S 16 Ryzen AI',
    'OmniBook Ultra Ryzen AI',
    'EliteBook 840 G10',
    'MacBook Pro 16 M4 Pro',
    'MacBook Pro 14 M4',
    'MacBook Air 15 M3',
    'MacBook Air 13 M3',
    'Mac mini M4 Desktop',
    'Mac Studio M2 Max',
    'ThinkCentre M70q Tiny',
    'OptiPlex Micro Plus',
    'Pro Mini 400 G9',
    'EliteMini UM780 XTX',
    'Precision 7875 Workstation',
];

// Supported CPUs for Fast Autocomplete
const supportedCpus = [
    'Qualcomm Snapdragon X Elite X1E-84-100',
    'Qualcomm Snapdragon X Elite X1E-80-100',
    'Qualcomm Snapdragon X Elite X1E-78-100',
    'Qualcomm Snapdragon X Plus X1P-64-100',
    'Intel Core Ultra 9 288V',
    'Intel Core Ultra 7 258V',
    'Intel Core Ultra 7 155H',
    'Intel Core Ultra 5 125H',
    'Intel Core i9-14900HX',
    'Intel Core i7-13700H',
    'Intel Core i5-1335U',
    'Intel Core i3-1215U',
    'Intel Processor N100',
    'Intel Processor N200',
    'MediaTek Kompanio 520',
    'AMD Ryzen AI 9 HX 370',
    'AMD Ryzen AI 9 365',
    'AMD Ryzen 7 8840U',
    'AMD Ryzen 7 7840U',
    'AMD Ryzen 5 7530U',
    'AMD Ryzen Threadripper PRO 7995WX',
    'Apple M4 Pro',
    'Apple M4 Max',
    'Apple M4',
    'Apple M3 Max',
    'Apple M3 Pro',
    'Apple M3',
    'Apple M2 Ultra',
];

// Quick Architecture Chips for the AI Search Bar
const architectureQuickChips = [
    {
        id: 'snapdragon',
        name: 'Snapdragon Copilot+',
        icon: '⚡',
        chips: [
            { label: 'Surface Laptop 7 (Snapdragon X Elite)', query: 'Surface Laptop 7 Snapdragon X Elite 32GB' },
            { label: 'ThinkPad T14s Gen 6 Snapdragon', query: 'ThinkPad T14s Gen 6 Snapdragon X Elite 32GB' },
            { label: 'Dell XPS 13 9345 (Snapdragon)', query: 'Dell XPS 13 9345 Snapdragon X Elite 16GB' },
            { label: 'ASUS Vivobook S 15 OLED', query: 'ASUS Vivobook S 15 OLED Snapdragon X Plus 16GB' },
            { label: 'HP OmniBook X 14', query: 'HP OmniBook X 14 Snapdragon X Elite 16GB' },
        ],
    },
    {
        id: 'chromebook',
        name: 'Chromebooks & Cloud',
        icon: '☁️',
        chips: [
            { label: 'Acer Chromebook Spin 714', query: 'Acer Chromebook Spin 714 Intel N100 8GB' },
            { label: 'HP Chromebook x360 14', query: 'HP Chromebook x360 Intel N100 8GB' },
            { label: 'Lenovo IdeaPad Slim 3 Chromebook', query: 'Lenovo IdeaPad Slim 3 Chromebook 8GB' },
            { label: 'ASUS Chromebook Plus CX34', query: 'ASUS Chromebook Plus CX34 Intel Core i3 8GB' },
            { label: 'Samsung Galaxy Chromebook 2', query: 'Samsung Galaxy Chromebook 2 Intel Celeron 8GB' },
        ],
    },
    {
        id: 'apple',
        name: 'Apple Silicon',
        icon: '🍏',
        chips: [
            { label: 'MacBook Pro 16 (M4 Pro)', query: 'MacBook Pro 16 M4 Pro 36GB SSD' },
            { label: 'MacBook Air 15 (M3)', query: 'MacBook Air 15 M3 16GB 512GB' },
            { label: 'Mac mini M4 Desktop', query: 'Apple Mac mini M4 16GB 512GB SSD' },
            { label: 'Mac Studio M2 Max', query: 'Apple Mac Studio M2 Max 32GB' },
        ],
    },
    {
        id: 'intel_ultra',
        name: 'Core Ultra & Lunar Lake',
        icon: '🚀',
        chips: [
            { label: 'ThinkPad X1 Carbon Gen 12', query: 'ThinkPad X1 Carbon Intel Core Ultra 7 155H 32GB' },
            { label: 'Dell XPS 14 Core Ultra 7', query: 'Dell XPS 14 Intel Core Ultra 7 32GB SSD' },
            { label: 'ASUS Zenbook S 14 (Lunar Lake)', query: 'ASUS Zenbook S 14 Intel Core Ultra 7 258V 32GB' },
        ],
    },
    {
        id: 'ryzen_ai',
        name: 'Ryzen AI & Workstations',
        icon: '🔴',
        chips: [
            { label: 'ASUS Zenbook S 16 Ryzen AI 9', query: 'ASUS Zenbook S 16 AMD Ryzen AI 9 HX 370 32GB' },
            { label: 'HP OmniBook Ultra Ryzen AI', query: 'HP OmniBook Ultra AMD Ryzen AI 9 32GB' },
            { label: 'Dell Precision 7875 AI Workstation', query: 'Dell Precision 7875 AMD Threadripper 64GB Workstation' },
            { label: 'Lenovo ThinkCentre M70q Tiny', query: 'Lenovo ThinkCentre M70q Tiny Intel Core i5 16GB Desktop' },
        ],
    },
];

// Pre-configured 1-Click ITAM Enterprise Templates
const fullHardwareTemplates = [
    {
        title: 'Copilot+ AI Laptop',
        subtitle: 'Snapdragon X Elite · 32GB RAM · 1TB SSD',
        badge: 'ARM64 Copilot+',
        badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        data: {
            brand: 'Microsoft',
            model: 'Surface Laptop 7 Copilot+ PC',
            device_type: 'laptop',
            cpu: 'Qualcomm Snapdragon X Elite X1E-80-100',
            cpu_tier: 'high',
            ram_gb: 32,
            storage_type: 'SSD',
            storage_gb: 1024,
            gpu: 'Qualcomm Adreno X1-85 GPU',
            gpu_tier: 'integrated',
            vendor: 'Microsoft Direct',
            purchase_cost: '94990.00',
            image_url: '/images/devices/default-laptop.jpg',
        },
    },
    {
        title: 'Cloud Fleet Chromebook',
        subtitle: 'Intel N100 · 8GB RAM · 128GB SSD',
        badge: 'ChromeOS Cloud',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        data: {
            brand: 'Acer',
            model: 'Chromebook Spin 714',
            device_type: 'laptop',
            cpu: 'Intel Processor N100',
            cpu_tier: 'entry',
            ram_gb: 8,
            storage_type: 'SSD',
            storage_gb: 128,
            gpu: 'Intel UHD Graphics',
            gpu_tier: 'integrated',
            vendor: 'Acer Commercial',
            purchase_cost: '24999.00',
            image_url: '/images/devices/acer-aspire.jpg',
        },
    },
    {
        title: 'Executive Ultraportable',
        subtitle: 'Core Ultra 7 · 32GB RAM · 1TB SSD',
        badge: 'Intel AI Boost',
        badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        data: {
            brand: 'Lenovo',
            model: 'ThinkPad X1 Carbon Gen 12',
            device_type: 'laptop',
            cpu: 'Intel Core Ultra 7 155H',
            cpu_tier: 'high',
            ram_gb: 32,
            storage_type: 'SSD',
            storage_gb: 1024,
            gpu: 'Intel Arc Graphics',
            gpu_tier: 'integrated',
            vendor: 'Lenovo Premier',
            purchase_cost: '115000.00',
            image_url: '/images/devices/lenovo-thinkpad-x1.jpg',
        },
    },
    {
        title: 'Apple Engineering Workhorse',
        subtitle: 'MacBook Pro 16 · M4 Pro · 36GB RAM',
        badge: 'Apple Silicon',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        data: {
            brand: 'Apple',
            model: 'MacBook Pro 16',
            device_type: 'laptop',
            cpu: 'Apple M4 Pro',
            cpu_tier: 'high',
            ram_gb: 36,
            storage_type: 'SSD',
            storage_gb: 1024,
            gpu: 'Apple 18-core GPU',
            gpu_tier: 'integrated',
            vendor: 'Apple Enterprise',
            purchase_cost: '149990.00',
            image_url: '/images/devices/apple-macbook-pro.jpg',
        },
    },
    {
        title: 'Compact Desk Node',
        subtitle: 'Apple Mac mini M4 · 16GB RAM · Desktop',
        badge: 'Mini PC Desktop',
        badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        data: {
            brand: 'Apple',
            model: 'Mac mini M4',
            device_type: 'desktop',
            cpu: 'Apple M4',
            cpu_tier: 'high',
            ram_gb: 16,
            storage_type: 'SSD',
            storage_gb: 512,
            gpu: 'Apple 10-core GPU',
            gpu_tier: 'integrated',
            vendor: 'Apple Enterprise',
            purchase_cost: '44990.00',
            image_url: '/images/devices/default-desktop.jpg',
        },
    },
    {
        title: 'Enterprise Tiny Desktop',
        subtitle: 'ThinkCentre M70q Tiny · Core i5 · 16GB',
        badge: 'Micro Desktop',
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        data: {
            brand: 'Lenovo',
            model: 'ThinkCentre M70q Tiny',
            device_type: 'desktop',
            cpu: 'Intel Core i5-13500T',
            cpu_tier: 'mid',
            ram_gb: 16,
            storage_type: 'SSD',
            storage_gb: 512,
            gpu: 'Intel UHD Graphics 770',
            gpu_tier: 'integrated',
            vendor: 'Lenovo Enterprise',
            purchase_cost: '48000.00',
            image_url: '/images/devices/lenovo-thinkcentre.jpg',
        },
    },
];

// Helper: Detect Architecture & AI NPU tier
const getDetectedArchitectureInfo = (deviceData) => {
    const text = `${deviceData.brand || ''} ${deviceData.model || ''} ${deviceData.cpu || ''}`.toLowerCase();

    if (text.includes('snapdragon') || text.includes('x elite') || text.includes('x plus') || text.includes('copilot+')) {
        return {
            arch: 'ARM64 Qualcomm Oryon',
            archLabel: 'ARM64 (Qualcomm Snapdragon)',
            badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
            npu: '45 TOPS Hexagon NPU',
            aiCertified: 'Copilot+ PC Certified',
            isCopilotPlus: true,
        };
    }
    if (text.includes('apple') || text.includes('macbook') || text.includes('mac mini') || text.includes('mac studio') || text.includes('m1') || text.includes('m2') || text.includes('m3') || text.includes('m4') || text.includes('m5')) {
        return {
            arch: 'ARM64 Apple Silicon',
            archLabel: 'ARM64 (Apple Silicon)',
            badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
            npu: '16-Core Neural Engine (38 TOPS)',
            aiCertified: 'Apple Intelligence Ready',
            isCopilotPlus: false,
        };
    }
    if (text.includes('chromebook') || text.includes('chromeos') || text.includes('kompanio') || text.includes('n100') || text.includes('n200')) {
        return {
            arch: 'Cloud / ChromeOS Optimized',
            archLabel: 'Cloud Endpoint (ChromeOS)',
            badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
            npu: 'Cloud-Grounded AI',
            aiCertified: 'Chromebook Plus Ready',
            isCopilotPlus: false,
        };
    }
    if (text.includes('core ultra') || text.includes('lunar lake') || text.includes('meteor lake')) {
        return {
            arch: 'x86_64 Intel Core Ultra',
            archLabel: 'x86_64 (Intel Core Ultra)',
            badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
            npu: 'Intel AI Boost NPU (47 TOPS)',
            aiCertified: 'Copilot+ / Intel AI Ready',
            isCopilotPlus: true,
        };
    }
    if (text.includes('ryzen ai') || text.includes('hx 370') || text.includes('365')) {
        return {
            arch: 'x86_64 AMD Zen 5 (Strix Point)',
            archLabel: 'x86_64 (AMD Ryzen AI 300)',
            badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
            npu: 'AMD XDNA 2 NPU (50 TOPS)',
            aiCertified: 'Copilot+ / Ryzen AI Ready',
            isCopilotPlus: true,
        };
    }
    return {
        arch: 'x86_64 Standard Architecture',
        archLabel: 'x86_64 Standard Architecture',
        badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-zinc-400 border-slate-500/20',
        npu: 'Standard Compute',
        aiCertified: 'Enterprise Standard',
        isCopilotPlus: false,
    };
};

// Helper: Workload fitness score
const calculateWorkloadFit = (deviceData) => {
    const ram = Number(deviceData.ram_gb) || 0;
    const cpuTier = deviceData.cpu_tier || 'mid';
    const gpuTier = deviceData.gpu_tier || 'none';
    const storage = Number(deviceData.storage_gb) || 0;

    let dev = 50;
    if (ram >= 32) dev += 30;
    else if (ram >= 16) dev += 20;
    else if (ram >= 8) dev += 5;
    if (['high', 'workstation'].includes(cpuTier)) dev += 20;
    else if (cpuTier === 'mid') dev += 10;
    if (storage >= 512) dev += 10;
    dev = Math.min(100, dev);

    let design = 35;
    if (['dedicated-high', 'dedicated-entry'].includes(gpuTier)) design += 40;
    else if (gpuTier === 'integrated') design += 20;
    if (ram >= 32) design += 25;
    else if (ram >= 16) design += 15;
    design = Math.min(100, design);

    let admin = 65;
    if (ram >= 8) admin += 25;
    if (storage >= 256) admin += 10;
    admin = Math.min(100, admin);

    return { dev, design, admin };
};

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

    // AI Spec Identification State (Gemini 3.1 Flash-Lite)
    const [searchQuery, setSearchQuery] = useState('');
    const [identifying, setIdentifying] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [autoFilledNotice, setAutoFilledNotice] = useState(null);
    const [aiSource, setAiSource] = useState(null);

    // Architecture Category Tabs & Templates Drawer State
    const [selectedArchCategory, setSelectedArchCategory] = useState('snapdragon');
    const [showTemplatesDrawer, setShowTemplatesDrawer] = useState(false);

    // Hardware Photo Lookup State
    const [fetchingPhoto, setFetchingPhoto] = useState(false);
    const [photoNotice, setPhotoNotice] = useState(null);

    const handleFetchHardwarePhoto = async (preference = 'public_asset') => {
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
                prefer: preference,
            });
            if (res.data.image_url) {
                setData('image_url', res.data.image_url);
                const sourceLabel = res.data.source === 'public_asset'
                    ? 'Public Asset Folder'
                    : res.data.source === 'google_search'
                    ? 'Google Image Search'
                    : 'Hardware Registry';
                setPhotoNotice({
                    type: 'success',
                    message: `Found authentic photo from ${sourceLabel}.`,
                });
            } else {
                setPhotoNotice({
                    type: 'info',
                    message: preference === 'google_search'
                        ? 'No image found via Google Search. You may fetch from Public Asset or upload a photo.'
                        : 'No matching photo in public assets. You may upload a local image or enter a custom URL.',
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

    const handleAiIdentify = async (e, queryOverride = null) => {
        if (e && e.preventDefault) e.preventDefault();
        const targetQuery = (queryOverride || searchQuery || '').trim();
        if (!targetQuery || targetQuery.length < 2) return;

        setSearchQuery(targetQuery);
        setIdentifying(true);
        setApiError(null);
        setAutoFilledNotice(null);
        setAiSource(null);

        try {
            const res = await axios.post(route('devices.identify-specs'), {
                query: targetQuery,
            });

            if (res.data.success && res.data.specs) {
                const specs = res.data.specs;
                setData((prev) => ({
                    ...prev,
                    brand: specs.brand || prev.brand,
                    model: specs.model || prev.model,
                    device_type: specs.device_type || prev.device_type,
                    cpu: specs.cpu || prev.cpu,
                    cpu_tier: specs.cpu_tier || prev.cpu_tier,
                    ram_gb: specs.ram_gb || prev.ram_gb,
                    storage_type: specs.storage_type || prev.storage_type,
                    storage_gb: specs.storage_gb || prev.storage_gb,
                    gpu: specs.gpu || prev.gpu,
                    gpu_tier: specs.gpu_tier || prev.gpu_tier,
                    year_acquired: specs.year_acquired || prev.year_acquired,
                    vendor: prev.vendor || specs.brand,
                    image_url: specs.image_url || prev.image_url,
                }));

                const hasPhoto = Boolean(specs.image_url);
                setAutoFilledNotice(
                    `AI identified and auto-populated hardware specs for "${specs.brand} ${specs.model}" via Gemini 3.1 Flash-Lite.` +
                    (hasPhoto ? ' Device photo automatically matched.' : '')
                );
                setAiSource(res.data.source);
                if (hasPhoto) {
                    setPhotoNotice({
                        type: 'success',
                        message: 'Hardware photo automatically matched and loaded from Public Asset Folder.',
                    });
                }
            } else {
                setApiError(res.data.error || 'AI could not identify this device. Please enter specs manually.');
            }
        } catch (err) {
            setApiError(err.response?.data?.error || 'Failed to identify device. Please enter specs manually.');
        } finally {
            setIdentifying(false);
        }
    };

    const handleApplyTemplate = (template) => {
        setData((prev) => ({
            ...prev,
            ...template.data,
            asset_tag: prev.asset_tag || `${template.data.device_type === 'desktop' ? 'DSK' : 'LAP'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        }));
        setAutoFilledNotice(`Loaded 1-click enterprise template: "${template.title}" (${template.subtitle}).`);
        setAiSource('template_preset');
    };

    const generateAssetTag = () => {
        const prefix = data.device_type === 'desktop' ? 'DSK' : 'LAP';
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const tag = `${prefix}-${year}-${rand}`;
        setData('asset_tag', tag);
        if (!data.barcode) {
            setData('barcode', `BC-${tag}`);
        }
    };

    const generateBarcode = () => {
        const base = data.asset_tag || `${data.device_type === 'desktop' ? 'DSK' : 'LAP'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setData('barcode', `BC-${base.replace(/[^A-Z0-9-]/gi, '')}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('devices.store'));
    };

    // Calculate preview image
    const previewImage = data.image_url || (
        data.brand.toLowerCase().includes('apple') || data.model.toLowerCase().includes('macbook')
            ? (data.model.toLowerCase().includes('air') ? '/images/devices/apple-macbook-air.jpg' : '/images/devices/apple-macbook-pro.jpg')
            : data.brand.toLowerCase().includes('dell')
            ? '/images/devices/dell-xps.jpg'
            : data.brand.toLowerCase().includes('lenovo')
            ? '/images/devices/lenovo-thinkpad.jpg'
            : data.brand.toLowerCase().includes('hp')
            ? '/images/devices/hp-elitebook.jpg'
            : (data.device_type === 'desktop' ? '/images/devices/default-desktop.jpg' : '/images/devices/default-laptop.jpg')
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
                            Hardware enrollment with Gemini 3.1 Flash-Lite automated specification identification and enterprise ITAM lifecycle tracking.
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
                {/* AI-Powered Spec Identification Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-slate-700/60 dark:border-zinc-800 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#026eff]/30 text-[#38bdf8] rounded-lg border border-[#026eff]/40">
                                    <RiSparklingLine className="w-3.5 h-3.5" />
                                    Gemini 3.1 Flash-Lite Engine
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    ARM64 &amp; Modern x86 Grounded
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Automated Asset Identification</h2>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Enter any new-gen or enterprise device to auto-populate processor architecture, RAM, storage, GPU tier, and authentic media using Gemini AI.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                            <button
                                type="button"
                                onClick={() => setShowTemplatesDrawer(!showTemplatesDrawer)}
                                className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                    showTemplatesDrawer
                                        ? 'bg-white/20 border-white/40 text-white'
                                        : 'bg-white/10 hover:bg-white/15 border-white/20 text-slate-200'
                                }`}
                                title="Toggle 1-Click ITAM Hardware Profile Templates"
                            >
                                <RiApps2Line className="w-4 h-4 text-[#38bdf8]" />
                                <span>{showTemplatesDrawer ? 'Hide Templates' : '⚡ 1-Click Presets'}</span>
                            </button>

                            <form onSubmit={(e) => handleAiIdentify(e)} className="flex gap-2 flex-1 sm:w-80">
                                <div className="relative flex-1">
                                    <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="e.g. Surface Laptop 7, Spin 714, M4 Pro..."
                                        className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-[#026eff] focus:border-[#026eff] transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={identifying || searchQuery.trim().length < 2}
                                    className="shrink-0 px-4 py-2.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    {identifying ? (
                                        <>
                                            <RiLoader4Line className="animate-spin w-4 h-4" />
                                            <span>Identifying...</span>
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
                    </div>

                    {/* 1-Click Enterprise Hardware Profile Templates Drawer */}
                    {showTemplatesDrawer && (
                        <div className="pt-4 border-t border-slate-700/60">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <RiFlashlightLine className="w-3.5 h-3.5 text-amber-400" />
                                        1-Click Enterprise Fleet Templates
                                    </h3>
                                    <p className="text-[11px] text-slate-400">Instantly populate verified enterprise configurations without typing.</p>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">6 Pre-Configured SKUs</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {fullHardwareTemplates.map((template, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${template.badgeColor}`}>
                                                    {template.badge}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400">₱{Number(template.data.purchase_cost).toLocaleString()}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors">{template.title}</h4>
                                            <p className="text-[11px] text-slate-300 mt-0.5">{template.subtitle}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleApplyTemplate(template)}
                                            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#026eff]/20 hover:bg-[#026eff] text-[#38bdf8] hover:text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <RiCheckLine className="w-3.5 h-3.5" />
                                            <span>Apply Template</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Generation & Modern Architecture Chips Selector */}
                    <div className="pt-3 border-t border-slate-700/60 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <RiSpeedUpLine className="w-3.5 h-3.5 text-sky-400" />
                                Quick Auto-Fill by Architecture:
                            </span>

                            {/* Architecture Filter Tabs */}
                            <div className="flex items-center gap-1 flex-wrap">
                                {architectureQuickChips.map((arch) => (
                                    <button
                                        key={arch.id}
                                        type="button"
                                        onClick={() => setSelectedArchCategory(arch.id)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                                            selectedArchCategory === arch.id
                                                ? 'bg-[#026eff] text-white shadow-2xs'
                                                : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                        }`}
                                    >
                                        <span>{arch.icon}</span>
                                        <span>{arch.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Model Chips for Selected Architecture */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {architectureQuickChips
                                .find((arch) => arch.id === selectedArchCategory)
                                ?.chips.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={identifying}
                                        onClick={() => handleAiIdentify(null, chip.query)}
                                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-slate-200 hover:text-white font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                        title={`1-Click auto-identify: ${chip.query}`}
                                    >
                                        <RiSparklingLine className="w-3 h-3 text-[#38bdf8] shrink-0" />
                                        <span>{chip.label}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {apiError && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
                            <span>{apiError}</span>
                            <button type="button" onClick={() => setApiError(null)} className="text-rose-300 hover:text-white font-bold p-1">
                                <RiCloseLine className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {autoFilledNotice && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <RiCheckLine className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{autoFilledNotice}</span>
                                {aiSource && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-emerald-500/20 rounded-md text-emerald-300">
                                        {aiSource}
                                    </span>
                                )}
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
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                            Asset Tag <span className="text-rose-500 font-bold ml-0.5">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateAssetTag}
                                            className="text-[10px] font-bold text-[#026eff] dark:text-[#38bdf8] hover:underline flex items-center gap-0.5 cursor-pointer"
                                            title="Auto-generate standard asset tag"
                                        >
                                            <RiMagicLine className="w-3 h-3" />
                                            <span>Auto-Gen</span>
                                        </button>
                                    </div>
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
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                            Barcode / QR Tag
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateBarcode}
                                            className="text-[10px] font-bold text-[#026eff] dark:text-[#38bdf8] hover:underline flex items-center gap-0.5 cursor-pointer"
                                            title="Auto-generate barcode from asset tag"
                                        >
                                            <RiBarcodeLine className="w-3 h-3" />
                                            <span>Auto-Gen</span>
                                        </button>
                                    </div>
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

                        {/* Live Hardware Architecture & Workload Fit Preview Card */}
                        {(() => {
                            const archInfo = getDetectedArchitectureInfo(data);
                            const fit = calculateWorkloadFit(data);
                            return (
                                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/30 to-slate-50 dark:from-zinc-900/60 dark:via-zinc-800/40 dark:to-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${archInfo.badgeColor} flex items-center gap-1.5`}>
                                                <RiCpuLine className="w-3.5 h-3.5" />
                                                {archInfo.archLabel}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                                                <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-500" />
                                                {archInfo.aiCertified}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
                                                {archInfo.npu}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                            Real-time ITAM workload suitability estimate based on current hardware specifications:
                                        </p>
                                    </div>

                                    {/* Workload Fit Indicators */}
                                    <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                                        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center min-w-[5.5rem]">
                                            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Dev / Eng</div>
                                            <div className={`text-sm font-black ${fit.dev >= 80 ? 'text-emerald-600 dark:text-emerald-400' : fit.dev >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                                                {fit.dev}%
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center min-w-[5.5rem]">
                                            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Creative / 3D</div>
                                            <div className={`text-sm font-black ${fit.design >= 75 ? 'text-emerald-600 dark:text-emerald-400' : fit.design >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                                                {fit.design}%
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center min-w-[5.5rem]">
                                            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Productivity</div>
                                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                {fit.admin}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

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
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative">
                                    <HardwareImage
                                        src={data.image_url || previewImage}
                                        alt={data.model || 'Device clip preview'}
                                        deviceType={data.device_type}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                            Hardware Media Clip URL
                                        </label>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => handleFetchHardwarePhoto('public_asset')}
                                                disabled={fetchingPhoto || (!data.brand && !data.model)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#026eff]/10 hover:bg-[#026eff]/20 text-[#026eff] dark:text-[#38bdf8] text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer self-start sm:self-auto"
                                                title="Fetch authentic hardware photo from local public asset folder"
                                            >
                                                {fetchingPhoto ? (
                                                    <>
                                                        <RiLoader4Line className="animate-spin w-3.5 h-3.5" />
                                                        <span>Fetching Photo...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <RiFolderImageLine className="w-3.5 h-3.5" />
                                                        <span>Auto-Fetch Public Asset</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleFetchHardwarePhoto('google_search')}
                                                disabled={fetchingPhoto || (!data.brand && !data.model)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer self-start sm:self-auto"
                                                title="Search Google Images for this hardware model"
                                            >
                                                <RiGoogleFill className="w-3.5 h-3.5" />
                                                <span>Search Google Image</span>
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        placeholder="/images/devices/... (Populated automatically via Gemini AI, Public Asset Folder, Google Image, or enter custom URL)"
                                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2 px-3 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition font-mono"
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

                            {/* HTML5 Datalists for Zero-Latency Autocompletion */}
                            <datalist id="supported-brands">
                                {supportedBrands.map((b) => (
                                    <option key={b} value={b} />
                                ))}
                            </datalist>

                            <datalist id="supported-models">
                                {supportedModels.map((m) => (
                                    <option key={m} value={m} />
                                ))}
                            </datalist>

                            <datalist id="supported-cpus">
                                {supportedCpus.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>

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
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                            Brand <span className="text-rose-500 font-bold ml-0.5">*</span>
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        list="supported-brands"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        placeholder="e.g. Dell, Apple, Lenovo, Microsoft, ASUS..."
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3.5 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 shadow-2xs transition"
                                        required
                                    />
                                    {errors.brand && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.brand}</p>}

                                    {/* Quick Brand Selector Chips */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {['Apple', 'Dell', 'Lenovo', 'HP', 'Microsoft', 'ASUS', 'Acer', 'Samsung'].map((brandName) => (
                                            <button
                                                key={brandName}
                                                type="button"
                                                onClick={() => setData('brand', brandName)}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer border ${
                                                    data.brand.toLowerCase() === brandName.toLowerCase()
                                                        ? 'bg-[#026eff] text-white border-[#026eff]'
                                                        : 'bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                {brandName}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Model <span className="text-rose-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="supported-models"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        placeholder="e.g. ThinkPad T14s, Surface Laptop 7, M4 Pro"
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
                                        list="supported-cpus"
                                        value={data.cpu}
                                        onChange={(e) => setData('cpu', e.target.value)}
                                        placeholder="e.g. Snapdragon X Elite, Core Ultra 7, Apple M4"
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
