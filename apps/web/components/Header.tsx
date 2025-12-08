'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { account } from '@lawethic/appwrite';
import { LogOut, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await account.get();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    LawEthic
                </Link>

                <nav className="hidden md:flex space-x-6">
                    <Link href="/services" className="text-gray-600 hover:text-blue-600">
                        Services
                    </Link>
                    {user && (
                        <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                            Dashboard
                        </Link>
                    )}
                    <Link href="/about" className="text-gray-600 hover:text-blue-600">
                        About
                    </Link>
                    <Link href="/contact" className="text-gray-600 hover:text-blue-600">
                        Contact
                    </Link>
                </nav>

                <div className="flex items-center space-x-4">
                    {loading ? (
                        <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : user ? (
                        <>
                            {/* Notification Bell */}
                            <NotificationBell />

                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">{user.name || 'User'}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600">
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
