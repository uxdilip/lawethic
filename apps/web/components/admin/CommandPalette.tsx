'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    Search,
    LayoutDashboard,
    FolderKanban,
    Users,
    FileText,
    Settings,
    LogOut,
    Home,
    ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogout?: () => void;
}

export default function CommandPalette({ open, onOpenChange, onLogout }: CommandPaletteProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    const navigate = useCallback((href: string) => {
        router.push(href);
        onOpenChange(false);
    }, [router, onOpenChange]);

    const commands = [
        {
            group: 'Navigation',
            items: [
                {
                    title: 'Dashboard',
                    icon: LayoutDashboard,
                    action: () => navigate('/admin/dashboard'),
                    keywords: ['home', 'overview', 'stats'],
                },
                {
                    title: 'All Cases',
                    icon: FolderKanban,
                    action: () => navigate('/admin/cases'),
                    keywords: ['orders', 'cases', 'clients'],
                },
                {
                    title: 'Leads',
                    icon: Users,
                    action: () => navigate('/admin/leads'),
                    keywords: ['prospects', 'leads', 'new'],
                },
                {
                    title: 'Settings',
                    icon: Settings,
                    action: () => navigate('/admin/settings'),
                    keywords: ['config', 'preferences'],
                },
            ],
        },
        {
            group: 'Quick Actions',
            items: [
                {
                    title: 'Customer View',
                    icon: Home,
                    action: () => navigate('/dashboard'),
                    keywords: ['customer', 'user', 'client'],
                },
                {
                    title: 'Sign Out',
                    icon: LogOut,
                    action: () => {
                        onOpenChange(false);
                        onLogout?.();
                    },
                    keywords: ['logout', 'exit', 'quit'],
                },
            ],
        },
    ];

    return (
        <Command.Dialog
            open={open}
            onOpenChange={onOpenChange}
            label="Command Menu"
            className="fixed inset-0 z-50"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* Command Panel */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
                <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="w-full bg-white border border-neutral-200 rounded-t-xl px-4 py-4 text-sm outline-none placeholder:text-neutral-400 shadow-2xl"
                />

                <Command.List className="max-h-96 overflow-y-auto bg-white rounded-b-xl border border-t-0 border-neutral-200 shadow-2xl">
                    <Command.Empty className="px-4 py-8 text-center text-sm text-neutral-500">
                        No results found.
                    </Command.Empty>

                    {commands.map((group) => (
                        <Command.Group
                            key={group.group}
                            heading={group.group}
                            className="px-2 py-2"
                        >
                            <div className="px-2 py-1.5 text-xs font-medium text-neutral-500">
                                {group.group}
                            </div>

                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Command.Item
                                        key={item.title}
                                        onSelect={item.action}
                                        keywords={item.keywords}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                                            "data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-700",
                                            "hover:bg-neutral-50"
                                        )}
                                    >
                                        <Icon className="w-4 h-4 text-neutral-400" />
                                        <span className="flex-1 text-sm font-medium">{item.title}</span>
                                        <ArrowRight className="w-3 h-3 text-neutral-400 opacity-0 group-data-[selected=true]:opacity-100" />
                                    </Command.Item>
                                );
                            })}
                        </Command.Group>
                    ))}
                </Command.List>
            </div>
        </Command.Dialog>
    );
}
