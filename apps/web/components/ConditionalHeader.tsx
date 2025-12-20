'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import { getNavigationData } from '@/lib/services-static'

export function ConditionalHeader() {
    const pathname = usePathname()

    // WHITELIST approach: Only show public header on these specific public pages
    // This prevents the header from accidentally showing on new authenticated pages
    const publicPaths = [
        '/',           // Home
        '/services',   // Services listing and details
        '/about',      // About page
        '/contact',    // Contact page
        '/privacy',    // Privacy policy
        '/terms',      // Terms of service
        '/pricing',    // Pricing page
    ]

    // Check if current path is a public page
    const isPublicPage = publicPaths.some(path => {
        if (path === '/') {
            return pathname === '/'
        }
        // Match exact path or any sub-path (e.g., /services/fssai-registration)
        return pathname === path || pathname?.startsWith(`${path}/`)
    })

    if (!isPublicPage) {
        return null
    }

    // Get navigation data instantly from static file (no loading state needed!)
    const navData = getNavigationData()

    return <Header navigationData={navData} />
}
