'use client';

import { useState } from 'react';
import Link from 'next/link';
import { account } from '@lawethic/appwrite';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
    onSuccess?: () => void;
    showSignupLink?: boolean;
}

export function LoginForm({ onSuccess, showSignupLink = true }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await account.createEmailPasswordSession(email, password);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </Button>
            </div>

            {showSignupLink && (
                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign up
                    </Link>
                </p>
            )}
        </form>
    );
}
