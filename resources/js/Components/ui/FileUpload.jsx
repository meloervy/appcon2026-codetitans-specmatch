import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RiUploadCloud2Line, RiFileTextLine, RiCloseLine } from 'react-icons/ri';

const mainVariant = {
    initial: {
        x: 0,
        y: 0,
    },
    animate: {
        x: 14,
        y: -14,
        opacity: 0.95,
    },
};

const secondaryVariant = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
};

export function FileUpload({
    onChange,
    onImageSelect,
    accept = 'image/*,.pdf,.doc,.docx',
    maxFiles = 5,
    className,
}) {
    const [files, setFiles] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(
        (newFiles) => {
            const validFiles = Array.from(newFiles).slice(0, maxFiles);
            setFiles((prev) => [...prev, ...validFiles]);

            if (onChange) {
                onChange(validFiles);
            }

            // If an image was dropped/uploaded, generate data URL for instant photo preview
            const imageFile = validFiles.find((f) => f.type.startsWith('image/'));
            if (imageFile && onImageSelect) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    onImageSelect(e.target.result, imageFile);
                };
                reader.readAsDataURL(imageFile);
            }
        },
        [maxFiles, onChange, onImageSelect],
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const removeFile = (index, e) => {
        e.stopPropagation();
        setFiles((prev) => prev.filter((_, idx) => idx !== index));
    };

    return (
        <div className={cn('w-full', className)}>
            <motion.div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover="animate"
                className="group/file relative block w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#026eff] dark:hover:border-[#026eff] p-8 transition-colors bg-slate-50/50 dark:bg-zinc-900/60"
            >
                <input
                    ref={fileInputRef}
                    id="file-upload-input"
                    type="file"
                    accept={accept}
                    multiple={maxFiles > 1}
                    onChange={(e) => handleFileChange(e.target.files || [])}
                    className="hidden"
                />

                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none opacity-40 dark:opacity-20">
                    <GridPattern />
                </div>

                <div className="flex flex-col items-center justify-center text-center relative z-20">
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                        Upload Hardware Photos or Spec Sheet
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        Drag & drop device images (.jpg, .png, .webp) or click to browse
                    </p>

                    <div className="relative mx-auto mt-6 w-full max-w-lg">
                        <AnimatePresence>
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={file.name + idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="relative z-40 mx-auto flex w-full flex-col justify-between rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-3.5 shadow-xs text-left"
                                        >
                                            <div className="flex w-full items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <RiFileTextLine className="w-5 h-5 text-[#026eff] shrink-0" />
                                                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-xs">
                                                        {file.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-slate-100 dark:bg-zinc-700 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-zinc-300">
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => removeFile(idx, e)}
                                                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                    >
                                                        <RiCloseLine className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                                                <span className="truncate">{file.type || 'file'}</span>
                                                <span>Modified {new Date(file.lastModified).toLocaleDateString()}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>

                        {!files.length && (
                            <div className="relative mx-auto flex h-24 w-full max-w-[7rem] items-center justify-center">
                                <motion.div
                                    variants={mainVariant}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className="relative z-40 flex h-20 w-24 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-md group-hover/file:shadow-xl"
                                >
                                    {isDragActive ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center text-[#026eff]"
                                        >
                                            <span className="text-[10px] font-bold">Release</span>
                                            <RiUploadCloud2Line className="h-5 w-5" />
                                        </motion.div>
                                    ) : (
                                        <RiUploadCloud2Line className="h-6 w-6 text-slate-500 dark:text-zinc-400 group-hover/file:text-[#026eff] transition-colors" />
                                    )}
                                </motion.div>

                                <motion.div
                                    variants={secondaryVariant}
                                    className="absolute inset-0 z-30 flex h-20 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-[#026eff] bg-transparent opacity-0 group-hover/file:opacity-100"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function GridPattern() {
    const columns = 28;
    const rows = 8;
    return (
        <div className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px">
            {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: columns }).map((_, col) => {
                    const index = row * columns + col;
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`flex h-8 w-8 shrink-0 rounded-[2px] ${
                                index % 2 === 0
                                    ? 'bg-slate-200/50 dark:bg-zinc-800/50'
                                    : 'bg-slate-300/30 dark:bg-zinc-800/30'
                            }`}
                        />
                    );
                }),
            )}
        </div>
    );
}

export default FileUpload;
