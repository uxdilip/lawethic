import { NAVIGATION_STRUCTURE } from '@/data/navigation'
import { CATEGORIES } from '@/data/categories'
import { ServiceData, NavigationService, CategoryHubData } from '@/types/service'
import privateLimitedCompany from '@/data/services/company-registration/private-limited-company'

/**
 * Service Registry - Map service slugs to their data
 * Add new services here as you create them
 */
const SERVICE_REGISTRY: Record<string, ServiceData> = {
    'company-registration/private-limited-company': privateLimitedCompany,
    // Add more services here:
    // 'company-registration/llp': llpService,
    // 'gst-registration/gst-registration': gstService,
}

/**
 * Get navigation structure for mega menu (instant, no database call)
 */
export function getNavigationData() {
    return NAVIGATION_STRUCTURE
}

/**
 * Get all services across all categories
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
 * Get service data by category and slug
 */
export async function getServiceData(
    category: string,
    slug: string
): Promise<ServiceData | null> {
    const key = `${category}/${slug}`
    return SERVICE_REGISTRY[key] || null
}/**
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
 * Returns array of { category, slug } objects
 */
export function getAllServicePaths(): { category: string; slug: string }[] {
    const paths: { category: string; slug: string }[] = []

    NAVIGATION_STRUCTURE.forEach(parent => {
        parent.children?.forEach(category => {
            category.services?.forEach(service => {
                paths.push({
                    category: category.id,
                    slug: service.slug
                })
            })
        })
    })

    return paths
}
