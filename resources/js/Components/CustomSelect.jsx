import { Transition } from '@headlessui/react';
import useOutsideClick from '@/hooks/useOutsideClick';
import { useRef, useState } from 'react';
import { RiArrowDownSLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';

/**
 * Modern Custom Select Dropdown Component
 *
 * Clean, minimalist enterprise dropdown matching the SpecMatch UI system.
 */
export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Select option...',
    icon: Icon,
    className = '',
    clearable = false,
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useOutsideClick(containerRef, () => {
        if (open) {
            setOpen(false);
        }
    });

    // Normalize options to { value, label, icon, badge }
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                value: opt.value !== undefined ? String(opt.value) : '',
                label: opt.label !== undefined ? opt.label : String(opt.value || ''),
                icon: opt.icon,
                badge: opt.badge,
            };
        }
        return {
            value: String(opt),
            label: String(opt),
        };
    });

    const selectedOption = normalizedOptions.find(
        (opt) => String(opt.value) === String(value)
    );

    const isSelected = value !== undefined && value !== null && String(value) !== '';

    const handleSelect = (optValue) => {
        onChange(optValue);
        setOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full text-xs font-medium py-2 px-3 rounded-xl border transition flex items-center justify-between gap-2 text-left cursor-pointer shadow-2xs ${
                    open
                        ? 'border-[#026eff] ring-2 ring-[#026eff]/20 bg-white dark:bg-zinc-800'
                        : isSelected
                        ? 'border-[#026eff]/40 bg-[#026eff]/5 dark:bg-[#026eff]/10 text-slate-900 dark:text-zinc-100'
                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-zinc-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Left Icon */}
                    {selectedOption?.icon ? (
                        <selectedOption.icon className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8] shrink-0" />
                    ) : Icon ? (
                        <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    ) : null}

                    <span
                        className={`truncate ${
                            isSelected
                                ? 'font-semibold text-slate-900 dark:text-zinc-100'
                                : 'text-slate-500 dark:text-zinc-400'
                        }`}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {clearable && isSelected && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
                            title="Clear selection"
                        >
                            <RiCloseLine className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <RiArrowDownSLine
                        className={`w-4 h-4 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                            open ? 'rotate-180 text-[#026eff] dark:text-[#38bdf8]' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Dropdown Popover */}
            <Transition
                show={open}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95 -translate-y-1"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 -translate-y-1"
            >
                <div className="absolute z-50 left-0 mt-1.5 w-full min-w-[200px] p-1.5 backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl shadow-slate-900/15 dark:shadow-black/70 ring-1 ring-black/5 dark:ring-white/10 rounded-2xl max-h-60 overflow-y-auto custom-scrollbar">
                    {/* Default Placeholder / All Option */}
                    <button
                        type="button"
                        onClick={() => handleSelect('')}
                        className={`group flex items-center justify-between gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-xl transition text-left cursor-pointer ${
                            !isSelected
                                ? 'bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-[#38bdf8] font-semibold'
                                : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/70'
                        }`}
                    >
                        <span className="truncate">{placeholder}</span>
                        {!isSelected && (
                            <RiCheckLine className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8] shrink-0" />
                        )}
                    </button>

                    {normalizedOptions.length > 0 && (
                        <div className="my-1 border-t border-slate-100 dark:border-zinc-800/80" />
                    )}

                    {/* Options List */}
                    <div className="space-y-0.5">
                        {normalizedOptions.map((opt, idx) => {
                            const optSelected = isSelected && String(value) === String(opt.value);
                            const ItemIcon = opt.icon;

                            return (
                                <button
                                    key={`${opt.value}-${idx}`}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`group flex items-center justify-between gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-xl transition text-left cursor-pointer ${
                                        optSelected
                                            ? 'bg-[#026eff]/10 dark:bg-[#026eff]/20 text-[#026eff] dark:text-[#38bdf8] font-semibold'
                                            : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/70'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {ItemIcon && (
                                            <ItemIcon
                                                className={`w-3.5 h-3.5 shrink-0 ${
                                                    optSelected
                                                        ? 'text-[#026eff] dark:text-[#38bdf8]'
                                                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'
                                                }`}
                                            />
                                        )}

                                        <span className="truncate">{opt.label}</span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {opt.badge && (
                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                                                {opt.badge}
                                            </span>
                                        )}
                                        {optSelected && (
                                            <RiCheckLine className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8] shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Transition>
        </div>
    );
}
