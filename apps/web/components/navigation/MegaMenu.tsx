'use client'

import * as React from 'react'
import Link from 'next/link'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { NavigationParent } from '@/types/service'
import { MegaMenuContent } from './MegaMenuContent'
import { cn } from '@/lib/utils'

export function MegaMenu({ parentCategories }: { parentCategories: NavigationParent[] }) {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {parentCategories.map((parentCat) => (
                    <NavigationMenuItem key={parentCat.id}>
                        <NavigationMenuTrigger className="text-sm font-medium">
                            {parentCat.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <MegaMenuContent
                                parentCategory={parentCat}
                                subCategories={parentCat.children || []}
                            />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
