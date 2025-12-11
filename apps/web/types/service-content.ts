export interface ServicePackage {
    name: string
    price: number
    originalPrice?: number
    discount?: string
    timeline: string
    popular?: boolean
    inclusions: string[]
    cta: string
    emiAvailable?: boolean
}

export interface ProcessStep {
    step: number
    title: string
    duration: string
    description: string
    icon?: string
}

export interface DocumentGroup {
    applicantType: string
    items: string[]
}

export interface ServiceType {
    name: string
    description: string
    icon?: string
}

export interface FAQ {
    question: string
    answer: string
}

export interface SocialProof {
    rating: number
    reviewCount: number
    totalServed: number
    tagline?: string
    logos?: string[]
    recentFilings?: RecentFiling[]
}

export interface RecentFiling {
    brandName: string
    applicantName: string
    city: string
    class?: string
    verified: boolean
}

export interface EducationContent {
    overview: string
    eligibility?: string[]
    benefits?: string[]
    types?: ServiceType[]
    postRegistration?: string
}

export interface ServiceContentBlocks {
    packages: ServicePackage[]
    process: ProcessStep[]
    documents: DocumentGroup[]
    education: EducationContent
    faqs: FAQ[]
    socialProof: SocialProof
    relatedServiceIds?: string[]
}

export interface ServiceHero {
    badge?: string
    title: string
    highlights: string[]
    trustSignals: {
        rating: string
        served: string
        certified?: string
    }
}

export interface ServiceDetail {
    $id: string
    slug: string
    category: string
    title: string
    shortDescription: string
    price: number

    hero: ServiceHero
    contentBlocks: ServiceContentBlocks

    // Existing
    questionForm?: any

    // SEO
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
}
