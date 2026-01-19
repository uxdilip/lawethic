'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { account } from '@lawethic/appwrite/client';
import { getUserRole } from '@lawethic/appwrite/auth';
import { UserRole } from '@lawethic/appwrite/types';
import { ChevronDown, LogOut } from 'lucide-react';
import ExpertSidebar from './ExpertSidebar';
import NotificationBell from '../NotificationBell';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

interface ExpertLayoutProps {
    children: React.ReactNode;
}

export default function ExpertLayout({ children }: ExpertLayoutProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState<UserRole>('customer');
    const [showUserMenu, setShowUserMenu] = useState(false);
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
            router.push('/expert/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <ExpertSidebar
                onCollapseChange={setSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div className={cn(
                "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "ml-16" : "ml-64"
            )}>
                {/* Top Header */}
                <header className="sticky top-0 z-20 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500">Expert Panel</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <NotificationBell />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-neutral-900">{userName}</p>
                                    <p className="text-xs text-neutral-500 capitalize">Expert</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-neutral-200 z-50 overflow-hidden">
                                    <div className="p-3 border-b border-neutral-100">
                                        <p className="text-sm font-medium text-neutral-900">{userName}</p>
                                        <p className="text-xs text-neutral-500 capitalize mt-0.5">Expert Account</p>
                                    </div>

                                    <div className="p-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
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
                    {children}
                </main>
            </div>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                expand={true}
                richColors
            />
        </div>
    );
}
