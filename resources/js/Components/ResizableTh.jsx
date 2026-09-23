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
            className={`py-3 px-4 relative select-none font-bold uppercase tracking-wider text-[11px] whitespace-nowrap text-slate-500 dark:text-zinc-400 group transition-[background-color] ${
                align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
            } ${isResizing ? 'bg-[#026eff]/10 dark:bg-[#026eff]/20' : ''} ${className}`}
        >
            <div
                onClick={handleSortClick}
                className={`flex items-center gap-1.5 ${
                    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-between'
                } w-full whitespace-nowrap ${isSortable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100 transition-colors' : ''}`}
                title={isSortable ? `Sort by ${typeof children === 'string' ? children : activeSortKey}` : undefined}
            >
                <div className="flex items-center gap-1 min-w-0 shrink-0 whitespace-nowrap">
                    <span className="whitespace-nowrap">{children}</span>
                    {isSortable && (
                        <span
                            className={`inline-flex items-center shrink-0 transition-all ${
                                isActiveSort
                                    ? 'opacity-100 text-[#026eff] dark:text-[#0b79ff]'
                                    : 'opacity-0 group-hover:opacity-40 text-slate-400 dark:text-zinc-500'
                            }`}
                        >
                            {isActiveSort ? (
                                sortDirection === 'desc' ? (
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                )
                            ) : (
                                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 8l5-5 5 5H5zm10 4l-5 5-5-5h10z" />
                                </svg>
                            )}
                        </span>
                    )}
                </div>

                {resizable && (
                    <span className="opacity-0 group-hover:opacity-100 text-[9px] text-slate-400 dark:text-zinc-500 font-mono transition-opacity shrink-0">
                        {Math.round(width)}px
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
