import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e?.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleQuickLogin = (email, password = 'password') => {
        setData((prev) => ({
            ...prev,
            email,
            password,
        }));

        post(route('login'), {
            data: { email, password, remember: true },
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In - SpecMatch ITAM" />

            {/* Header Area */}
            <div className="mb-3 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/70 dark:border-sky-800/60 text-[10.5px] font-semibold text-[#026eff] dark:text-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#026eff] dark:bg-sky-400 animate-pulse" />
                    Enterprise Portal
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                    Sign in to SpecMatch
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    Hardware Lifecycle & Intelligent Spec Matching
                </p>
            </div>

            {/* 1-Click Demo Sign-In Cards (Clean, Text-Only) */}
            <div className="mb-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 p-2.5 border border-slate-200/80 dark:border-zinc-700/60">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        1-Click Demo Access
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/50">
                        pw: password
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleQuickLogin('admin@specmatch.local', 'password')}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/70 hover:border-[#026eff] dark:hover:border-[#0b79ff] hover:shadow-xs transition-all duration-150 group text-center cursor-pointer disabled:opacity-50"
                    >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-[#026eff] dark:group-hover:text-sky-400">
                            IT Admin
                        </span>
                        <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 truncate max-w-full">
                            Full Control
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleQuickLogin('manager@specmatch.local', 'password')}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/70 hover:border-[#026eff] dark:hover:border-[#0b79ff] hover:shadow-xs transition-all duration-150 group text-center cursor-pointer disabled:opacity-50"
                    >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-[#026eff] dark:group-hover:text-sky-400">
                            Manager
                        </span>
                        <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 truncate max-w-full">
                            Fleet Life
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleQuickLogin('tech@specmatch.local', 'password')}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/70 hover:border-[#026eff] dark:hover:border-[#0b79ff] hover:shadow-xs transition-all duration-150 group text-center cursor-pointer disabled:opacity-50"
                    >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-[#026eff] dark:group-hover:text-sky-400">
                            Technician
                        </span>
                        <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 truncate max-w-full">
                            Diagnostics
                        </span>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                    <span className="bg-white dark:bg-zinc-900 px-2.5 text-slate-400 dark:text-zinc-500">
                        or credentials
                    </span>
                </div>
            </div>

            {status && (
                <div className="mb-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{status}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="space-y-2.5">
                <div>
                    <InputLabel htmlFor="email" value="Enterprise Email" className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />

                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-9 text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                            autoComplete="username"
                            placeholder="e.g. admin@specmatch.local"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>

                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[11px] font-medium text-[#026eff] dark:text-sky-400 hover:text-[#0256cc] dark:hover:text-sky-300 transition hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pl-9 pr-9 text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-xs text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200 transition-colors">
                            Remember session
                        </span>
                    </label>
                </div>

                {/* Primary Action Button */}
                <div className="pt-1.5">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#026eff] to-[#0b79ff] hover:from-[#025bd6] hover:to-[#026eff] shadow-sm hover:shadow-md hover:shadow-[#026eff]/20 active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In to Workspace</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Bottom Register Link */}
                <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                    Need a staff profile?{' '}
                    <Link
                        href={route('register')}
                        className="font-bold text-[#026eff] dark:text-sky-400 hover:text-[#0256cc] dark:hover:text-sky-300 hover:underline transition-colors inline-flex items-center gap-1"
                    >
                        <span>Create account</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
