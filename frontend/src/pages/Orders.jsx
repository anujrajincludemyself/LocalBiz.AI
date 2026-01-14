import { useState, useEffect } from 'react';
import { Filter, MessageCircle, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import orderApi from '../services/orderApi';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { showSuccess, showError } from '../utils/toast';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
];

const STATUS_COLORS = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'purple',
    ready: 'success',
    delivered: 'success',
    cancelled: 'danger'
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(null);

    // Calculate stats
    const stats = {
        total: orders.length,
        revenue: orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0),
        pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length
    };

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;

            const response = await orderApi.getOrders(params);
            setOrders(response.data || response.orders || []);
        } catch (error) {
            showError(error.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    // Update order status
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(true);
            await orderApi.updateOrderStatus(orderId, newStatus);
            showSuccess(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            showError(error.message || 'Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Send WhatsApp notification
    const handleSendWhatsApp = async (orderId) => {
        try {
            setSendingWhatsApp(orderId);
            const response = await orderApi.sendWhatsApp(orderId);

            if (response.success) {
                showSuccess('WhatsApp notification sent successfully');
                fetchOrders();
            } else {
                showError('Failed to send WhatsApp notification');
            }
        } catch (error) {
            showError(error.message || 'WhatsApp sending failed');
        } finally {
            setSendingWhatsApp(null);
        }
    };

    // Table columns
    const columns = [
        {
            header: 'Order #',
            accessor: 'orderNumber',
            render: (order) => (
                <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'customer',
            render: (order) => (
                <div>
                    <div className="font-medium">{order.customer?.name}</div>
                    <div className="text-xs text-gray-400">{formatPhone(order.customer?.phone)}</div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (order) => (
                <button
                    onClick={() => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 underline"
                >
                    {order.items?.length || 0} items
                </button>
            )
        },
        {
            header: 'Amount',
            accessor: 'finalTotal',
            render: (order) => (
                <div>
                    <div className="font-medium">{formatCurrency(order.finalTotal)}</div>
                    {order.discount > 0 && (
                        <div className="text-xs text-green-400">
                            -{formatCurrency(order.discount)} discount
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (order) => (
                <div className="space-y-1">
                    <Badge variant={STATUS_COLORS[order.status] || 'default'}>
                        {order.status}
                    </Badge>
                    {order.paymentStatus === 'paid' && (
                        <div>
                            <Badge variant="success" className="text-xs">Paid</Badge>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            render: (order) => (
                <div className="flex gap-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <select
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            disabled={updatingStatus}
                            className="px-2 py-1 text-sm rounded bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            defaultValue=""
                        >
                            <option value="" disabled>Update Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancel</option>
                        </select>
                    )}
                    <button
                        onClick={() => handleSendWhatsApp(order._id)}
                        disabled={sendingWhatsApp === order._id}
                        className={`p-2 rounded-lg transition ${order.whatsappSent
                                ? 'bg-green-500/20 text-green-400'
                                : 'hover:bg-white/10'
                            }`}
                        title={order.whatsappSent ? 'WhatsApp sent' : 'Send WhatsApp'}
                    >
                        {order.whatsappSent ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <MessageCircle className="w-4 h-4" />
                        )}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Orders</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Orders</div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
                    <div className="text-3xl font-bold text-green-400">{formatCurrency(stats.revenue)}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-gray-400 text-sm mb-2">Pending Orders</div>
                    <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <Table
                columns={columns}
                data={orders}
                loading={loading}
                emptyMessage="No orders yet. Orders will appear here when customers place them."
            />

            {/* Order Details Modal */}
            <Modal
                isOpen={showDetails}
                onClose={() => {
                    setShowDetails(false);
                    setSelectedOrder(null);
                }}
                title={`Order Details - ${selectedOrder?.orderNumber}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div>
                            <h3 className="font-semibold mb-2">Customer Information</h3>
                            <div className="space-y-1 text-sm">
                                <p>Name: {selectedOrder.customer?.name}</p>
                                <p>Phone: {formatPhone(selectedOrder.customer?.phone)}</p>
                                {selectedOrder.customer?.address && (
                                    <p>Address: {selectedOrder.customer.address}</p>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="font-semibold mb-2">Order Items</h3>
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Product</th>
                                            <th className="px-4 py-2 text-right">Price</th>
                                            <th className="px-4 py-2 text-right">Qty</th>
                                            <th className="px-4 py-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index} className="border-t border-white/5">
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                                                <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                                                <td className="px-4 py-2 text-right">{formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(selectedOrder.total)}</span>
                            </div>
                            {selectedOrder.discount > 0 && (
                                <div className="flex justify-between text-green-400">
                                    <span>Discount:</span>
                                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                                <span>Total:</span>
                                <span>{formatCurrency(selectedOrder.finalTotal)}</span>
                            </div>
                        </div>

                        {/* Additional Info */}
                        {selectedOrder.notes && (
                            <div>
                                <h3 className="font-semibold mb-2">Notes</h3>
                                <p className="text-sm text-gray-300">{selectedOrder.notes}</p>
                            </div>
                        )}

                        {selectedOrder.deliveryDate && (
                            <div className="text-sm">
                                <span className="text-gray-400">Delivery Date:</span>{' '}
                                <span>{formatDate(selectedOrder.deliveryDate)}</span>
                                {selectedOrder.deliveryTime && ` at ${selectedOrder.deliveryTime}`}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
