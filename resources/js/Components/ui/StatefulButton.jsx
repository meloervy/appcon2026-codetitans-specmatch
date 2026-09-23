import { useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StatefulButton({
    className,
    children,
    onClick,
    disabled = false,
    variant = 'primary', // 'primary' | 'emerald' | 'danger' | 'amber'
    ...props
}) {
    const [scope, animate] = useAnimate();
    const [isActing, setIsActing] = useState(false);

    const animateLoading = async () => {
        await animate(
            '.loader',
            {
                width: '18px',
                scale: 1,
                display: 'inline-block',
                opacity: 1,
            },
            {
                duration: 0.2,
            },
        );
    };

    const animateSuccess = async () => {
        await animate(
            '.loader',
            {
                width: '0px',
                scale: 0,
                display: 'none',
                opacity: 0,
            },
            {
                duration: 0.15,
            },
        );
        await animate(
            '.check',
            {
                width: '18px',
                scale: 1,
                display: 'inline-block',
                opacity: 1,
            },
            {
                duration: 0.2,
            },
        );

        await animate(
            '.check',
            {
                width: '0px',
                scale: 0,
                display: 'none',
                opacity: 0,
            },
            {
                delay: 2.2,
                duration: 0.2,
            },
        );
    };

    const animateError = async () => {
        await animate(
            '.loader',
            {
                width: '0px',
                scale: 0,
                display: 'none',
                opacity: 0,
            },
            {
                duration: 0.15,
            },
        );
    };

    const handleClick = async (event) => {
        if (isActing || disabled) return;
        setIsActing(true);
        try {
            await animateLoading();
            if (onClick) {
                await onClick(event);
            }
            await animateSuccess();
        } catch (err) {
            await animateError();
        } finally {
            setIsActing(false);
        }
    };

    const variantStyles = {
        primary: 'bg-[#026eff] hover:bg-[#0256cc] active:bg-[#024cb5] text-white shadow-xs',
        emerald: 'bg-[#0aceb3] hover:bg-[#09b69e] active:bg-[#089f8a] text-slate-950 font-bold shadow-xs',
        danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs',
        amber: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs',
    };

    return (
        <motion.button
            layout
            ref={scope}
            disabled={disabled || isActing}
            onClick={handleClick}
            className={cn(
                'inline-flex min-w-[110px] cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed',
                variantStyles[variant] || variantStyles.primary,
                className,
            )}
            {...props}
        >
            <motion.div layout className="flex items-center gap-1.5 justify-center">
                <Loader />
                <CheckIcon />
                <motion.span layout className="inline-block whitespace-nowrap">{children}</motion.span>
            </motion.div>
        </motion.button>
    );
}

function Loader() {
    return (
        <motion.svg
            animate={{
                rotate: [0, 360],
            }}
            initial={{
                scale: 0,
                width: 0,
                display: 'none',
                opacity: 0,
            }}
            style={{
                scale: 0.8,
                display: 'none',
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'linear',
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="loader shrink-0"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
        </motion.svg>
    );
}

function CheckIcon() {
    return (
        <motion.svg
            initial={{
                scale: 0,
                width: 0,
                display: 'none',
                opacity: 0,
            }}
            style={{
                scale: 0.8,
                display: 'none',
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check shrink-0 text-emerald-300 dark:text-emerald-400"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l5 5l10 -10" />
        </motion.svg>
    );
}

export default StatefulButton;
