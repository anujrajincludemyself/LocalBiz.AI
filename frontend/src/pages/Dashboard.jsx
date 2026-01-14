import { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, ShoppingCart, Users, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setAnalytics(response.data.analytics);
        } catch (error) {
            // If 400 error, user probably doesn't have a shop yet - show empty data
            if (error.response?.status === 400) {
                setAnalytics({
                    today: { sales: 0, orders: 0, salesChange: 0 },
                    totals: { customers: 0, products: 0, pendingOrders: 0, vipCustomers: 0 },
                    topProducts: [],
                    lowStockProducts: [],
                    recentOrders: []
                });
            } else {
                toast.error('Failed to load dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Track your business performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Sales"
                    value={formatCurrency(analytics?.today?.sales || 0)}
                    change={`${analytics?.today?.salesChange || 0}%`}
                    icon={TrendingUp}
                    color="blue"
                    positive={analytics?.today?.salesChange >= 0}
                />
                <StatCard
                    title="Orders"
                    value={analytics?.today?.orders || 0}
                    subtitle="Today"
                    icon={ShoppingCart}
                    color="green"
                />
                <StatCard
                    title="Customers"
                    value={analytics?.totals?.customers || 0}
                    subtitle={`${analytics?.totals?.vipCustomers || 0} VIP`}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Products"
                    value={analytics?.totals?.products || 0}
                    subtitle={`${analytics?.totals?.pendingOrders || 0} pending orders`}
                    icon={Package}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                    <div className="space-y-3">
                        {analytics?.recentOrders?.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                    <p className="text-sm text-gray-600">{order.customer.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(order.finalTotal)}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Low Stock Alerts
                    </h2>
                    <div className="space-y-3">
                        {analytics?.lowStockProducts?.length > 0 ? (
                            analytics.lowStockProducts.map((product) => (
                                <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                                    </div>
                                    <button className="btn btn-sm bg-red-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-700">
                                        Restock
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">All products are well stocked! 🎉</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {analytics?.topProducts?.map((product, index) => (
                        <div key={product._id} className="card p-4 text-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                                #{index + 1}
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">Sold: {product.totalSold}</p>
                            <p className="text-sm font-medium text-primary-600">{formatCurrency(product.revenue)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// StatCard Component
const StatCard = ({ title, value, subtitle, change, icon: Icon, color, positive }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
    };

    return (
        <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
                        {positive ? '↑' : '↓'} {change}
                    </span>
                )}
            </div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
};

export default Dashboard;
