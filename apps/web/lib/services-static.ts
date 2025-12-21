/**
 * DEPRECATED: Use @/data/services instead
 * 
 * This file is kept for backward compatibility.
 * All new code should import from @/data/services
 * 
 * Example:
 * import { getServiceBySlug, getAllServices } from '@/data/services'
 */

import { NAVIGATION_STRUCTURE } from '@/data/navigation'
import { CATEGORIES } from '@/data/categories'
import { NavigationService, CategoryHubData } from '@/types/service'
import {
    getServiceBySlug as getServiceBySlugNew,
    getAllServices as getAllServicesNew,
    getAllServiceSlugs,
    Service
} from '@/data/services'

/**
 * Get navigation structure for mega menu (instant, no database call)
 */
export function getNavigationData() {
    return NAVIGATION_STRUCTURE
}

/**
 * Get all services across all categories
 * @deprecated Use getAllServices from @/data/services instead
 */
export function getAllServices(): NavigationService[] {
    const services: NavigationService[] = []

    NAVIGATION_STRUCTURE.forEach(parent => {
        parent.children?.forEach(category => {
            category.services?.forEach(service => {
                services.push(service)
            })
        })
    })

    return services
}

/**
 * Get service data by slug (new flat structure)
 * @deprecated Use getServiceBySlug from @/data/services instead
 */
export function getServiceBySlug(slug: string): Service | undefined {
    return getServiceBySlugNew(slug)
}

/**
 * Get service data by category and slug (legacy support)
 * @deprecated Use getServiceBySlug from @/data/services instead
 */
export async function getServiceData(
    category: string,
    slug: string
): Promise<Service | null> {
    // Try flat slug first (new structure)
    let service = getServiceBySlugNew(slug)
    if (service) return service

    // Try with category prefix for backward compatibility
    const fullSlug = `${slug}-${category}`.replace(/-+/g, '-')
    service = getServiceBySlugNew(fullSlug)
    if (service) return service

    // Not found
    return null
}

/**
 * Get all services in a specific category
 */
export function getServicesForCategory(categorySlug: string): NavigationService[] {
    const services: NavigationService[] = []

    NAVIGATION_STRUCTURE.forEach(parent => {
        const category = parent.children?.find(c => c.id === categorySlug)
        if (category?.services) {
            services.push(...category.services)
        }
    })

    return services
}

/**
 * Get category hub data
 */
export function getCategoryData(slug: string): CategoryHubData | null {
    return CATEGORIES[slug] || null
}

/**
 * Get all available category slugs (for static generation)
 */
export function getAllCategorySlugs(): string[] {
    return Object.keys(CATEGORIES)
}

/**
 * Get all service paths for static generation
 * @deprecated Use getAllServiceSlugs from @/data/services instead
 */
export function getAllServicePaths(): { category: string; slug: string }[] {
    // For backward compatibility, return in old format
    const services = getAllServicesNew()
    return services.map(s => ({
        category: s.categorySlug,
        slug: s.slug
    }))
}
