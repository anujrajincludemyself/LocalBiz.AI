import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Send, Check } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import shopApi from '../services/shopApi';
import productApi from '../services/productApi';
import orderApi from '../services/orderApi';
import { formatCurrency } from '../utils/formatters';
import { showSuccess, showError, showInfo } from '../utils/toast';

const ShopPage = () => {
    const { slug } = useParams();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    // Fetch shop and products
    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);

                // Fetch shop
                const shopResponse = await shopApi.getPublicShop(slug);
                setShop(shopResponse.shop || shopResponse.data);

                // Fetch products for this shop
                const productsResponse = await productApi.getProducts({
                    shopId: shopResponse.shop?._id || shopResponse.data?._id,
                    isActive: true
                });
                setProducts(productsResponse.data || productsResponse.products || []);
            } catch (error) {
                showError('Shop not found or unavailable');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchShopData();
        }
    }, [slug]);

    // Cart functions
    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);

        if (existing) {
            if (existing.quantity >= product.stock) {
                showInfo('Maximum stock reached');
                return;
            }
            setCart(cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        showSuccess(`${product.name} added to cart`);
    };

    const updateQuantity = (productId, change) => {
        setCart(cart.map(item => {
            if (item._id === productId) {
                const newQuantity = item.quantity + change;
                if (newQuantity <= 0) return null;
                if (newQuantity > item.stock) {
                    showInfo('Maximum stock reached');
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item._id !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Place order
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            showError('Cart is empty');
            return;
        }

        if (!customerData.name || !customerData.phone) {
            showError('Please fill in all required fields');
            return;
        }

        if (!/^[0-9]{10}$/.test(customerData.phone)) {
            showError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setSubmitting(true);

            const orderData = {
                shopId: shop._id,
                customer: {
                    name: customerData.name,
                    phone: customerData.phone,
                    address: customerData.address
                },
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                })),
                total: cartTotal,
                discount: 0,
                source: 'public_page'
            };

            const response = await orderApi.createOrder(orderData);

            setOrderNumber(response.order?.orderNumber || 'N/A');
            setOrderSuccess(true);
            setCart([]);
            setCustomerData({ name: '', phone: '', address: '' });
            setShowOrderForm(false);
        } catch (error) {
            showError(error.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Shop Not Found</h1>
                    <p className="text-gray-300">This shop is not available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            {/* Header */}
            <header className="glass-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">{shop.shopName}</h1>
                            {shop.description && (
                                <p className="text-sm text-gray-300 mt-1">{shop.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative p-3 hover:bg-white/10 rounded-lg transition"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Products Grid */}
            <main className="container mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No products available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="glass-card p-4 hover:scale-105 transition">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl font-bold text-green-400">
                                        {formatCurrency(product.price)}
                                    </span>
                                    {product.stock <= 10 && (
                                        <Badge variant="warning">Low Stock</Badge>
                                    )}
                                </div>

                                <div className="text-sm text-gray-400 mb-4">
                                    {product.stock > 0 ? (
                                        <span>Available: {product.stock} {product.unit}</span>
                                    ) : (
                                        <span className="text-red-400">Out of Stock</span>
                                    )}
                                </div>

                                <Button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                    variant="primary"
                                    className="w-full"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Cart
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Sidebar Modal */}
            <Modal
                isOpen={showCart}
                onClose={() => setShowCart(false)}
                title="Your Cart"
                size="md"
            >
                {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item._id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-400">{formatCurrency(item.price)} each</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item._id, -1)}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, 1)}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="font-bold">{formatCurrency(item.price * item.quantity)}</div>

                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="p-2 hover:bg-white/10 rounded text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between text-xl font-bold mb-4">
                                <span>Total:</span>
                                <span className="text-green-400">{formatCurrency(cartTotal)}</span>
                            </div>

                            <Button
                                onClick={() => {
                                    setShowCart(false);
                                    setShowOrderForm(true);
                                }}
                                variant="primary"
                                size="lg"
                                className="w-full"
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Order Form Modal */}
            <Modal
                isOpen={showOrderForm}
                onClose={() => setShowOrderForm(false)}
                title="Complete Your Order"
                size="md"
            >
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <Input
                        label="Your Name"
                        name="name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        required
                        placeholder="Enter your name"
                    />

                    <Input
                        label="Phone Number"
                        name="phone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        required
                        placeholder="10-digit mobile number"
                        maxLength="10"
                    />

                    <Textarea
                        label="Delivery Address (Optional)"
                        name="address"
                        value={customerData.address}
                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                        rows={3}
                        placeholder="Enter delivery address"
                    />

                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Items:</span>
                            <span>{cartItemCount}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-green-400">{formatCurrency(cartTotal)}</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={submitting}
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Place Order
                    </Button>
                </form>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={orderSuccess}
                onClose={() => setOrderSuccess(false)}
                title="Order Placed Successfully!"
                size="sm"
            >
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                    <p className="text-gray-300 mb-4">
                        Your order has been placed successfully. The shop owner will contact you shortly.
                    </p>
                    <div className="glass-card p-4 mb-6">
                        <div className="text-sm text-gray-400">Order Number</div>
                        <div className="text-2xl font-bold text-purple-400">{orderNumber}</div>
                    </div>
                    <Button
                        onClick={() => setOrderSuccess(false)}
                        variant="primary"
                        className="w-full"
                    >
                        Continue Shopping
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ShopPage;
