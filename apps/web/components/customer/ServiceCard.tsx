'use client';

import { Service } from '@/data/services';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
    service: Service;
    onViewDetails: () => void;
}

export default function ServiceCard({ service, onViewDetails }: ServiceCardProps) {
    const hasDiscount = service.packages[0]?.originalPrice && service.packages[0]?.originalPrice > service.basePrice;
    const discountPercent = hasDiscount
        ? Math.round((1 - service.basePrice / (service.packages[0]?.originalPrice || service.basePrice)) * 100)
        : 0;

    return (
        <div
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden flex flex-col"
            onClick={onViewDetails}
        >
            {/* Card Header with Badge */}
            <div className="p-4 pb-3 flex-1">
                {/* Badge */}
                {service.badge && (
                    <Badge
                        variant="secondary"
                        className={cn(
                            "mb-3 text-xs font-medium",
                            service.badge === 'Most Popular'
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : service.badge === 'New'
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                        )}
                    >
                        {service.badge}
                    </Badge>
                )}

                {/* Title */}
                <h3 className="font-semibold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {service.shortTitle || service.title}
                </h3>

                {/* Timeline */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.timeline}</span>
                </div>
            </div>

            {/* Pricing & CTA */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-900">
                                ₹{service.basePrice.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
                                    ₹{service.packages[0]?.originalPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {discountPercent > 0 && (
                            <span className="text-xs font-medium text-green-600">
                                Save {discountPercent}%
                            </span>
                        )}
                    </div>

                    <button
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:gap-2 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails();
                        }}
                    >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
