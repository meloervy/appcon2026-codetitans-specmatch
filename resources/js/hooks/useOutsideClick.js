import { useEffect } from 'react';

export function useOutsideClick(ref, callback) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            callback(event);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                callback(event);
            }
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [ref, callback]);
}

export default useOutsideClick;
