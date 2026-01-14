import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    MessageSquare,
    Bot,
    Settings,
    Store
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-primary-700">
                {isOpen ? (
                    <div className="flex items-center gap-2">
                        <Store className="w-8 h-8" />
                        <span className="font-bold text-xl">LocalBiz AI</span>
                    </div>
                ) : (
                    <Store className="w-8 h-8" />
                )}
            </div>

            {/* Navigation */}
            <nav className="mt-8 px-3 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'hover:bg-white/10 text-white/80 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isOpen && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Version */}
            {isOpen && (
                <div className="absolute bottom-4 left-4 text-xs text-white/50">
                    v1.0.0
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
