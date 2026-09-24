import CustomSelect from '@/Components/CustomSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const roleOptions = [
    { value: 'admin', label: 'IT Administrator' },
    { value: 'manager', label: 'IT Asset Manager' },
    { value: 'technician', label: 'Hardware Technician' },
    { value: 'viewer', label: 'IT Auditor / Viewer' },
];

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'admin',
        department: 'IT Infrastructure & Systems',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Staff Account - SpecMatch ITAM" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                    Register ITAM Staff Account
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Create your enterprise profile to manage hardware inventory and matching
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" required={true} className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                        autoComplete="name"
                        placeholder="e.g. Melo Ervy Garcia"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Enterprise Email" required={true} className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                        autoComplete="username"
                        placeholder="name@company.ph"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="role" value="Assigned Role" required={true} className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1" />
                        <CustomSelect
                            value={data.role}
                            onChange={(val) => setData('role', val)}
                            options={roleOptions}
                            placeholder="Select role..."
                        />
                        <InputError message={errors.role} className="mt-1 text-xs" />
                    </div>

                    <div>
                        <InputLabel htmlFor="department" value="Department" className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />
                        <TextInput
                            id="department"
                            name="department"
                            value={data.department}
                            className="mt-1 block w-full text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                            placeholder="e.g. IT Infrastructure"
                            onChange={(e) => setData('department', e.target.value)}
                        />
                        <InputError message={errors.department} className="mt-1 text-xs" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" required={true} className="text-xs font-semibold text-slate-700 dark:text-zinc-300" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-9 text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            required
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

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        required={true}
                        className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-9 text-xs py-2 px-3 rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
                        >
                            {showConfirmPassword ? (
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

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1 text-xs"
                    />
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-[#026EFC] dark:hover:text-sky-400 transition-colors group"
                    >
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Back to sign in</span>
                    </Link>

                    <PrimaryButton className="px-5 py-2 text-xs font-semibold" disabled={processing}>
                        {processing ? 'Registering...' : 'Create Account'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
