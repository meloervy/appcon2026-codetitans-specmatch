import { useState, useRef, useEffect, useId, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function GooeyFilter({ filterId, blur }) {
    return (
        <svg className="absolute hidden h-0 w-0" aria-hidden="true">
            <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
                    <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                        result="goo"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </defs>
        </svg>
    );
}

function SearchIcon({ layoutId }) {
    return (
        <motion.svg
            layoutId={layoutId}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            className="w-4 h-4 shrink-0 text-[#026eff] dark:text-[#38bdf8]"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </motion.svg>
    );
}

const transition = {
    duration: 0.4,
    type: 'spring',
    bounce: 0.25,
};

const iconBubbleVariants = {
    collapsed: { scale: 0, opacity: 0 },
    expanded: { scale: 1, opacity: 1 },
};

export default function GooeyInput({
    placeholder = 'Type to search...',
    className,
    classNames,
    collapsedWidth = 130,
    expandedWidth = 260,
    expandedOffset = 40,
    gooeyBlur = 4,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onChange,
    onOpenChange,
    disabled = false,
}) {
    const reactId = useId();
    const safeId = reactId.replace(/:/g, '');
    const filterId = `gooey-filter-${safeId}`;
    const iconLayoutId = `gooey-input-icon-${safeId}`;
    const inputLayoutId = `gooey-input-field-${safeId}`;

    const inputRef = useRef(null);
    const prevExpandedRef = useRef(false);
    const [isExpanded, setIsExpanded] = useState(Boolean(valueProp));
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

    const isControlled = valueProp !== undefined;
    const searchText = isControlled ? valueProp : uncontrolledValue;

    const setSearchText = useCallback(
        (next) => {
            if (!isControlled) {
                setUncontrolledValue(next);
            }
            onValueChange?.(next);
            onChange?.({ target: { value: next } });
        },
        [isControlled, onValueChange, onChange],
    );

    const setExpanded = useCallback(
        (next) => {
            setIsExpanded(next);
            onOpenChange?.(next);
        },
        [onOpenChange],
    );

    useEffect(() => {
        if (isExpanded) {
            inputRef.current?.focus();
        } else if (prevExpandedRef.current && !searchText) {
            setSearchText('');
        }
        prevExpandedRef.current = isExpanded;
    }, [isExpanded, searchText, setSearchText]);

    const buttonVariants = useMemo(
        () => ({
            collapsed: { width: collapsedWidth, marginLeft: 0 },
            expanded: { width: expandedWidth, marginLeft: expandedOffset },
        }),
        [collapsedWidth, expandedWidth, expandedOffset],
    );

    const handleExpand = useCallback(() => {
        if (!disabled) setExpanded(true);
    }, [disabled, setExpanded]);

    const handleChange = useCallback(
        (e) => {
            setSearchText(e.target.value);
        },
        [setSearchText],
    );

    const handleBlur = useCallback(() => {
        if (!searchText) setExpanded(false);
    }, [searchText, setExpanded]);

    const surfaceClass =
        'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm border border-slate-300 dark:border-zinc-700';

    return (
        <div
            className={cn(
                'relative flex items-center justify-center select-none',
                className,
                classNames?.root,
            )}
        >
            <GooeyFilter filterId={filterId} blur={gooeyBlur} />

            <div
                className={cn(
                    'relative flex h-10 items-center justify-center',
                    classNames?.filterWrap,
                )}
                style={{ filter: `url(#${filterId})` }}
            >
                <motion.div
                    className={cn('flex h-10 items-center justify-center', classNames?.buttonRow)}
                    variants={buttonVariants}
                    initial="collapsed"
                    animate={isExpanded ? 'expanded' : 'collapsed'}
                    transition={transition}
                >
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={handleExpand}
                        className={cn(
                            'flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-semibold outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#026eff] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                            surfaceClass,
                            classNames?.trigger,
                        )}
                    >
                        {!isExpanded && (
                            <>
                                <SearchIcon layoutId={iconLayoutId} />
                                <span className="text-slate-600 dark:text-zinc-400 font-medium">Search...</span>
                            </>
                        )}
                        <motion.input
                            layoutId={inputLayoutId}
                            ref={inputRef}
                            type="search"
                            enterKeyHint="search"
                            autoComplete="off"
                            value={searchText}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={disabled || !isExpanded}
                            placeholder={placeholder}
                            className={cn(
                                'h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 dark:text-zinc-100 outline-none',
                                isExpanded
                                    ? 'placeholder:text-slate-400 dark:placeholder:text-zinc-500'
                                    : 'hidden pointer-events-none',
                                classNames?.input,
                            )}
                        />
                    </button>
                </motion.div>

                <motion.div
                    className={cn(
                        'absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center pointer-events-none',
                        classNames?.bubble,
                    )}
                    variants={iconBubbleVariants}
                    initial="collapsed"
                    animate={isExpanded ? 'expanded' : 'collapsed'}
                    transition={transition}
                >
                    <div
                        className={cn(
                            'flex size-10 items-center justify-center rounded-xl',
                            surfaceClass,
                            classNames?.bubbleSurface,
                        )}
                    >
                        <SearchIcon layoutId={iconLayoutId} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
