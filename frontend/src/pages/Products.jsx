import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input, { Select } from '../components/ui/Input';
import ProductForm from '../components/products/ProductForm';
import productApi from '../services/productApi';
import { formatCurrency } from '../utils/formatters';
import { showSuccess, showError } from '../utils/toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (categoryFilter) params.category = categoryFilter;

            const response = await productApi.getProducts(params);
            setProducts(response.data || response.products || []);
        } catch (error) {
            showError(error.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, categoryFilter]);

    // Add/Edit product
    const handleSubmit = async (formData) => {
        try {
            setSubmitting(true);

            if (editingProduct) {
                await productApi.updateProduct(editingProduct._id, formData);
                showSuccess('Product updated successfully');
            } else {
                await productApi.createProduct(formData);
                showSuccess('Product added successfully');
            }

            setShowModal(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            showError(error.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete product
    const handleDelete = async () => {
        if (!deletingProduct) return;

        try {
            await productApi.deleteProduct(deletingProduct._id);
            showSuccess('Product deleted successfully');
            setShowDeleteConfirm(false);
            setDeletingProduct(null);
            fetchProducts();
        } catch (error) {
            showError(error.message || 'Failed to delete product');
        }
    };

    // Get unique categories from products
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Table columns
    const columns = [
        {
            header: 'Product',
            accessor: 'name',
            render: (product) => (
                <div>
                    <div className="font-medium">{product.name}</div>
                    {product.category && (
                        <div className="text-xs text-gray-400">{product.category}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Price',
            accessor: 'price',
            render: (product) => (
                <div>
                    <div className="font-medium">{formatCurrency(product.price)}</div>
                    {product.costPrice > 0 && (
                        <div className="text-xs text-gray-400">
                            Cost: {formatCurrency(product.costPrice)}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Stock',
            accessor: 'stock',
            render: (product) => {
                const isLowStock = product.stock <= 10;
                return (
                    <div className="flex items-center gap-2">
                        <span className={isLowStock ? 'text-red-400 font-medium' : ''}>
                            {product.stock} {product.unit}
                        </span>
                        {isLowStock && (
                            <Badge variant="danger">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Low
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (product) => (
                <Badge variant={product.isActive ? 'success' : 'default'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            header: 'Actions',
            render: (product) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditingProduct(product);
                            setShowModal(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setDeletingProduct(product);
                            setShowDeleteConfirm(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-red-400"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <Button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowModal(true);
                    }}
                    variant="primary"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition outline-none"
                        />
                    </div>
                    <Select
                        options={[
                            { value: '', label: 'All Categories' },
                            ...categories.map(cat => ({ value: cat, label: cat }))
                        ]}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Table */}
            <Table
                columns={columns}
                data={products}
                loading={loading}
                emptyMessage="No products found. Add your first product!"
            />

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                }}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="lg"
            >
                <ProductForm
                    product={editingProduct}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                    loading={submitting}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeletingProduct(null);
                }}
                title="Delete Product"
                size="sm"
            >
                <div className="space-y-4">
                    <p>
                        Are you sure you want to delete <strong>{deletingProduct?.name}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeletingProduct(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Products;
