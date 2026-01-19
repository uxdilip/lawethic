'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Settings,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    onCommandOpen?: () => void;
    onCollapseChange?: (collapsed: boolean) => void;
}

export default function ExpertSidebar({ onCommandOpen, onCollapseChange }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);
        onCollapseChange?.(newCollapsed);
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/expert/dashboard',
            icon: LayoutDashboard,
            badge: null,
        },
        {
            name: 'Consultations',
            href: '/expert/consultations',
            icon: MessageSquare,
            badge: null,
        },
    ];

    return (
        <div
            className={cn(
                "fixed left-0 top-0 h-screen bg-white border-r border-neutral-200 flex flex-col transition-all duration-300 ease-in-out z-30",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
                {!collapsed && (
                    <Link href="/expert/dashboard" className="text-2xl font-bold text-neutral-900">
                        <span className="font-playfair">LAW</span>
                        <span className="font-montserrat text-brand-600">expert</span>
                    </Link>
                )}

                <button
                    onClick={toggleCollapse}
                    className={cn(
                        "p-1.5 rounded-lg hover:bg-neutral-100 transition-colors",
                        collapsed && "mx-auto"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-neutral-600" />
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="p-3">
                <button
                    onClick={onCommandOpen}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <Search className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
                    {!collapsed && (
                        <>
                            <span className="text-sm text-neutral-400 flex-1 text-left">Search...</span>
                            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 bg-neutral-50 px-1.5 font-mono text-[10px] font-medium text-neutral-600">
                                ⌘K
                            </kbd>
                        </>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                                collapsed && "justify-center"
                            )}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-600 rounded-r-full" />
                            )}

                            <Icon className={cn(
                                "w-5 h-5 transition-transform group-hover:scale-110",
                                isActive ? "text-brand-600" : "text-neutral-400 group-hover:text-neutral-600",
                                collapsed && "mx-auto"
                            )} />

                            {!collapsed && (
                                <>
                                    <span className="flex-1 font-medium text-sm">{item.name}</span>
                                    {item.badge && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings Section */}
            <div className="p-3 border-t border-neutral-200 space-y-1">
                <Link
                    href="/expert/settings"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors",
                        collapsed && "justify-center"
                    )}
                >
                    <Settings className="w-5 h-5 text-neutral-400" />
                    {!collapsed && <span className="font-medium text-sm">Settings</span>}
                </Link>
            </div>
        </div>
    );
}
