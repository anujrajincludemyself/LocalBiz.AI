import { useState } from 'react';
import Input, { Select, Textarea } from '../ui/Input';
import Button from '../ui/Button';

const UNITS = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'box', label: 'Box' },
    { value: 'packet', label: 'Packet' },
    { value: 'other', label: 'Other' }
];

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        costPrice: product?.costPrice || '',
        stock: product?.stock || '',
        unit: product?.unit || 'piece',
        category: product?.category || '',
        tags: product?.tags?.join(', ') || ''
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
        if (formData.costPrice < 0) newErrors.costPrice = 'Cost price cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const submitData = {
            ...formData,
            price: parseFloat(formData.price),
            costPrice: parseFloat(formData.costPrice) || 0,
            stock: parseInt(formData.stock) || 0,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
        };

        onSubmit(submitData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    placeholder="e.g., Milk"
                />

                <Input
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Dairy, Groceries"
                />
            </div>

            <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description (optional)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Selling Price (₹)"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    error={errors.price}
                    required
                    placeholder="0.00"
                />

                <Input
                    label="Cost Price (₹)"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={handleChange}
                    error={errors.costPrice}
                    placeholder="0.00"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Stock Quantity"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    error={errors.stock}
                    required
                    placeholder="0"
                />

                <Select
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    options={UNITS}
                    required
                />
            </div>

            <Input
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., dairy, fresh, organic (comma separated)"
            />

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                >
                    {product ? 'Update Product' : 'Add Product'}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
