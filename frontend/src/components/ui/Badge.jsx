const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-500/20 text-gray-300',
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-yellow-500/20 text-yellow-400',
        danger: 'bg-red-500/20 text-red-400',
        info: 'bg-blue-500/20 text-blue-400',
        purple: 'bg-purple-500/20 text-purple-400',
        pink: 'bg-pink-500/20 text-pink-400'
    };

    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${variants[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
};

export default Badge;
