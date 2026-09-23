import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
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

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Full Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-sm"
                        autoComplete="name"
                        placeholder="e.g. Melo Ervy Garcia"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Enterprise Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        placeholder="name@company.ph"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="role" value="Assigned Role" />
                        <select
                            id="role"
                            name="role"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="admin">IT Administrator</option>
                            <option value="manager">IT Asset Manager</option>
                            <option value="technician">Hardware Technician</option>
                            <option value="viewer">IT Auditor / Viewer</option>
                        </select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="department" value="Department" />
                        <TextInput
                            id="department"
                            name="department"
                            value={data.department}
                            className="mt-1 block w-full text-sm"
                            placeholder="e.g. IT Infrastructure"
                            onChange={(e) => setData('department', e.target.value)}
                        />
                        <InputError message={errors.department} className="mt-2" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full text-sm"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <Link
                        href={route('login')}
                        className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                    >
                        &larr; Back to sign in
                    </Link>

                    <PrimaryButton className="px-5 py-2 text-xs font-semibold" disabled={processing}>
                        {processing ? 'Registering...' : 'Create Account'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
