import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150 focus:outline-none ' +
                (active
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs '
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
