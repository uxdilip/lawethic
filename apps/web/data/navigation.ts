import { NavigationParent } from '@/types/service'

/**
 * Static navigation structure for mega menu
 * This replaces database queries for instant navbar rendering
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
                href: '/services/company-registration',
                services: [
                    {
                        slug: 'private-limited-company',
                        title: 'Private Limited Company',
                        price: 999,
                        timeline: '14-21 days',
                        badge: '✓ Most Popular'
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
                href: '/services/gst-registration',
                services: [
                    {
                        slug: 'gst-registration',
                        title: 'GST Registration',
                        price: 999,
                        timeline: '3-5 days',
                        badge: null
                    },
                    {
                        slug: 'gst-return-filing',
                        title: 'GST Return Filing',
                        price: 499,
                        timeline: 'Same day',
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
                href: '/services/trademark-registration',
                services: [
                    {
                        slug: 'trademark-registration',
                        title: 'Trademark Registration',
                        price: 4999,
                        timeline: '45-60 days',
                        badge: null
                    }
                ]
            }
        ]
    },
    {
        id: 'licenses',
        title: 'Licenses & Registrations',
        href: '#',
        children: [
            {
                id: 'food-license',
                title: 'Food License',
                description: 'Get necessary business licenses',
                icon: 'ClipboardList',
                href: '/services/food-license',
                services: [
                    {
                        slug: 'fssai-license',
                        title: 'FSSAI License',
                        price: 1999,
                        timeline: '7-10 days',
                        badge: null
                    }
                ]
            }
        ]
    }
]
