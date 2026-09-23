export default function SpecMatchLogo({
    variant = 'full',
    className = '',
    iconClassName = '',
    textClassName = '',
    size = 32,
    showBadge = false,
    ...props
}) {
    // 4-Tile Brand Mark Component
    const Mark = ({ markSize = size, markClass = '' }) => (
        <svg
            viewBox="0 0 100 100"
            width={markSize}
            height={markSize}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 ${markClass}`}
        >
            {/* Top-Left: Midnight Navy */}
            <path
                d="M 22 8 L 34 8 A 14 14 0 0 1 48 22 L 48 26 A 24 24 0 0 0 26 48 L 22 48 A 14 14 0 0 1 8 34 L 8 22 A 14 14 0 0 1 22 8 Z"
                className="fill-[#031a40] dark:fill-[#38bdf8]"
            />
            {/* Top-Right: Royal Blue */}
            <path
                d="M 92 22 L 92 34 A 14 14 0 0 1 78 48 L 74 48 A 24 24 0 0 0 52 26 L 52 22 A 14 14 0 0 1 66 8 L 78 8 A 14 14 0 0 1 92 22 Z"
                fill="#026eff"
            />
            {/* Bottom-Left: Electric Bright Blue */}
            <path
                d="M 8 78 L 8 66 A 14 14 0 0 1 22 52 L 26 52 A 24 24 0 0 0 48 74 L 48 78 A 14 14 0 0 1 34 92 L 22 92 A 14 14 0 0 1 8 78 Z"
                fill="#0b79ff"
            />
            {/* Bottom-Right: Fresh Mint Emerald */}
            <path
                d="M 78 92 L 66 92 A 14 14 0 0 1 52 78 L 52 74 A 24 24 0 0 0 74 52 L 78 52 A 14 14 0 0 1 92 66 L 92 78 A 14 14 0 0 1 78 92 Z"
                fill="#0aceb3"
            />
        </svg>
    );

    if (variant === 'icon' || variant === 'mark') {
        return <Mark markSize={size} markClass={className} {...props} />;
    }

    if (variant === 'stacked') {
        return (
            <div className={`flex flex-col items-center gap-3 ${className}`} {...props}>
                <Mark markSize={size * 1.8} markClass={iconClassName} />
                <div className="flex items-center gap-2">
                    <span className={`text-2xl font-extrabold tracking-tight text-[#05183c] dark:text-white font-sans ${textClassName}`}>
                        specmatch
                    </span>
                </div>
            </div>
        );
    }

    // Default: Horizontal 'full'
    return (
        <div className={`flex items-center gap-2.5 ${className}`} {...props}>
            <Mark markSize={size} markClass={iconClassName} />
            <div className="flex items-center gap-2 leading-none">
                <span className={`text-base font-extrabold tracking-tight text-[#05183c] dark:text-white font-sans ${textClassName}`}>
                    specmatch
                </span>
            </div>
        </div>
    );
}
