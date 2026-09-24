export default function InputLabel({
    value,
    className = '',
    required = false,
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-slate-700 dark:text-zinc-300 ` +
                className
            }
        >
            {value ? value : children}
            {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
    );
}
