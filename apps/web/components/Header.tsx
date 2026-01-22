'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { account } from '@lawethic/appwrite';
import { LogOut, User } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { MegaMenu } from './navigation/MegaMenu';
import { MobileNav, MobileNavTrigger } from './navigation/MobileNav';
import { NavigationParent } from '@/types/service';

export default function Header({ navigationData }: { navigationData?: NavigationParent[] }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold text-brand-600">
                        <span className="font-playfair">LAW</span>
                        <span className="font-montserrat">ethic</span>
                    </Link>

                    {/* Desktop Navigation with Mega Menu */}
                    {navigationData && (
                        <div className="hidden lg:block">
                            <MegaMenu parentCategories={navigationData} />
                        </div>
                    )}
                </div>

                {/* Right side actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Consult Expert Button - Visible on larger screens */}
                    <Link
                        href="/consult-expert"
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-xs sm:text-sm font-medium hidden lg:block"
                    >
                        Consult Expert
                    </Link>

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
                                            href={
                                                user.prefs?.role === 'expert' ? '/expert/dashboard' :
                                                    user.prefs?.role === 'admin' || user.prefs?.role === 'operations' ? '/admin' :
                                                        '/dashboard'
                                            }
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
                            <Link href="/login" className="px-4 py-2 text-neutral-600 hover:text-brand-600 hidden lg:block">
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 border border-brand-600 text-brand-600 rounded-lg hover:bg-brand-50 hidden lg:block"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Trigger - Show on screens smaller than lg */}
                    {navigationData && (
                        <MobileNavTrigger onClick={() => setMobileNavOpen(true)} className="lg:hidden" />
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            {navigationData && (
                <MobileNav
                    parentCategories={navigationData}
                    isOpen={mobileNavOpen}
                    onClose={() => setMobileNavOpen(false)}
                />
            )}
        </header>
    );
}
