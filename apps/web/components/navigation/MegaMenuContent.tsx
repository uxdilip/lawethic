'use client'

import { useState } from 'react'
import { NavigationParent, NavigationCategory } from '@/types/service'
import { SubCategoryList } from './SubCategoryList'
import { ServicesList } from './ServicesList'

interface MegaMenuContentProps {
    parentCategory: NavigationParent
    subCategories: NavigationCategory[]
    onClose?: () => void
}

export function MegaMenuContent({
    parentCategory,
    subCategories,
    onClose,
}: MegaMenuContentProps) {
    // Set first sub-category as default active
    const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
        subCategories[0]?.id || null
    )

    const activeSubCategoryData = subCategories.find(
        (sub) => sub.id === activeSubCategory
    )

    return (
        <div className="grid grid-cols-[250px_1fr] w-[850px] gap-6 p-6">
            {/* Left: Sub-categories */}
            <div className="border-r pr-4">
                <SubCategoryList
                    subCategories={subCategories}
                    activeSubCategory={activeSubCategory}
                    onSubCategoryHover={setActiveSubCategory}
                />
            </div>

            {/* Right: Services */}
            <div className="overflow-y-auto max-h-[500px]">
                {activeSubCategoryData ? (
                    <ServicesList
                        services={activeSubCategoryData.services}
                        subCategory={activeSubCategoryData}
                    />
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Select a category to view services</p>
                    </div>
                )}
            </div>
        </div>
    )
}
