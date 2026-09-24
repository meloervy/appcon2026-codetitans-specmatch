import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    RiLockPasswordLine,
    RiLockLine,
    RiKey2Line,
    RiEyeLine,
    RiEyeOffLine,
    RiCheckLine,
    RiCloseLine,
    RiSave3Line,
    RiLoader4Line,
    RiShieldFlashLine,
} from 'react-icons/ri';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    // Password criteria helpers
    const hasMinLength = data.password.length >= 8;
    const hasConfirmationMatch =
        data.password.length > 0 &&
        data.password === data.password_confirmation;

    return (
        <section className={className}>
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#026eff] dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                        <RiLockPasswordLine className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                            Authentication & Security Key
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Ensure your administrative account is secured with a long, complex passphrase.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#026eff] dark:text-sky-400 border border-blue-200 dark:border-blue-800/60">
                        <RiShieldFlashLine className="w-3.5 h-3.5" />
                        <span>Bcrypt 12-Round Hash</span>
                    </span>
                </div>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                        className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
                    />
                    <div className="relative rounded-xl shadow-2xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                            <RiLockLine className="w-4 h-4" />
                        </div>
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                            autoComplete="current-password"
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"
                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        >
                            {showCurrentPassword ? (
                                <RiEyeOffLine className="w-4 h-4" />
                            ) : (
                                <RiEyeLine className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-1"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* New Password */}
                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="password"
                            value="New Password"
                            className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
                        />
                        <div className="relative rounded-xl shadow-2xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                <RiKey2Line className="w-4 h-4" />
                            </div>
                            <TextInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                type={showNewPassword ? 'text' : 'password'}
                                className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                                autoComplete="new-password"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"
                                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                            >
                                {showNewPassword ? (
                                    <RiEyeOffLine className="w-4 h-4" />
                                ) : (
                                    <RiEyeLine className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm New Password"
                            className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
                        />
                        <div className="relative rounded-xl shadow-2xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                <RiKey2Line className="w-4 h-4" />
                            </div>
                            <TextInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[#026eff] focus:ring-2 focus:ring-[#026eff]/20 transition"
                                autoComplete="new-password"
                                placeholder="Repeat new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"
                                aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                            >
                                {showConfirmPassword ? (
                                    <RiEyeOffLine className="w-4 h-4" />
                                ) : (
                                    <RiEyeLine className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Real-time Password Complexity Guide */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800/80">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                        Password Requirements
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            {hasMinLength ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <RiCheckLine className="w-3 h-3 font-bold" />
                                </div>
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 flex items-center justify-center shrink-0">
                                    <RiCloseLine className="w-3 h-3" />
                                </div>
                            )}
                            <span
                                className={
                                    hasMinLength
                                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                        : 'text-slate-600 dark:text-zinc-400'
                                }
                            >
                                Minimum 8 characters in length
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {hasConfirmationMatch ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <RiCheckLine className="w-3 h-3 font-bold" />
                                </div>
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 flex items-center justify-center shrink-0">
                                    <RiCloseLine className="w-3 h-3" />
                                </div>
                            )}
                            <span
                                className={
                                    hasConfirmationMatch
                                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                        : 'text-slate-600 dark:text-zinc-400'
                                }
                            >
                                Password confirmation matches
                            </span>
                        </div>
                    </div>
                </div>

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
                                <span>Password updated and secured.</span>
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
                                <span>Updating Password...</span>
                            </>
                        ) : (
                            <>
                                <RiSave3Line className="w-4 h-4" />
                                <span>Update Password</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}
