import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    RiAlertLine,
    RiDeleteBin6Line,
    RiLockLine,
    RiEyeLine,
    RiEyeOffLine,
    RiErrorWarningLine,
    RiLoader4Line,
} from 'react-icons/ri';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-rose-100 dark:border-rose-950/60">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                        <RiErrorWarningLine className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                            Danger Zone & Account Termination
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Permanently delete your user profile and revoke all enterprise privileges.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                        <RiAlertLine className="w-3.5 h-3.5" />
                        <span>Irreversible Action</span>
                    </span>
                </div>
            </header>

            {/* Warning Callout Box */}
            <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 p-5 space-y-3">
                <div className="flex items-start gap-3">
                    <RiAlertLine className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
                        <p className="font-bold">
                            Warning: Account deletion cannot be undone.
                        </p>
                        <p className="text-rose-800/90 dark:text-rose-300/80 leading-relaxed">
                            Once your account is deleted, all authentication tokens, personalized filters, and access privileges will be permanently scrubbed. Before proceeding, ensure any pending hardware reallocations or inventory reviews have been handed off.
                        </p>
                    </div>
                </div>

                <div className="pt-2 flex justify-start">
                    <button
                        type="button"
                        onClick={confirmUserDeletion}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition duration-150 cursor-pointer"
                    >
                        <RiDeleteBin6Line className="w-4 h-4" />
                        <span>Delete SpecMatch Account</span>
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="lg">
                <form onSubmit={deleteUser} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                            <RiAlertLine className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                Confirm Account Deletion
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Security verification required
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 p-4 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                        Are you sure you want to permanently delete your account? Please enter your current account password to confirm termination.
                    </div>

                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="delete_password"
                            value="Confirm Password to Proceed"
                            className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
                        />
                        <div className="relative rounded-xl shadow-2xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-zinc-500">
                                <RiLockLine className="w-4 h-4" />
                            </div>
                            <TextInput
                                id="delete_password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                                isFocused
                                placeholder="Enter your current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <RiEyeOffLine className="w-4 h-4" />
                                ) : (
                                    <RiEyeLine className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        <InputError
                            message={errors.password}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>

                        <button
                            type="submit"
                            disabled={processing || !data.password}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                                    <span>Deleting Account...</span>
                                </>
                            ) : (
                                <>
                                    <RiDeleteBin6Line className="w-4 h-4" />
                                    <span>Permanently Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
