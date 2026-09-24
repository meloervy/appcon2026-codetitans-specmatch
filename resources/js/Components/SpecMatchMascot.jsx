import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Fukurou - Official SpecMatch AI Mascot Component
 * Uses clean transparent mascot image assets.
 * 4.png is completely removed from all mappings.
 */
export default function SpecMatchMascot({
    pose = 'greeting', // 'greeting' (2.png) | 'active' (6.png) | 'happy' (8.png) | 'hero' (12.png)
    variant = 'full',  // 'avatar' | 'full' | 'hero' | 'badge'
    size = 48,
    className = '',
    imageClassName = '',
    showGlow = true,
    animated = true,
    speechBubble = null,
    isOnline = true,
    alt = 'Fukurou - Official SpecMatch AI Mascot',
    onClick = null,
    ...props
}) {
    // Direct mapping to clean mascot images (4.png removed)
    const poseMap = {
        greeting: '/images/mascot/2.png?v=transparent_v2',
        thinking: '/images/mascot/2.png?v=transparent_v2',
        active: '/images/mascot/6.png?v=transparent_v2',
        happy: '/images/mascot/8.png?v=transparent_v2',
        hero: '/images/mascot/12.png?v=transparent_v2',
    };

    const imageSrc = poseMap[pose] || poseMap.greeting;

    // Variant: Avatar (Circle / rounded box for chat bubbles, headers, floating button)
    if (variant === 'avatar') {
        return (
            <motion.div
                whileHover={animated ? { scale: 1.08, rotate: 2 } : {}}
                whileTap={animated ? { scale: 0.94 } : {}}
                className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-visible cursor-pointer ${className}`}
                style={{ width: `${size}px`, height: `${size}px` }}
                onClick={onClick}
                {...props}
            >
                {showGlow && (
                    <motion.div
                        animate={animated ? {
                            opacity: [0.35, 0.65, 0.35],
                            scale: [1, 1.08, 1],
                        } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#026EFC]/40 to-[#0BCDB2]/40 blur-[5px] -z-10"
                    />
                )}

                {/* Avatar container */}
                <div className="w-full h-full rounded-xl bg-gradient-to-b from-sky-50 to-white dark:from-zinc-800 dark:to-zinc-900 border border-sky-100 dark:border-zinc-700/80 shadow-2xs overflow-hidden flex items-center justify-center p-0.5">
                    <img
                        src={imageSrc}
                        alt={alt}
                        className={`w-full h-full object-cover object-top select-none ${imageClassName}`}
                        loading="lazy"
                    />
                </div>

                {/* Online Indicator Status Dot */}
                {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                    </span>
                )}
            </motion.div>
        );
    }

    // Variant: Badge (Inline pill with avatar and Fukurou label)
    if (variant === 'badge') {
        return (
            <motion.div
                whileHover={animated ? { scale: 1.04 } : {}}
                whileTap={animated ? { scale: 0.96 } : {}}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-sky-200/70 dark:border-zinc-700/80 shadow-2xs backdrop-blur-md cursor-pointer ${className}`}
                onClick={onClick}
                {...props}
            >
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-sky-50 dark:bg-zinc-800 border border-sky-100 dark:border-zinc-700">
                    <img
                        src={imageSrc}
                        alt={alt}
                        className="w-full h-full object-cover object-top"
                    />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>Fukurou AI</span>
                    {isOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                </span>
            </motion.div>
        );
    }

    // Variant: Hero (For login hero section, welcome showcase, modal banners)
    if (variant === 'hero') {
        return (
            <div className={`relative flex flex-col items-center select-none ${className}`} {...props}>
                {/* Multi-layered Ambient Glow */}
                {showGlow && (
                    <>
                        <motion.div
                            animate={animated ? {
                                scale: [1, 1.15, 1],
                                opacity: [0.35, 0.6, 0.35],
                            } : {}}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-radial from-[#026EFC]/35 via-[#0BCDB2]/20 to-transparent blur-2xl -z-10 pointer-events-none"
                        />
                        <motion.div
                            animate={animated ? {
                                scale: [1, 0.85, 1],
                                opacity: [0.6, 0.35, 0.6],
                            } : {}}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-6 rounded-full bg-slate-950/60 blur-md -z-10"
                        />
                    </>
                )}

                {/* Optional Floating Speech Bubble */}
                {speechBubble && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={typeof speechBubble === 'string' ? speechBubble : 'bubble'}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="mb-3 shadow-lg rounded-2xl rounded-bl-xs bg-white/95 dark:bg-zinc-900/95 border border-sky-200/80 dark:border-zinc-700 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-zinc-100 backdrop-blur-md max-w-xs text-center z-10"
                        >
                            {speechBubble}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Fukurou Mascot Floating Character */}
                <motion.div
                    animate={animated ? {
                        y: [-7, 7, -7],
                        rotate: [-1.2, 1.2, -1.2],
                    } : {}}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    whileHover={animated ? { scale: 1.05, rotate: 1.5, transition: { duration: 0.2 } } : {}}
                    whileTap={animated ? { scale: 0.95, rotate: -2 } : {}}
                    className="relative flex items-center justify-center cursor-pointer"
                    style={{ width: `${size}px`, height: `${size}px` }}
                    onClick={onClick}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={imageSrc}
                            src={imageSrc}
                            alt={alt}
                            initial={{ opacity: 0.85, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0.85, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`w-full h-full object-contain select-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] ${imageClassName}`}
                        />
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    // Default: Full Mascot Character with transparent background & smooth physics
    return (
        <motion.div
            animate={animated ? {
                y: [-6, 6, -6],
                rotate: [-1, 1, -1],
            } : {}}
            transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            whileHover={animated ? { scale: 1.05, rotate: 2, transition: { duration: 0.2 } } : {}}
            whileTap={animated ? { scale: 0.95, rotate: -2 } : {}}
            className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
            style={{ width: `${size}px`, height: `${size}px` }}
            onClick={onClick}
            {...props}
        >
            {showGlow && (
                <motion.div
                    animate={animated ? {
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.55, 0.3],
                    } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-radial from-[#026EFC]/30 to-transparent blur-lg -z-10"
                />
            )}
            <AnimatePresence mode="wait">
                <motion.img
                    key={imageSrc}
                    src={imageSrc}
                    alt={alt}
                    initial={{ opacity: 0.85, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.85, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`w-full h-full object-contain select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] ${imageClassName}`}
                    loading="lazy"
                />
            </AnimatePresence>
        </motion.div>
    );
}
