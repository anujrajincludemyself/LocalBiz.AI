// Currency formatter
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Date formatter
export const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
};

// DateTime formatter
export const formatDateTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return d.toLocaleDateString('en-IN', options);
};

// Phone number formatter
export const formatPhone = (phone) => {
    if (!phone) return '-';
    // Format: +91 98765 43210
    if (phone.length === 10) {
        return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
};

// Number abbreviation (1000 -> 1K)
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`; // Crores
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`; // Lakhs
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

// Truncate text
export const truncate = (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};
