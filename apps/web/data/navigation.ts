import { NavigationParent } from '@/types/service'

/**
 * Static navigation structure for mega menu
 * Using flat URL structure: /services/{service-slug}
 * 
 * Add new services by:
 * 1. Add the service data to /data/services/index.ts
 * 2. Add a link here in the appropriate category
 */
export const NAVIGATION_STRUCTURE: NavigationParent[] = [
    {
        id: 'trademark-ip',
        title: 'Trademark & IP',
        href: '#',
        children: [
            {
                id: 'trademark-registration',
                title: 'Trademark Registration',
                description: 'Protect your intellectual property',
                icon: 'Award',
                href: '/services',
                services: [
                    {
                        slug: 'trademark-registration',
                        title: 'Trademark Registration',
                        price: 4999,
                        timeline: '1-2 days filing',
                        badge: '✓ Brand Protection'
                    }
                ]
            }
        ]
    },
    {
        id: 'licenses-registrations',
        title: 'Licenses & Registrations',
        href: '#',
        children: [
            {
                id: 'licenses',
                title: 'Licenses & Registrations',
                description: 'Essential licenses for your business',
                icon: 'FileCheck',
                href: '/services',
                services: [
                    {
                        slug: 'trade-license',
                        title: 'Trade License',
                        price: 2499,
                        timeline: '7-12 days',
                        badge: '✓ Essential'
                    },
                    {
                        slug: 'fssai-registration',
                        title: 'FSSAI Food License',
                        price: 1999,
                        timeline: '5-7 days',
                        badge: '✓ Food Business'
                    },
                    {
                        slug: 'udyam-registration',
                        title: 'Udyam Registration',
                        price: 499,
                        timeline: '1-2 days',
                        badge: '✓ Free on Govt Portal'
                    },
                    {
                        slug: 'msme-registration',
                        title: 'MSME Registration',
                        price: 499,
                        timeline: '1-2 days',
                        badge: null
                    },
                    {
                        slug: 'iec-registration',
                        title: 'IEC Import/Export Code',
                        price: 1499,
                        timeline: '2-3 days',
                        badge: '✓ Go Global'
                    }
                ]
            }
        ]
    }
]
