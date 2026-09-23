export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-[#026eff] shadow-sm focus:ring-[#026eff] ' +
                className
            }
        />
    );
}
