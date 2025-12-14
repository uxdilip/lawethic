'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import { getNavigationData } from '@/lib/services-static'

export function ConditionalHeader() {
    const pathname = usePathname()

    // Don't show header on admin pages or login/signup pages
    const shouldShowHeader = !pathname?.startsWith('/admin') &&
        !pathname?.startsWith('/login') &&
        !pathname?.startsWith('/signup')

    if (!shouldShowHeader) {
        return null
    }

    // Get navigation data instantly from static file (no loading state needed!)
    const navData = getNavigationData()

    return <Header navigationData={navData} />
}
