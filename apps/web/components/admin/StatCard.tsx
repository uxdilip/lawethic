'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    gradient?: string;
    onClick?: () => void;
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    gradient = 'from-brand-500 to-brand-600',
    onClick,
}: StatCardProps) {
    const TrendIcon = trend?.direction === 'up'
        ? TrendingUp
        : trend?.direction === 'down'
            ? TrendingDown
            : Minus;

    const trendColor = trend?.direction === 'up'
        ? 'text-success'
        : trend?.direction === 'down'
            ? 'text-error'
            : 'text-neutral-500';

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-white rounded-xl border border-neutral-200 p-6 transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                onClick && "cursor-pointer"
            )}
        >
            {/* Background Gradient (subtle) */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-gradient-to-br",
                gradient
            )} />

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-br transition-transform group-hover:scale-110",
                        gradient
                    )}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>

                    {trend && (
                        <div className="flex items-center gap-1 text-sm">
                            <TrendIcon className={cn("w-4 h-4", trendColor)} />
                            <span className={cn("font-medium", trendColor)}>
                                {trend.value > 0 ? '+' : ''}{trend.value}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-600">{title}</p>
                    <p className="text-3xl font-bold text-neutral-900">{value}</p>
                    {(subtitle || trend?.label) && (
                        <p className="text-sm text-neutral-500">
                            {subtitle || trend?.label}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
