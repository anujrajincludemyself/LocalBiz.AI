import { useState, useEffect } from 'react';
import { Save, Copy, Check, Store, MessageCircle, Globe, Settings as SettingsIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input, { Select, Textarea } from '../components/ui/Input';
import shopApi from '../services/shopApi';
import { showSuccess, showError } from '../utils/toast';
import { copyToClipboard } from '../utils/formatters';

const SHOP_CATEGORIES = [
    { value: 'kirana', label: 'Kirana/Grocery Store' },
    { value: 'salon', label: 'Salon/Spa' },
    { value: 'tailor', label: 'Tailor Shop' },
    { value: 'tiffin', label: 'Tiffin Service' },
    { value: 'tuition', label: 'Tuition Center' },
    { value: 'repair', label: 'Repair Shop' },
    { value: 'medical', label: 'Medical Store' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'other', label: 'Other' }
];

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी (Hindi)' }
];

const Settings = () => {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        category: 'other',
        whatsapp: '',
        email: '',
        description: '',
        'address.street': '',
        'address.area': '',
        'address.city': '',
        'address.state': '',
        'address.pincode': '',
        'settings.language': 'en',
        'settings.lowStockThreshold': '10',
        'settings.enableWhatsAppNotifications': true
    });

    // Fetch shop data
    useEffect(() => {
        const fetchShop = async () => {
            try {
                setLoading(true);
                const response = await shopApi.getShop();
                const shopData = response.shop || response.data;
                setShop(shopData);

                // Populate form
                setFormData({
                    shopName: shopData.shopName || '',
                    category: shopData.category || 'other',
                    whatsapp: shopData.whatsapp || '',
                    email: shopData.email || '',
                    description: shopData.description || '',
                    'address.street': shopData.address?.street || '',
                    'address.area': shopData.address?.area || '',
                    'address.city': shopData.address?.city || '',
                    'address.state': shopData.address?.state || '',
                    'address.pincode': shopData.address?.pincode || '',
                    'settings.language': shopData.settings?.language || 'en',
                    'settings.lowStockThreshold': shopData.settings?.lowStockThreshold?.toString() || '10',
                    'settings.enableWhatsAppNotifications': shopData.settings?.enableWhatsAppNotifications ?? true
                });
            } catch (error) {
                // If shop doesn't exist (404), that's okay - user will create one
                if (error.message?.includes('No shop found') || error.message?.includes('not found')) {
                    console.log('No shop found - user needs to create one');
                    setShop(null);
                } else {
                    showError(error.message || 'Failed to load shop settings');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchShop();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            // Transform flat form data to nested structure
            const shopData = {
                shopName: formData.shopName,
                category: formData.category,
                whatsapp: formData.whatsapp,
                email: formData.email,
                description: formData.description,
                address: {
                    street: formData['address.street'],
                    area: formData['address.area'],
                    city: formData['address.city'],
                    state: formData['address.state'],
                    pincode: formData['address.pincode']
                },
                settings: {
                    language: formData['settings.language'],
                    lowStockThreshold: parseInt(formData['settings.lowStockThreshold']) || 10,
                    enableWhatsAppNotifications: formData['settings.enableWhatsAppNotifications']
                }
            };

            // Create shop if it doesn't exist, otherwise update
            if (!shop) {
                await shopApi.createShop(shopData);
                showSuccess('Shop created successfully! 🎉');
            } else {
                await shopApi.updateShop(shopData);
                showSuccess('Settings saved successfully');
            }

            // Refresh shop data
            const response = await shopApi.getShop();
            setShop(response.shop || response.data);
        } catch (error) {
            showError(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shop?.publicSlug) return;

        const publicUrl = `${window.location.origin}/shop/${shop.publicSlug}`;
        const success = await copyToClipboard(publicUrl);

        if (success) {
            setCopied(true);
            showSuccess('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            showError('Failed to copy link');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    const publicUrl = shop?.publicSlug ? `${window.location.origin}/shop/${shop.publicSlug}` : '';

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                {!shop ? 'Create Your Shop' : 'Settings'}
            </h1>
            {!shop && (
                <div className="glass-card p-4 mb-6 bg-purple-500/20 border-purple-500/30">
                    <p className="text-sm">
                        👋 Welcome! Let's set up your shop first. Fill in the details below and click "Create Shop" to get started.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shop Profile */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Store className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-semibold">Shop Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Shop Name"
                            name="shopName"
                            value={formData.shopName}
                            onChange={handleChange}
                            required
                        />
                        <Select
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            options={SHOP_CATEGORIES}
                            required
                        />
                    </div>

                    <div className="mt-6">
                        <Textarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell your customers about your shop..."
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageCircle className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-semibold">Contact Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="WhatsApp Number"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="10-digit number"
                            maxLength="10"
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Street Address"
                            name="address.street"
                            value={formData['address.street']}
                            onChange={handleChange}
                        />
                        <Input
                            label="Area"
                            name="address.area"
                            value={formData['address.area']}
                            onChange={handleChange}
                        />
                        <Input
                            label="City"
                            name="address.city"
                            value={formData['address.city']}
                            onChange={handleChange}
                        />
                        <Input
                            label="State"
                            name="address.state"
                            value={formData['address.state']}
                            onChange={handleChange}
                        />
                        <Input
                            label="Pincode"
                            name="address.pincode"
                            value={formData['address.pincode']}
                            onChange={handleChange}
                            maxLength="6"
                        />
                    </div>
                </div>

                {/* Public Shop Link */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-semibold">Public Shop Link</h2>
                    </div>

                    <p className="text-gray-300 mb-4">
                        Share this link with your customers so they can browse products and place orders directly.
                    </p>

                    {publicUrl && (
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={publicUrl}
                                readOnly
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                            />
                            <Button
                                type="button"
                                variant={copied ? 'success' : 'secondary'}
                                onClick={handleCopyLink}
                            >
                                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* App Settings */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <SettingsIcon className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-semibold">App Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Language"
                            name="settings.language"
                            value={formData['settings.language']}
                            onChange={handleChange}
                            options={LANGUAGES}
                        />
                        <Input
                            label="Low Stock Threshold"
                            name="settings.lowStockThreshold"
                            type="number"
                            value={formData['settings.lowStockThreshold']}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="settings.enableWhatsAppNotifications"
                                checked={formData['settings.enableWhatsAppNotifications']}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-purple-600"
                            />
                            <div>
                                <div className="font-medium">Enable WhatsApp Notifications</div>
                                <div className="text-sm text-gray-400">
                                    Automatically send order confirmations via WhatsApp
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Subscription Info */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-lg font-medium">Free Plan</div>
                            <div className="text-sm text-gray-400">Currently active</div>
                        </div>
                        <Badge variant="success">Active</Badge>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={saving}
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {!shop ? 'Create Shop' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
