'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Grid3X3, FileText, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerSidebarProps {
    collapsed: boolean;
    onCollapseChange: (collapsed: boolean) => void;
}

const sidebarItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        badge: null,
    },
    {
        id: 'services',
        label: 'Service Hub',
        icon: Grid3X3,
        href: '/dashboard/services',
        badge: null,
    },
    {
        id: 'orders',
        label: 'My Orders',
        icon: FileText,
        href: '/dashboard/orders',
        badge: null,
    },
    {
        id: 'consultations',
        label: 'Consultations',
        icon: MessageSquare,
        href: '/dashboard/consultations',
        badge: null,
    },
];

export default function CustomerSidebar({ collapsed, onCollapseChange }: CustomerSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

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
                    <Link href="/dashboard" className="text-2xl font-bold text-neutral-900">
                        <span className="font-playfair">LAW</span>
                        <span className="font-montserrat">ethic</span>
                    </Link>
                )}

                <button
                    onClick={() => onCollapseChange(!collapsed)}
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

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                active
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                                collapsed && "justify-center"
                            )}
                        >
                            {/* Active indicator */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-600 rounded-r-full" />
                            )}

                            <Icon className={cn(
                                "w-5 h-5 transition-transform group-hover:scale-110",
                                active ? "text-brand-600" : "text-neutral-400 group-hover:text-neutral-600",
                                collapsed && "mx-auto"
                            )} />

                            {!collapsed && (
                                <>
                                    <span className="flex-1 font-medium text-sm">{item.label}</span>
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
        </div>
    );
}
