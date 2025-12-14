'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { NavigationService, NavigationCategory } from '@/types/service'

interface ServicesListProps {
    services: NavigationService[]
    subCategory: NavigationCategory
}

export function ServicesList({ services, subCategory }: ServicesListProps) {
    if (services.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No services available</p>
            </div>
        )
    }

    return (
        <motion.div
            key={subCategory.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-base">{subCategory.title}</h4>
                <Link
                    href={subCategory.href}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View All
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Services List - Simple */}
            <div className="space-y-1">
                {services.map((service, i) => (
                    <motion.div
                        key={service.slug}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                        <Link
                            href={`${subCategory.href}/${service.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
                        >
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {service.title}
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* View All Link (bottom) */}
            {services.length >= 6 && (
                <Link
                    href={subCategory.href}
                    className="block text-center py-2 text-sm text-primary hover:underline font-medium"
                >
                    View all {subCategory.title} services →
                </Link>
            )}
        </motion.div>
    )
}
