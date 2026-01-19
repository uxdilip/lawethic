'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@lawethic/appwrite/client';
import { getUserRole } from '@lawethic/appwrite/auth';
import Link from 'next/link';
import { Scale, Loader2 } from 'lucide-react';

function ExpertLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/expert/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, login with email and password
            await account.createEmailPasswordSession(email, password);

            // Check if user has expert role
            const role = await getUserRole();

            if (role !== 'expert') {
                // Non-expert trying to access expert panel
                await account.deleteSession('current');
                setError('Access denied. This portal is only for registered experts/lawyers.');
                setLoading(false);
                return;
            }

            // Redirect to expert dashboard
            window.location.href = redirect === '/expert' ? '/expert/dashboard' : redirect;
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Scale className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Expert Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage your consultations
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="expert@lawethic.com"
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
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
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
                            className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                            Customer Login →
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>This portal is exclusively for LawEthic registered experts.</p>
                    <p className="mt-1">Contact admin if you need access.</p>
                </div>
            </div>
        </div>
    );
}

export default function ExpertLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        }>
            <ExpertLoginForm />
        </Suspense>
    );
}
