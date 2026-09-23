export default function ResizableTh({
    colKey,
    width,
    onResizeStart,
    onAutoExpand,
    className = '',
    align = 'left',
    isResizing = false,
    resizable = true,
    children,
}) {
    return (
        <th
            style={{ width: `${width}px`, minWidth: `${width}px` }}
            className={`py-3 px-4 relative select-none font-bold uppercase tracking-wider text-[11px] text-slate-500 dark:text-zinc-400 group transition-[background-color] ${
                align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
            } ${isResizing ? 'bg-[#026eff]/10 dark:bg-[#026eff]/20' : ''} ${className}`}
        >
            <div className={`flex items-center gap-1.5 ${
                align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-between'
            } w-full`}>
                <span className="truncate">{children}</span>
                {resizable && (
                    <span className="opacity-0 group-hover:opacity-100 text-[9px] text-slate-400 dark:text-zinc-500 font-mono transition-opacity shrink-0">
                        {Math.round(width)}px
                    </span>
                )}
            </div>

            {resizable && (
                <div
                    onMouseDown={(e) => onResizeStart(colKey, e)}
                    onDoubleClick={() => onAutoExpand && onAutoExpand(colKey)}
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
