'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@lawethic/appwrite/client';
import { getUserRole } from '@lawethic/appwrite/auth';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔐 Attempting login...');

            // First, login with email and password
            await account.createEmailPasswordSession(email, password);
            console.log('✅ Session created successfully');

            // Check if user has admin or operations role
            console.log('🔍 Checking user role...');
            const role = await getUserRole();
            console.log('📝 User role:', role);

            if (role === 'customer') {
                // Customer trying to access admin panel
                console.log('❌ Access denied - customer role');
                await account.deleteSession('current');
                setError('Access denied. You do not have permission to access the admin panel.');
                setLoading(false);
                return;
            }

            // Redirect to admin dashboard or original destination
            console.log('✅ Access granted, redirecting to:', redirect);

            // Use window.location for full page reload to ensure session cookie is sent
            window.location.href = redirect === '/admin' ? '/admin/dashboard' : redirect;
        } catch (err: any) {
            console.error('❌ Login failed:', err);
            setError(err.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to access the operations dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="admin@lawethic.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Customer Login →
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>For security reasons, only authorized staff can access this portal.</p>
                    <p className="mt-1">Contact your administrator if you need access.</p>
                </div>
            </div>
        </div>
    );
}
