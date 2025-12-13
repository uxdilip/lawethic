import { serverDatabases } from '@lawethic/appwrite/server'
import { appwriteConfig } from '@lawethic/appwrite/config'
import { Query } from 'node-appwrite'
import {
    NavigationCategory,
    NavigationService,
    SubCategoryWithServices,
    ParentCategoryNav,
    MegaMenuData,
} from '@/types/navigation'

/**
 * Fetch all navigation data for mega menu
 * This should be called server-side in layout or cached client-side
 */
export async function getNavigationData(): Promise<MegaMenuData> {
    try {
        // Fetch all categories (we'll filter client-side to avoid Query issues)
        const categoriesResponse = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.categories,
            [Query.orderAsc('navOrder')]
        )

        const allCategories = categoriesResponse.documents as unknown as NavigationCategory[]

        // Separate parent categories (no parentSlug) from sub-categories
        // Only parent categories with showInNav should appear in top-level menu
        const parentCategories = allCategories.filter((cat) => !cat.parentSlug && cat.showInNav)
        const subCategories = allCategories.filter((cat) => cat.parentSlug)

        // Build navigation structure
        const parentCategoriesNav: ParentCategoryNav[] = await Promise.all(
            parentCategories.map(async (parent) => {
                // Get sub-categories for this parent
                const parentSubs = subCategories.filter(
                    (sub) => sub.parentSlug === parent.slug
                )

                // For each sub-category, fetch its services
                const subCategoriesWithServices: SubCategoryWithServices[] =
                    await Promise.all(
                        parentSubs.map(async (subCat) => {
                            const servicesResponse =
                                await serverDatabases.listDocuments(
                                    appwriteConfig.databaseId,
                                    appwriteConfig.collections.services,
                                    [
                                        Query.equal('category', subCat.slug),
                                        Query.equal('showInMegaMenu', true),
                                        Query.orderAsc('megaMenuOrder'),
                                        Query.limit(10), // Limit services shown in mega menu
                                    ]
                                )

                            return {
                                category: subCat,
                                services: servicesResponse.documents as unknown as NavigationService[],
                            }
                        })
                    )

                return {
                    category: parent,
                    subCategories: subCategoriesWithServices,
                }
            })
        )

        return {
            parentCategories: parentCategoriesNav,
        }
    } catch (error) {
        console.error('Error fetching navigation data:', error)
        return {
            parentCategories: [],
        }
    }
}

/**
 * Get services for a specific category (for dynamic loading)
 */
export async function getServicesForCategory(
    categorySlug: string
): Promise<NavigationService[]> {
    try {
        const response = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.services,
            [
                Query.equal('category', categorySlug),
                Query.equal('showInMegaMenu', true),
                Query.orderAsc('megaMenuOrder'),
            ]
        )

        return response.documents as unknown as NavigationService[]
    } catch (error) {
        console.error('Error fetching services:', error)
        return []
    }
}
