'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@lawethic/appwrite';
import { ID } from 'appwrite';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    redirectPath?: string;
    defaultMode?: 'login' | 'signup';
    initialData?: {
        name?: string;
        email?: string;
        phone?: string;
    };
}

type Mode = 'login' | 'signup';

export default function LoginModal({
    open,
    onClose,
    onSuccess,
    redirectPath,
    defaultMode = 'login',
    initialData
}: LoginModalProps) {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>(defaultMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        password: '',
    });

    // Update form data when initialData changes (modal opens with new data)
    React.useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                name: initialData.name || prev.name,
                email: initialData.email || prev.email,
                phone: initialData.phone || prev.phone,
            }));
        }
        // Reset mode to defaultMode when modal opens
        setMode(defaultMode);
    }, [initialData, defaultMode, open]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await account.createEmailPasswordSession(formData.email, formData.password);
            onSuccess();
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 401) {
                setError('Invalid email or password');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create user account
            await account.create(
                ID.unique(),
                formData.email,
                formData.password,
                formData.name
            );

            // Log them in
            await account.createEmailPasswordSession(formData.email, formData.password);

            // Update phone if provided
            if (formData.phone) {
                try {
                    await account.updatePhone(formData.phone, formData.password);
                } catch (phoneErr) {
                    console.warn('Could not update phone:', phoneErr);
                }
            }

            // Set customer role in prefs
            await account.updatePrefs({ role: 'customer' });

            onSuccess();
        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.code === 409) {
                setError('An account with this email already exists. Please login.');
                setMode('login');
            } else {
                setError(err.message || 'Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = mode === 'login' ? handleLogin : handleSignup;

    // Check if we have pre-filled data
    const hasPrefilledData = initialData && (initialData.name || initialData.email);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold text-center">
                        {mode === 'login' ? 'Welcome back!' : 'Create account'}
                    </DialogTitle>
                    <p className="text-center text-neutral-500 mt-2">
                        {mode === 'login'
                            ? 'Login to continue with your order'
                            : hasPrefilledData
                                ? 'Just set a password to create your account'
                                : 'Sign up to continue with your order'
                        }
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-4">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <Input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                        className="pl-10 h-12"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    required
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <Input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    required
                                    minLength={8}
                                    className="pl-10 pr-10 h-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {mode === 'signup' && (
                                <p className="text-xs text-neutral-500 mt-1">
                                    Minimum 8 characters
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-6 bg-brand-600 hover:bg-brand-700"
                    >
                        {loading
                            ? (mode === 'login' ? 'Logging in...' : 'Creating account...')
                            : (mode === 'login' ? 'Login' : 'Create Account')
                        }
                    </Button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-neutral-600">
                            {mode === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('signup'); setError(''); }}
                                        className="text-brand-600 font-medium hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('login'); setError(''); }}
                                        className="text-brand-600 font-medium hover:underline"
                                    >
                                        Login
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
