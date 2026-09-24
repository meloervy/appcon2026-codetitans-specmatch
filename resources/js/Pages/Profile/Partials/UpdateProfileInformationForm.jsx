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
} from 'react-icons/ri';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            {/* Clean, spacious header */}
            <header className="flex items-center gap-3.5 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="w-11 h-11 rounded-2xl bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-sky-400 flex items-center justify-center shrink-0 border border-[#026eff]/20">
                    <RiUser3Line className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                        Personal & Contact Information
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Update your display name and email address associated with your SpecMatch account.
                    </p>
                </div>
            </header>

            <form onSubmit={submit} className="mt-7 space-y-7">
                {/* Spacious Role & Department Assignment Cards */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                            Enterprise Placement & Permissions
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                            <RiInformationLine className="w-3.5 h-3.5" />
                            System Assigned
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Card 1: IT Administrator Role */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800/80 flex items-start gap-4 transition hover:border-[#026eff]/30">
                            <div className="w-11 h-11 rounded-xl bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-sky-400 flex items-center justify-center shrink-0 border border-[#026eff]/20 mt-0.5">
                                <RiShieldUserLine className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
                                    System Role
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                    {user.role_title || 'IT Administrator'}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                    Full governance over fleet matching, device inventory, and reassignments.
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Department / Unit */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800/80 flex items-start gap-4 transition hover:border-purple-500/30">
                            <div className="w-11 h-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 mt-0.5">
                                <RiBuildingLine className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
                                    Assigned Department
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                    {user.department || 'IT Infrastructure & Systems'}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                    Primary organizational unit for hardware allocations and telemetry logs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Profile Inputs */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-5">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Contact Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <InputLabel htmlFor="name" value="Full Name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />
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
                            <InputLabel htmlFor="email" value="Email Address" className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />
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
