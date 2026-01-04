/**
 * JSON-LD Structured Data Components for SEO
 * These help Google understand your website better and show rich results
 */

// Organization Schema - Shows company info in search results
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LegalService',
        name: 'LAWethic',
        alternateName: 'LawEthic',
        url: 'https://lawethic.com',
        logo: 'https://lawethic.com/logo.png',
        description: 'India\'s trusted platform for business registration, trademark filing, FSSAI license, and compliance services. Expert legal professionals with 100% online process.',
        foundingDate: '2024',
        founders: [
            {
                '@type': 'Person',
                name: 'LAWethic Team',
            },
        ],
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
            addressRegion: 'India',
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: '+91-1234567890',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi'],
                areaServed: 'IN',
            },
        ],
        sameAs: [
            // Add your social media URLs here
            // 'https://www.facebook.com/lawethic',
            // 'https://www.linkedin.com/company/lawethic',
            // 'https://twitter.com/lawethic',
        ],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '500',
            bestRating: '5',
            worstRating: '1',
        },
        priceRange: '₹₹',
        areaServed: {
            '@type': 'Country',
            name: 'India',
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Business Registration & Compliance Services',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Trademark Registration',
                        description: 'Protect your brand with trademark registration in India',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'FSSAI License',
                        description: 'Food license registration for food businesses',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Trade License',
                        description: 'Municipal trade license for businesses',
                    },
                },
            ],
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Website Schema - Helps with sitelinks search box
export function WebsiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LAWethic',
        alternateName: 'LawEthic - Business Registration & Compliance',
        url: 'https://lawethic.com',
        description: 'India\'s trusted platform for business registration, trademark filing, and compliance services.',
        publisher: {
            '@type': 'Organization',
            name: 'LAWethic',
            logo: {
                '@type': 'ImageObject',
                url: 'https://lawethic.com/logo.png',
            },
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://lawethic.com/services?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Breadcrumb Schema - Shows breadcrumb navigation in search results
interface BreadcrumbItem {
    name: string
    url: string
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Service Schema - For individual service pages
interface ServiceSchemaProps {
    name: string
    description: string
    price: number
    url: string
    image?: string
    category: string
}

export function ServiceSchema({ name, description, price, url, image, category }: ServiceSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: name,
        name: name,
        description: description,
        provider: {
            '@type': 'LegalService',
            name: 'LAWethic',
            url: 'https://lawethic.com',
        },
        areaServed: {
            '@type': 'Country',
            name: 'India',
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: name,
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: name,
                    },
                    price: price,
                    priceCurrency: 'INR',
                    availability: 'https://schema.org/InStock',
                    url: url,
                },
            ],
        },
        category: category,
        ...(image && { image: image }),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// FAQ Schema - For FAQ sections on pages
interface FAQItem {
    question: string
    answer: string
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Local Business Schema (if you have physical office)
export function LocalBusinessSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LegalService',
        name: 'LAWethic',
        image: 'https://lawethic.com/logo.png',
        url: 'https://lawethic.com',
        telephone: '+91-8420562101',
        email: 'support@lawethic.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '29/13/A, Naskar Para Road, Haridevpur',
            addressLocality: 'Kolkata',
            addressRegion: 'West Bengal',
            postalCode: '700041',
            addressCountry: 'IN',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 0, // Add your latitude
            longitude: 0, // Add your longitude
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '18:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '10:00',
                closes: '14:00',
            },
        ],
        priceRange: '₹₹',
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
