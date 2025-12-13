'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Building2, FileText, Award, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavigationCategory } from '@/types/service'

interface SubCategoryListProps {
    subCategories: NavigationCategory[]
    activeSubCategory: string | null
    onSubCategoryHover: (slug: string) => void
}

// Icon map for rendering Lucide icons
const ICON_MAP: Record<string, any> = {
    'Building2': Building2,
    'FileText': FileText,
    'Award': Award,
    'ClipboardList': ClipboardList,
}

export function SubCategoryList({
    subCategories,
    activeSubCategory,
    onSubCategoryHover,
}: SubCategoryListProps) {
    return (
        <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 px-3">
                CATEGORIES
            </h4>
            {subCategories.map((subCat) => {
                const IconComponent = subCat.icon ? ICON_MAP[subCat.icon] : null

                return (
                    <button
                        key={subCat.id}
                        onMouseEnter={() => onSubCategoryHover(subCat.id)}
                        className={cn(
                            'flex items-center justify-between w-full px-3 py-2.5',
                            'rounded-lg transition-all duration-200',
                            'hover:bg-accent hover:text-accent-foreground',
                            'text-sm font-medium',
                            activeSubCategory === subCat.id &&
                            'bg-accent text-accent-foreground'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {IconComponent && (
                                <IconComponent className="h-4 w-4" />
                            )}
                            <span>{subCat.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                )
            })}
        </div>
    )
}
