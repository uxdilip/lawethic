'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@lawethic/appwrite';
import { Suspense } from 'react';

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the current user after OAuth redirect
                const user = await account.get();

                // Check if user already has role set
                if (!user.prefs?.role) {
                    // New user - set default role as customer
                    await account.updatePrefs({
                        role: 'customer',
                        fullName: user.name || '',
                    });
                }

                // Get redirect URL from localStorage or default to dashboard
                const redirectUrl = localStorage.getItem('oauth_redirect') || '/dashboard';
                localStorage.removeItem('oauth_redirect');

                router.push(redirectUrl);
            } catch (err: any) {
                console.error('OAuth callback error:', err);
                setError(err.message || 'Authentication failed. Please try again.');

                // Redirect to login after a delay
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        };

        handleCallback();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
                <p className="text-gray-600 mt-2">Please wait while we set up your account.</p>
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    );
}
