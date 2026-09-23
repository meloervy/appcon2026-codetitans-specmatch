import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
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

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                    Sign in to SpecMatch
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Intelligent Enterprise IT Asset Management & Hardware Optimization
                </p>
            </div>

            {/* Quick Demo Sign-In Buttons */}
            <div className="mb-6 rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3.5 border border-slate-200/80 dark:border-zinc-700/60">
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        ⚡ 1-Click Demo Sign-In
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        pw: password
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleQuickLogin('admin@specmatch.local')}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xs transition group text-left"
                    >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            IT Admin
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-full">
                            Full Control
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleQuickLogin('manager@specmatch.local')}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xs transition group text-left"
                    >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Asset Manager
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-full">
                            Lifecycle & Fleet
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleQuickLogin('tech@specmatch.local')}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xs transition group text-left"
                    >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            Technician
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-full">
                            Diagnostics & Rep.
                        </span>
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-zinc-900 px-2 text-slate-400 dark:text-zinc-500">
                        Or enter credentials manually
                    </span>
                </div>
            </div>

            {status && (
                <div className="mb-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-200 dark:border-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Enterprise Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        placeholder="e.g. admin@specmatch.local"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-xs text-slate-600 dark:text-zinc-400">
                            Remember session
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline focus:outline-hidden"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <Link
                        href={route('register')}
                        className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                    >
                        Create staff account &rarr;
                    </Link>

                    <PrimaryButton className="px-5 py-2 text-xs font-semibold" disabled={processing}>
                        {processing ? 'Signing in...' : 'Sign in'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
