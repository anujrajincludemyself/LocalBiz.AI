const Input = ({
    label,
    error,
    type = 'text',
    className = '',
    required = false,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                className={`
                    w-full px-4 py-2 rounded-lg
                    bg-white/5 border border-white/10
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                    transition outline-none
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

const Select = ({
    label,
    error,
    options = [],
    className = '',
    required = false,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <select
                className={`
                    w-full px-4 py-2 rounded-lg
                    bg-white/5 border border-white/10
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                    transition outline-none
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-900">
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

const Textarea = ({
    label,
    error,
    className = '',
    required = false,
    rows = 4,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <textarea
                rows={rows}
                className={`
                    w-full px-4 py-2 rounded-lg
                    bg-white/5 border border-white/10
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                    transition outline-none resize-none
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

export { Input, Select, Textarea };
export default Input;
