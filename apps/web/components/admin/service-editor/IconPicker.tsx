'use client';

import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Common icons for the service editor
const COMMON_ICONS = [
    'User', 'Users', 'Building', 'Building2', 'Store', 'Briefcase',
    'FileText', 'File', 'Folder', 'FolderOpen', 'Check', 'CheckCircle',
    'Clock', 'Calendar', 'Shield', 'ShieldCheck', 'Lock', 'Unlock',
    'Star', 'Award', 'Trophy', 'Target', 'Zap', 'Rocket',
    'Globe', 'Map', 'MapPin', 'Home', 'Package', 'Box',
    'CreditCard', 'Wallet', 'DollarSign', 'IndianRupee', 'Percent',
    'Phone', 'Mail', 'MessageSquare', 'Send', 'Bell', 'BellRing',
    'Search', 'Settings', 'Cog', 'Wrench', 'Tool',
    'Heart', 'ThumbsUp', 'Smile', 'Frown',
    'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronDown',
    'Plus', 'Minus', 'X', 'AlertCircle', 'Info', 'HelpCircle',
    'Eye', 'EyeOff', 'Edit', 'Trash', 'Copy', 'Download', 'Upload',
    'Image', 'Video', 'Music', 'Camera',
    'Link', 'ExternalLink', 'Share', 'Bookmark',
    'Tag', 'Hash', 'AtSign', 'Code', 'Terminal',
    'Database', 'Server', 'Cloud', 'Wifi',
    'Landmark', 'Scale', 'Gavel', 'Receipt', 'Handshake',
    'Truck', 'Car', 'Plane', 'Train',
    'Sun', 'Moon', 'CloudSun', 'Umbrella',
    'Gift', 'ShoppingCart', 'ShoppingBag', 'Percent',
];

interface IconPickerProps {
    value?: string;
    onChange: (icon: string) => void;
    className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredIcons = useMemo(() => {
        if (!search) return COMMON_ICONS;
        return COMMON_ICONS.filter(icon =>
            icon.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const renderIcon = (iconName: string, size = 'h-5 w-5') => {
        // Lucide exports icons as named exports, we need to access them correctly
        const icons = LucideIcons as Record<string, unknown>;
        const IconComponent = icons[iconName] as React.ComponentType<{ className?: string }> | undefined;

        // Check if it's a valid React component (function)
        if (!IconComponent) {
            return <span className={`${size} inline-flex items-center justify-center text-xs text-neutral-400`}>?</span>;
        }

        try {
            return <IconComponent className={size} />;
        } catch {
            return <span className={`${size} inline-flex items-center justify-center text-xs text-neutral-400`}>?</span>;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn('w-full justify-start', className)}
                >
                    {value ? (
                        <>
                            {renderIcon(value)}
                            <span className="ml-2">{value}</span>
                        </>
                    ) : (
                        <span className="text-neutral-500">Select icon...</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-6 gap-1 p-3 max-h-64 overflow-y-auto">
                    {filteredIcons.map(iconName => (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                                onChange(iconName);
                                setOpen(false);
                                setSearch('');
                            }}
                            title={iconName}
                            className={cn(
                                'p-2 rounded hover:bg-neutral-100 flex items-center justify-center transition-colors',
                                value === iconName && 'bg-brand-100 text-brand-600'
                            )}
                        >
                            {renderIcon(iconName, 'h-4 w-4')}
                        </button>
                    ))}
                </div>
                {filteredIcons.length === 0 && (
                    <div className="p-4 text-center text-neutral-500 text-sm">
                        No icons found
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

export default IconPicker;
