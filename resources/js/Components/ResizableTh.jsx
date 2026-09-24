import {
    RiArrowUpDownLine,
    RiArrowUpLine,
    RiArrowDownLine,
} from 'react-icons/ri';

export default function ResizableTh({
    colKey,
    width,
    onResizeStart,
    onAutoExpand,
    className = '',
    align = 'left',
    isResizing = false,
    resizable = true,
    sortable = false,
    sortKey,
    currentSort,
    sortDirection = 'asc',
    onSort,
    children,
}) {
    const isSortable = sortable || Boolean(onSort);
    const activeSortKey = sortKey || colKey;
    const isActiveSort = isSortable && currentSort === activeSortKey;

    const handleSortClick = (e) => {
        if (isSortable && onSort) {
            onSort(activeSortKey);
        }
    };

    return (
        <th
            style={{ width: `${width}px`, minWidth: `${width}px` }}
            className={`py-3 px-4 relative select-none font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-slate-500 dark:text-zinc-400 group ${
                align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
            } ${isResizing ? 'bg-[#026eff]/10 dark:bg-[#026eff]/20' : ''} ${className}`}
        >
            <div
                onClick={handleSortClick}
                className={`inline-flex items-center gap-1.5 ${
                    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'
                } whitespace-nowrap ${isSortable ? 'cursor-pointer' : ''}`}
                title={isSortable ? `Sort by ${typeof children === 'string' ? children : activeSortKey}` : undefined}
            >
                <span className={`whitespace-nowrap transition-colors ${
                    isActiveSort
                        ? 'text-slate-900 dark:text-zinc-100 font-extrabold'
                        : 'group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                }`}>
                    {children}
                </span>
                {isSortable && (
                    <span className="inline-flex items-center shrink-0 transition-colors">
                        {isActiveSort ? (
                            sortDirection === 'desc' ? (
                                <RiArrowDownLine className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8] font-bold" />
                            ) : (
                                <RiArrowUpLine className="w-3.5 h-3.5 text-[#026eff] dark:text-[#38bdf8] font-bold" />
                            )
                        ) : (
                            <RiArrowUpDownLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:text-slate-700 dark:group-hover:text-zinc-200" />
                        )}
                    </span>
                )}
            </div>

            {resizable && (
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onResizeStart(colKey, e);
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        onAutoExpand && onAutoExpand(colKey);
                    }}
                    title="Drag to resize column • Double-click to expand"
                    className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center transition-colors z-20 ${
                        isResizing ? 'bg-[#026eff]/20' : 'hover:bg-[#026eff]/15'
                    }`}
                >
                    <div
                        className={`w-[2px] rounded-full transition-all ${
                            isResizing
                                ? 'bg-[#026eff] h-full shadow-[0_0_6px_#026eff]'
                                : 'h-3.5 bg-slate-300 dark:bg-zinc-600 group-hover:bg-[#026eff] dark:group-hover:bg-[#0b79ff] group-hover:h-5'
                        }`}
                    />
                </div>
            )}
        </th>
    );
}
