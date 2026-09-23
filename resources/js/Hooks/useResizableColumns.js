import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage resizable table columns with drag handles,
 * auto-expansion on double click, and localStorage persistence.
 */
export function useResizableColumns(initialWidths, storageKey = null) {
    const [widths, setWidths] = useState(() => {
        if (storageKey && typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(`col_widths_${storageKey}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return { ...initialWidths, ...parsed };
                }
            } catch (e) {
                // Ignore storage error
            }
        }
        return initialWidths;
    });

    const [isResizing, setIsResizing] = useState(false);
    const [resizingCol, setResizingCol] = useState(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const currentColRef = useRef(null);
    const widthsRef = useRef(widths);
    widthsRef.current = widths;

    const startResize = useCallback((colKey, e) => {
        e.preventDefault();
        e.stopPropagation();
        currentColRef.current = colKey;
        startXRef.current = e.clientX;
        startWidthRef.current = widthsRef.current[colKey] || 150;
        setIsResizing(true);
        setResizingCol(colKey);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const autoExpandCol = useCallback((colKey, amount = 120) => {
        setWidths((prev) => {
            const next = { ...prev, [colKey]: (prev[colKey] || 150) + amount };
            if (storageKey && typeof window !== 'undefined') {
                try {
                    localStorage.setItem(`col_widths_${storageKey}`, JSON.stringify(next));
                } catch (e) {}
            }
            return next;
        });
    }, [storageKey]);

    const resetWidths = useCallback(() => {
        setWidths(initialWidths);
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(`col_widths_${storageKey}`);
            } catch (e) {}
        }
    }, [initialWidths, storageKey]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            if (!currentColRef.current) return;
            const diff = e.clientX - startXRef.current;
            const key = currentColRef.current;
            const minWidth = 70;
            const newWidth = Math.max(minWidth, startWidthRef.current + diff);

            setWidths((prev) => ({
                ...prev,
                [key]: newWidth,
            }));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setResizingCol(null);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            currentColRef.current = null;

            if (storageKey && typeof window !== 'undefined') {
                try {
                    localStorage.setItem(`col_widths_${storageKey}`, JSON.stringify(widthsRef.current));
                } catch (e) {}
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, storageKey]);

    return {
        widths,
        startResize,
        autoExpandCol,
        resetWidths,
        isResizing,
        resizingCol,
    };
}
