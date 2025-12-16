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
        id: 'business-registration',
        title: 'Business Registration',
        href: '#',
        children: [
            {
                id: 'company-registration',
                title: 'Company Registration',
                description: 'Register your company online',
                icon: 'Building2',
                href: '/services',
                services: [
                    {
                        slug: 'private-limited-company-registration',
                        title: 'Private Limited Company',
                        price: 999,
                        timeline: '14-21 days',
                        badge: '✓ Most Popular'
                    },
                    {
                        slug: 'llp-registration',
                        title: 'LLP Registration',
                        price: 1999,
                        timeline: '10-15 days',
                        badge: null
                    },
                    {
                        slug: 'one-person-company-registration',
                        title: 'One Person Company (OPC)',
                        price: 1499,
                        timeline: '10-15 days',
                        badge: '✓ For Solo Founders'
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
                id: 'gst-registration',
                title: 'GST Registration',
                description: 'Register for GST and stay compliant',
                icon: 'FileText',
                href: '/services',
                services: [
                    {
                        slug: 'gst-registration',
                        title: 'GST Registration',
                        price: 999,
                        timeline: '3-5 days',
                        badge: null
                    }
                ]
            }
        ]
    },
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
                id: 'msme-licenses',
                title: 'MSME & Business Licenses',
                description: 'Essential licenses for your business',
                icon: 'FileCheck',
                href: '/services',
                services: [
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
                        slug: 'fssai-registration',
                        title: 'FSSAI Food License',
                        price: 1999,
                        timeline: '5-7 days',
                        badge: '✓ Food Business'
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
