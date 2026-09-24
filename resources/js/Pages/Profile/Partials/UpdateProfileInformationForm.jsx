import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    RiUser3Line,
    RiUserLine,
    RiMailLine,
    RiShieldUserLine,
    RiBuildingLine,
    RiAlertLine,
    RiCheckLine,
    RiSave3Line,
    RiLoader4Line,
    RiShieldCheckLine,
    RiInformationLine,
    RiCameraLine,
    RiDeleteBinLine,
    RiPhoneLine,
    RiBriefcaseLine,
} from 'react-icons/ri';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url || null);

    const { data, setData, post, errors, processing, recentlySuccessful, reset } =
        useForm({
            _method: 'patch',
            name: user.name || '',
            email: user.email || '',
            department: user.department || '',
            job_title: user.job_title || '',
            phone: user.phone || '',
            avatar: user.avatar || '',
            avatar_file: null,
        });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar_file', file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({
            ...prev,
            avatar: '',
            avatar_file: null,
        }));
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const departmentPresets = [
        'IT Infrastructure & Systems',
        'IT Operations & Asset Management',
        'Corporate Engineering',
        'Information Security & Compliance',
        'Data & Analytics',
        'Operations & Procurement',
        'Human Resources',
        'Executive Management',
    ];

    return (
        <section className={className}>
            <header className="flex items-center gap-3.5 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="w-11 h-11 rounded-2xl bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-sky-400 flex items-center justify-center shrink-0 border border-[#026eff]/20">
                    <RiUser3Line className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                        Personal &amp; Profile Information
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Update your avatar, contact details, and organization information.
                    </p>
                </div>
            </header>

            <form onSubmit={submit} className="mt-7 space-y-7">
                {/* Profile Picture Upload Section */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar Display & Hover Overlay */}
                    <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-zinc-700 border-2 border-slate-300 dark:border-zinc-600 shadow-xs flex items-center justify-center text-slate-400 dark:text-zinc-400">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-[#026eff] to-[#38bdf8] text-white flex items-center justify-center text-2xl font-black">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity backdrop-blur-2xs cursor-pointer"
                        >
                            <RiCameraLine className="w-5 h-5 mb-0.5" />
                            <span>Change</span>
                        </button>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                            Profile Picture
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Upload a high-resolution photo or portrait. Visible on navbar and fleet activity logs.
                        </p>

                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-2.5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <RiCameraLine className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8]" />
                                <span>Upload Photo</span>
                            </button>

                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                </button>
                            )}
                        </div>

                        <InputError className="mt-2 text-xs" message={errors.avatar_file || errors.avatar} />
                    </div>
                </div>

                {/* Primary Information Grid */}
                <div className="space-y-3">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Personal &amp; Contact Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center">
                                <span>Full Name</span>
                                <span className="text-rose-500 font-bold ml-0.5">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                    <RiUserLine className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="name"
                                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <InputError className="mt-1" message={errors.name} />
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center">
                                <span>Email Address</span>
                                <span className="text-rose-500 font-bold ml-0.5">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                    <RiMailLine className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="name@company.com"
                                />
                            </div>
                            <InputError className="mt-1" message={errors.email} />
                        </div>
                    </div>
                </div>

                {/* Work & Organization Details */}
                <div className="space-y-3">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Role &amp; Organization Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Job Title */}
                        <div className="space-y-1.5">
                            <label htmlFor="job_title" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center">
                                <span>Job / Professional Title</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                    <RiBriefcaseLine className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="job_title"
                                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                                    value={data.job_title}
                                    onChange={(e) => setData('job_title', e.target.value)}
                                    placeholder="e.g. IT Operations Lead"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                                Custom title displayed on your navbar status badge.
                            </p>
                            <InputError className="mt-1" message={errors.job_title} />
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                            <label htmlFor="department" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center">
                                <span>Department / Business Unit</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                    <RiBuildingLine className="w-4 h-4" />
                                </div>
                                <input
                                    list="departments-list"
                                    id="department"
                                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#026eff] focus:outline-none focus:ring-2 focus:ring-[#026eff]/20 transition"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    placeholder="Select or type department..."
                                />
                                <datalist id="departments-list">
                                    {departmentPresets.map((dept) => (
                                        <option key={dept} value={dept} />
                                    ))}
                                </datalist>
                            </div>
                            <InputError className="mt-1" message={errors.department} />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center">
                                <span>Work Phone / Mobile Contact</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                    <RiPhoneLine className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="phone"
                                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+63 (917) 000-0000"
                                />
                            </div>
                            <InputError className="mt-1" message={errors.phone} />
                        </div>

                        {/* System Role Card */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center">
                                <span>System Role &amp; Authority</span>
                            </label>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
                                <RiShieldCheckLine className="w-4 h-4 text-[#026eff] dark:text-[#38bdf8] shrink-0" />
                                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                                    {user.role === 'admin'
                                        ? 'Super Administrator (Full Fleet Control)'
                                        : user.role === 'manager'
                                        ? 'IT Asset Manager (Assignments & Match)'
                                        : user.role === 'technician'
                                        ? 'Hardware Technician (Repairs & Servicing)'
                                        : 'Auditor / Read-Only'}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                                Managed by organization system policies.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Verification Banner */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4">
                        <div className="flex items-start gap-3">
                            <RiAlertLine className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-900 dark:text-amber-200">
                                <span className="font-bold">Your email address is unverified.</span>{' '}
                                Verification is required to ensure uninterrupted notifications and system alerts.
                                <div className="mt-2">
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 underline focus:outline-hidden"
                                    >
                                        Resend verification link
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <RiCheckLine className="w-4 h-4" />
                                A fresh verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                {/* Form Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-out duration-300"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                                <RiCheckLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                                <span>Profile information updated successfully.</span>
                            </div>
                        </Transition>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#026eff] hover:bg-[#0256cc] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                    >
                        {processing ? (
                            <>
                                <RiLoader4Line className="w-4 h-4 animate-spin" />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <RiSave3Line className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}
