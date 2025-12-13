export interface Package {
    id: string
    name: string
    price: number
    timeline: string
    featured: boolean
    inclusions: string[]
    exclusions: string[]
}

export interface ProcessStep {
    step: number
    title: string
    description: string
    duration: string
}

export interface Document {
    title: string
    description: string
    applicableFor: string
}

export interface FAQ {
    question: string
    answer: string
}

export interface ServiceData {
    // Basic Info
    slug: string
    title: string
    category: string

    // Pricing
    basePrice: number
    timeline: string

    // SEO
    metaTitle: string
    metaDescription: string
    keywords: string[]

    // Hero Section
    hero: {
        badge: string | null
        title: string
        description: string
        highlights: string[]
    }

    // Packages
    packages: Package[]

    // Process Steps
    process: ProcessStep[]

    // Documents
    documents: {
        required: Document[]
        optional: Document[]
    }

    // FAQs
    faqs: FAQ[]
}

export interface NavigationService {
    slug: string
    title: string
    price: number
    timeline: string
    badge?: string | null
}

export interface NavigationCategory {
    id: string
    title: string
    description: string
    icon: string
    href: string
    services: NavigationService[]
}

export interface NavigationParent {
    id: string
    title: string
    href: string
    children: NavigationCategory[]
}

export interface CategoryHubData {
    slug: string
    title: string
    description: string

    hero: {
        title: string
        description: string
        image?: string
    }

    whyChoose: {
        title: string
        description: string
        icon: string
    }[]

    stats: {
        label: string
        value: string
    }[]

    faqs: FAQ[]
}
