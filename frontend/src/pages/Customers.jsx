import { useState, useEffect } from 'react';
import { Users, Filter, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input, { Select } from '../components/ui/Input';
import customerApi from '../services/customerApi';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { showError } from '../utils/toast';

const SEGMENT_OPTIONS = [
    { value: '', label: 'All Segments' },
    { value: 'new', label: 'New' },
    { value: 'regular', label: 'Regular' },
    { value: 'vip', label: 'VIP' },
    { value: 'inactive', label: 'Inactive' }
];

const SEGMENT_COLORS = {
    new: 'info',
    regular: 'success',
    vip: 'purple',
    inactive: 'default'
};

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Calculate stats
    const stats = {
        total: customers.length,
        vip: customers.filter(c => c.segment === 'vip').length,
        totalValue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    };

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (segmentFilter) params.segment = segmentFilter;

            const response = await customerApi.getCustomers(params);
            setCustomers(response.data || response.customers || []);
        } catch (error) {
            showError(error.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [searchQuery, segmentFilter]);

    // View customer details
    const handleViewDetails = async (customer) => {
        try {
            setSelectedCustomer(customer);
            setShowDetails(true);
            setLoadingDetails(true);

            const response = await customerApi.getCustomer(customer._id);
            setCustomerOrders(response.orders || []);
        } catch (error) {
            showError(error.message || 'Failed to load customer details');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Table columns
    const columns = [
        {
            header: 'Customer',
            accessor: 'name',
            render: (customer) => (
                <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-gray-400">{formatPhone(customer.phone)}</div>
                </div>
            )
        },
        {
            header: 'Segment',
            accessor: 'segment',
            render: (customer) => (
                <Badge variant={SEGMENT_COLORS[customer.segment] || 'default'}>
                    {customer.segment || 'new'}
                </Badge>
            )
        },
        {
            header: 'Total Orders',
            accessor: 'totalOrders',
            render: (customer) => (
                <span className="font-medium">{customer.totalOrders || 0}</span>
            )
        },
        {
            header: 'Total Spent',
            accessor: 'totalSpent',
            render: (customer) => (
                <span className="font-medium text-green-400">
                    {formatCurrency(customer.totalSpent || 0)}
                </span>
            )
        },
        {
            header: 'Avg Order Value',
            accessor: 'averageOrderValue',
            render: (customer) => (
                <span>{formatCurrency(customer.averageOrderValue || 0)}</span>
            )
        },
        {
            header: 'Last Order',
            accessor: 'lastOrderDate',
            render: (customer) => (
                <span className="text-sm">{formatDate(customer.lastOrderDate)}</span>
            )
        },
        {
            header: 'Actions',
            render: (customer) => (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewDetails(customer)}
                >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                </Button>
            )
        }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Customers</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <div className="text-gray-400 text-sm">Total Customers</div>
                    </div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-gray-400 text-sm mb-2">VIP Customers</div>
                    <div className="text-3xl font-bold text-purple-400">{stats.vip}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Customer Value</div>
                    <div className="text-3xl font-bold text-green-400">{formatCurrency(stats.totalValue)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <Select
                            options={SEGMENT_OPTIONS}
                            value={segmentFilter}
                            onChange={(e) => setSegmentFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <Table
                columns={columns}
                data={customers}
                loading={loading}
                emptyMessage="No customers yet. Customers will be automatically created when orders are placed."
            />

            {/* Customer Details Modal */}
            <Modal
                isOpen={showDetails}
                onClose={() => {
                    setShowDetails(false);
                    setSelectedCustomer(null);
                    setCustomerOrders([]);
                }}
                title="Customer Details"
                size="lg"
            >
                {selectedCustomer && (
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3">Contact Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-400">Name:</span>{' '}
                                        <span className="font-medium">{selectedCustomer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Phone:</span>{' '}
                                        <span>{formatPhone(selectedCustomer.phone)}</span>
                                    </div>
                                    {selectedCustomer.email && (
                                        <div>
                                            <span className="text-gray-400">Email:</span>{' '}
                                            <span>{selectedCustomer.email}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400">Segment:</span>{' '}
                                        <Badge variant={SEGMENT_COLORS[selectedCustomer.segment] || 'default'} className="ml-2">
                                            {selectedCustomer.segment || 'new'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Statistics</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-400">Total Orders:</span>{' '}
                                        <span className="font-medium">{selectedCustomer.totalOrders || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Total Spent:</span>{' '}
                                        <span className="font-medium text-green-400">
                                            {formatCurrency(selectedCustomer.totalSpent || 0)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Avg Order Value:</span>{' '}
                                        <span className="font-medium">
                                            {formatCurrency(selectedCustomer.averageOrderValue || 0)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Last Order:</span>{' '}
                                        <span>{formatDate(selectedCustomer.lastOrderDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        {selectedCustomer.address && (
                            <div>
                                <h3 className="font-semibold mb-2">Address</h3>
                                <p className="text-sm text-gray-300">
                                    {selectedCustomer.address.street && `${selectedCustomer.address.street}, `}
                                    {selectedCustomer.address.area && `${selectedCustomer.address.area}, `}
                                    {selectedCustomer.address.city && `${selectedCustomer.address.city}`}
                                    {selectedCustomer.address.pincode && ` - ${selectedCustomer.address.pincode}`}
                                </p>
                            </div>
                        )}

                        {/* Recent Orders */}
                        <div>
                            <h3 className="font-semibold mb-3">Recent Orders</h3>
                            {loadingDetails ? (
                                <div className="text-center py-8">
                                    <div className="spinner w-6 h-6 mx-auto"></div>
                                </div>
                            ) : customerOrders.length > 0 ? (
                                <div className="border border-white/10 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Order #</th>
                                                <th className="px-4 py-2 text-left">Date</th>
                                                <th className="px-4 py-2 text-right">Amount</th>
                                                <th className="px-4 py-2 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerOrders.map((order) => (
                                                <tr key={order._id} className="border-t border-white/5">
                                                    <td className="px-4 py-2">{order.orderNumber}</td>
                                                    <td className="px-4 py-2">{formatDate(order.createdAt)}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(order.finalTotal)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <Badge variant={STATUS_COLORS[order.status] || 'default'}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">No orders found</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const STATUS_COLORS = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'purple',
    ready: 'success',
    delivered: 'success',
    cancelled: 'danger'
};

export default Customers;
