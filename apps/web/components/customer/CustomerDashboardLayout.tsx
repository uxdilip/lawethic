'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { account } from '@lawethic/appwrite/client';
import { ChevronDown, LogOut, User } from 'lucide-react';
import CustomerSidebar from './CustomerSidebar';
import NotificationBell from '../NotificationBell';
import { cn } from '@/lib/utils';

interface CustomerDashboardLayoutProps {
    children: React.ReactNode;
}

export default function CustomerDashboardLayout({ children }: CustomerDashboardLayoutProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await account.get();
            setUserName(user.name || user.email.split('@')[0]);
            setUserEmail(user.email);
        } catch (error) {
            // Not logged in, redirect to login
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <CustomerSidebar
                collapsed={sidebarCollapsed}
                onCollapseChange={setSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "ml-16" : "ml-64"
                )}
            >
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        {/* Page breadcrumb or context - will be set by individual pages */}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications - Using real NotificationBell component */}
                        <NotificationBell />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-neutral-900">{userName}</p>
                                    <p className="text-xs text-neutral-500">Customer</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-neutral-200 z-50 overflow-hidden">
                                        <div className="p-3 border-b border-neutral-100">
                                            <p className="text-sm font-medium text-neutral-900">{userName}</p>
                                            <p className="text-xs text-neutral-500 truncate mt-0.5">{userEmail}</p>
                                        </div>

                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    router.push('/dashboard');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                            >
                                                <User className="w-4 h-4 text-neutral-400" />
                                                <span>My Profile</span>
                                            </button>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error-light transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
