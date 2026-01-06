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
        id: 'tax-compliance',
        title: 'Tax & Compliance',
        href: '#',
        children: [
            {
                id: 'gst-services',
                title: 'GST Services',
                description: 'GST registration and return filing',
                icon: 'Receipt',
                href: '/services',
                services: [
                    {
                        slug: 'gst-registration',
                        title: 'GST Registration',
                        price: 399,
                        timeline: '2-5 days',
                        badge: '✓ Get GSTIN'
                    },
                    {
                        slug: 'gst-return-filing',
                        title: 'GST Return Filing',
                        price: 799,
                        timeline: 'Monthly/Quarterly',
                        badge: '✓ Stay Compliant'
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
                        price: 3599,
                        timeline: '7-15 days',
                        badge: '✓ Essential'
                    },
                    {
                        slug: 'fssai-registration',
                        title: 'FSSAI Food License',
                        price: 1299,
                        timeline: '7-10 days',
                        badge: '✓ Food Business'
                    },
                    {
                        slug: 'udyam-registration',
                        title: 'Udyam/MSME Registration',
                        price: 199,
                        timeline: '1-2 days',
                        badge: '✓ Free on Govt Portal'
                    },
                    {
                        slug: 'iec-registration',
                        title: 'IEC Import/Export Code',
                        price: 1699,
                        timeline: '2-5 days',
                        badge: '✓ Go Global'
                    }
                ]
            }
        ]
    }
]
