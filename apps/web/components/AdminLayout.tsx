'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { account } from '@lawethic/appwrite/client';
import { getUserRole } from '@lawethic/appwrite/auth';
import { UserRole } from '@lawethic/appwrite/types';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState<UserRole>('customer');
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await account.get();
            const role = await getUserRole();
            setUserName(user.name || user.email);
            setUserRole(role);
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Cases', href: '/admin/cases', icon: '📋' },
        { name: 'Customers', href: '/admin/customers', icon: '👥' },
        { name: 'Services', href: '/admin/services', icon: '⚙️' },
    ];

    if (userRole === 'admin') {
        navigation.push(
            { name: 'Team', href: '/admin/team', icon: '👨‍💼' },
            { name: 'Analytics', href: '/admin/analytics', icon: '📈' }
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600">
                                    LawEthic Admin
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => {
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'border-blue-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                }`}
                                        >
                                            <span className="mr-2">{item.icon}</span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-medium">
                                                {userName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-gray-700">
                                            {userName}
                                        </span>
                                        <svg className="ml-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                {showUserMenu && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                                            Role: <span className="font-medium capitalize">{userRole}</span>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Customer View
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="sm:hidden bg-white border-b border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="py-6">
                {children}
            </main>
        </div>
    );
}
