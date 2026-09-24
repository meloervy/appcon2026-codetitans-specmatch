import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    RiCameraLine,
    RiDeleteBinLine,
    RiBuildingLine,
    RiUser3Line,
    RiPhoneLine,
    RiMailLine,
    RiBriefcaseLine,
    RiShieldCheckLine,
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
            onSuccess: () => {
                // If an avatar was uploaded, keep state clean
            },
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
            <header>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#026eff]/10 dark:bg-[#031a40]/60 text-[#026eff] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                        <RiUser3Line className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                            Personal & Profile Information
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Customize your identity, profile picture, contact details, and organization role.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Profile Picture Upload Section */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar Display & Hover Overlay */}
                    <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-zinc-700 border-2 border-slate-300 dark:border-zinc-600 shadow-sm flex items-center justify-center text-slate-400 dark:text-zinc-400">
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
                                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <RiCameraLine className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8]" />
                                <span>Upload Photo</span>
                            </button>

                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <div className="relative mt-1">
                            <TextInput
                                id="name"
                                className="block w-full pl-9"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                            />
                            <RiUser3Line className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <div className="relative mt-1">
                            <TextInput
                                id="email"
                                type="email"
                                className="block w-full pl-9"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            <RiMailLine className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {/* Work & Organization Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="job_title" value="Job / Professional Title" />
                        <div className="relative mt-1">
                            <TextInput
                                id="job_title"
                                className="block w-full pl-9"
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                                placeholder="e.g. IT Operations Lead"
                            />
                            <RiBriefcaseLine className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                            Custom title displayed on your navbar status badge.
                        </p>
                        <InputError className="mt-2" message={errors.job_title} />
                    </div>

                    <div>
                        <InputLabel htmlFor="department" value="Department / Business Unit" />
                        <div className="relative mt-1">
                            <input
                                list="departments-list"
                                id="department"
                                className="block w-full pl-9 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 py-2.5 px-3 focus:border-[#026eff] focus:outline-none focus:ring-1 focus:ring-[#026eff]"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                placeholder="Select or type department..."
                            />
                            <RiBuildingLine className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <datalist id="departments-list">
                                {departmentPresets.map((dept) => (
                                    <option key={dept} value={dept} />
                                ))}
                            </datalist>
                        </div>
                        <InputError className="mt-2" message={errors.department} />
                    </div>
                </div>

                {/* Contact & System Authority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="phone" value="Work Phone / Mobile Contact" />
                        <div className="relative mt-1">
                            <TextInput
                                id="phone"
                                className="block w-full pl-9"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+63 (917) 000-0000"
                            />
                            <RiPhoneLine className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <InputError className="mt-2" message={errors.phone} />
                    </div>

                    <div>
                        <InputLabel value="System Role & Authority" />
                        <div className="mt-1 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
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

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#026eff] focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="px-6 py-2.5">
                        Save Changes
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>✓</span> Profile updated successfully.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
