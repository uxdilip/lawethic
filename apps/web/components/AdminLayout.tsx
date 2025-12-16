'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { account } from '@lawethic/appwrite/client';
import { getUserRole } from '@lawethic/appwrite/auth';
import { UserRole } from '@lawethic/appwrite/types';
import { Bell, ChevronDown, User } from 'lucide-react';
import AdminSidebar from './admin/AdminSidebar';
import CommandPalette from './admin/CommandPalette';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState<UserRole>('customer');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <AdminSidebar
                onCommandOpen={() => setCommandOpen(true)}
                onCollapseChange={setSidebarCollapsed}
            />

            {/* Main Content Area - responsive margin based on sidebar state */}
            <div className={cn(
                "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "ml-16" : "ml-64"
            )}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        {/* Page context will be added by individual pages */}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <Bell className="w-5 h-5 text-neutral-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-neutral-200 z-50 overflow-hidden">
                                    <div className="p-4 border-b border-neutral-100">
                                        <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <div className="p-8 text-center">
                                            <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                                            <p className="text-sm text-neutral-500">No new notifications</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-neutral-900">{userName}</p>
                                    <p className="text-xs text-neutral-500 capitalize">{userRole}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-neutral-200 z-50 overflow-hidden">
                                    <div className="p-3 border-b border-neutral-100">
                                        <p className="text-sm font-medium text-neutral-900">{userName}</p>
                                        <p className="text-xs text-neutral-500 capitalize mt-0.5">{userRole} Account</p>
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
                                            <span>Customer View</span>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error-light transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Command Palette */}
            <CommandPalette
                open={commandOpen}
                onOpenChange={setCommandOpen}
                onLogout={handleLogout}
            />

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                expand={true}
                richColors
            />
        </div>
    );
}
