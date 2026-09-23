import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-zinc-950 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-16 w-16 fill-current text-indigo-600 dark:text-indigo-400" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 px-6 py-6 shadow-xs sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
