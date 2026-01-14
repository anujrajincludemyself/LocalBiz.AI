import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Store, Mail, Lock, User, Phone } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.phone
        );

        if (result.success) {
            navigate('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8 animate-slide-down">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Store className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">LocalBiz AI</h1>
                    </div>
                    <p className="text-gray-600">Create your account and start growing your business</p>
                </div>

                {/* Registration Form */}
                <div className="glass-card p-8 animate-slide-up">
                    <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input pl-11"
                                    placeholder="Rahul Sharma"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-11"
                                    placeholder="rahul@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input pl-11"
                                    placeholder="9876543210"
                                    pattern="[0-9]{10}"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-11"
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    Creating Account...
                                </>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                            Login
                        </Link>
                    </p>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="glass-card p-4">
                        <p className="text-2xl font-bold text-primary-600">📦</p>
                        <p className="text-xs text-gray-600 mt-1">Inventory</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-2xl font-bold text-primary-600">📱</p>
                        <p className="text-xs text-gray-600 mt-1">WhatsApp</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-2xl font-bold text-primary-600">🤖</p>
                        <p className="text-xs text-gray-600 mt-1">AI Insights</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
