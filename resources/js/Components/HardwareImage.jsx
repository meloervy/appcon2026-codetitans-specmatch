import { useState } from 'react';

/**
 * Maps known device models/URLs to local static image assets.
 * Guarantees instant 0ms rendering and eliminates external hotlink (403) failures.
 */
function resolveLocalAsset(url, alt = '') {
    if (!url) return null;
    if (url.startsWith('/images/devices/')) return url;

    const text = `${url} ${alt}`.toLowerCase();

    if (text.includes('macbook_pro') || text.includes('macbook pro') || text.includes('macbook-pro') || text.includes('mac studio') || text.includes('imac')) {
        return '/images/devices/apple-macbook-pro.jpg';
    }
    if (text.includes('macbook_air') || text.includes('macbook air') || text.includes('macbook-air')) {
        return '/images/devices/apple-macbook-air.jpg';
    }
    if (text.includes('thinkpad_x1') || text.includes('thinkpad x1') || text.includes('carbon')) {
        return '/images/devices/lenovo-thinkpad-x1.jpg';
    }
    if (text.includes('thinkpad') || text.includes('t14') || text.includes('e14')) {
        return '/images/devices/lenovo-thinkpad.jpg';
    }
    if (text.includes('ideapad')) {
        return '/images/devices/lenovo-ideapad.jpg';
    }
    if (text.includes('thinkcentre')) {
        return '/images/devices/lenovo-thinkcentre.jpg';
    }
    if (text.includes('xps')) {
        return '/images/devices/dell-xps.jpg';
    }
    if (text.includes('latitude')) {
        return '/images/devices/dell-latitude.jpg';
    }
    if (text.includes('precision')) {
        return '/images/devices/dell-precision.jpg';
    }
    if (text.includes('optiplex') || text.includes('prodesk') || text.includes('elitedesk')) {
        return '/images/devices/dell-optiplex.jpg';
    }
    if (text.includes('elitebook')) {
        return '/images/devices/hp-elitebook.jpg';
    }
    if (text.includes('probook') || text.includes('hp 250')) {
        return '/images/devices/hp-probook.jpg';
    }
    if (text.includes('z8') || text.includes('workstation')) {
        return '/images/devices/hp-workstation.jpg';
    }
    if (text.includes('aspire')) {
        return '/images/devices/acer-aspire.jpg';
    }
    if (text.includes('custom') || text.includes('ai rig')) {
        return '/images/devices/custom-ai-rig.jpg';
    }

    return url;
}

export default function HardwareImage({
    src,
    alt = 'Hardware Device',
    className = 'w-full h-full object-cover',
    deviceType = 'laptop',
    fallbackSrc = null,
    ...props
}) {
    const [hasError, setHasError] = useState(false);

    const defaultFallback = fallbackSrc || (
        deviceType === 'desktop'
            ? '/images/devices/default-desktop.jpg'
            : '/images/devices/default-laptop.jpg'
    );

    const resolved = resolveLocalAsset(src, alt);
    const imageSource = (!hasError && resolved) ? resolved : defaultFallback;

    return (
        <img
            src={imageSource}
            alt={alt}
            loading="lazy"
            onError={() => {
                if (!hasError) {
                    setHasError(true);
                }
            }}
            className={`transition-opacity duration-200 ${className}`}
            {...props}
        />
    );
}
