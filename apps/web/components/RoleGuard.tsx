'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@lawethic/appwrite/auth';
import { UserRole } from '@lawethic/appwrite/types';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, fallback, redirectTo = '/admin/login' }: RoleGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        checkRole();
    }, []);

    const checkRole = async () => {
        try {
            const role = await getUserRole();
            setUserRole(role);

            if (allowedRoles.includes(role)) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                if (redirectTo) {
                    router.push(redirectTo);
                }
            }
        } catch (error) {
            console.error('Role check failed:', error);
            setIsAuthorized(false);
            if (redirectTo) {
                router.push(redirectTo);
            }
        }
    };

    // Loading state
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Unauthorized
    if (!isAuthorized) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
                    <p className="mt-2 text-gray-600">
                        You don't have permission to access this page.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Current role: {userRole || 'Unknown'}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // Authorized
    return <>{children}</>;
}

// Convenience components
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <RoleGuard allowedRoles={['admin']} fallback={fallback}>{children}</RoleGuard>;
}

export function StaffOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <RoleGuard allowedRoles={['admin', 'operations']} fallback={fallback}>{children}</RoleGuard>;
}
