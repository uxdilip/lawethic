'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { account } from '@lawethic/appwrite'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { Service } from '@/data/services'

// New section components
import {
    HeroSectionNew,
    StickyNav,
    StickyNavMobile,
    OverviewSection,
    EligibilitySection,
    TypesSection,
    FeesSection,
    DocumentsSection,
    ProcessSectionNew,
    BenefitsSection
} from '@/components/services/sections'
import { PackagesSection } from '@/components/services/PackagesSection'
import { FAQSection } from '@/components/services/FAQSection'

interface ServicePageClientProps {
    service: Service
}

export default function ServicePageClient({ service }: ServicePageClientProps) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const userData = await account.get()
            setUser(userData)
        } catch {
            setUser(null)
        } finally {
            setCheckingAuth(false)
        }
    }

    const handleGetStarted = () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }
        router.push(`/checkout?service=${service.slug}`)
    }

    const handleSelectPackage = (pkg: any) => {
        if (!user) {
            setShowAuthModal(true)
            return
        }
        router.push(`/checkout?service=${service.slug}&package=${pkg.id}`)
    }

    const handleAuthSuccess = async () => {
        await checkAuth()
        router.push(`/checkout?service=${service.slug}`)
    }

    // Build navigation items based on available sections
    const navItems: { id: string; label: string }[] = []

    if (service.overview) navItems.push({ id: 'overview', label: 'Overview' })
    if (service.eligibility) navItems.push({ id: 'eligibility', label: 'Who Can Apply' })
    if (service.types) navItems.push({ id: 'types', label: 'Types' })
    if (service.fees) navItems.push({ id: 'fees', label: 'Govt Fees' })
    if (service.documents && service.documents.groups && service.documents.groups.length > 0) navItems.push({ id: 'documents', label: 'Documents' })
    if (service.process && service.process.length > 0) navItems.push({ id: 'process', label: 'Process' })
    if (service.benefits) navItems.push({ id: 'why-us', label: 'Why LawEthic' })
    if (service.faqs && service.faqs.length > 0) navItems.push({ id: 'faqs', label: 'FAQs' })

    // Transform packages for PackagesSection component
    const transformedPackages = service.packages.map(pkg => ({
        name: pkg.name,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        discount: pkg.discount,
        timeline: pkg.timeline,
        popular: pkg.featured,
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        cta: pkg.featured ? 'Most Popular' : 'Get Started',
        emiAvailable: pkg.emiAvailable,
        id: pkg.id,
    }))

    return (
        <div className="min-h-screen bg-neutral-50/50">
            {/* Hero with Lead Form */}
            <HeroSectionNew service={service} />

            {/* Pricing Packages */}
            <div id="packages" className="bg-white">
                {service.packages.length > 0 && (
                    <PackagesSection
                        packages={transformedPackages}
                        onSelectPackage={(pkg) => {
                            const originalPkg = service.packages.find(p => p.name === pkg.name)
                            if (originalPkg) handleSelectPackage(originalPkg)
                        }}
                    />
                )}
            </div>

            {/* Main Content with Sticky Sidebar */}
            {navItems.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Mobile Nav */}
                    <div className="lg:hidden mb-8 sticky top-16 z-30 bg-neutral-50/95 backdrop-blur -mx-4 px-4 py-3">
                        <StickyNavMobile items={navItems} />
                    </div>

                    <div className="flex gap-8">
                        {/* Desktop Sticky Sidebar */}
                        <div className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <StickyNav items={navItems} />
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="flex-1 min-w-0 space-y-16">
                            {/* Overview */}
                            {service.overview && (
                                <OverviewSection data={service.overview} />
                            )}

                            {/* Eligibility */}
                            {service.eligibility && (
                                <EligibilitySection data={service.eligibility} />
                            )}

                            {/* Types */}
                            {service.types && (
                                <TypesSection data={service.types} />
                            )}

                            {/* Government Fees */}
                            {service.fees && (
                                <FeesSection data={service.fees} />
                            )}

                            {/* Documents */}
                            {service.documents && service.documents.groups && service.documents.groups.length > 0 && (
                                <DocumentsSection data={service.documents} />
                            )}

                            {/* Process */}
                            {service.process && service.process.length > 0 && (
                                <ProcessSectionNew
                                    title={`${service.shortTitle || service.title} Process`}
                                    steps={service.process}
                                />
                            )}

                            {/* Benefits / Why Us */}
                            {service.benefits && (
                                <BenefitsSection data={service.benefits} />
                            )}

                            {/* FAQs */}
                            {service.faqs && service.faqs.length > 0 && (
                                <section id="faqs" className="scroll-mt-28">
                                    <FAQSection faqs={service.faqs} />
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky CTA - Mobile only */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 lg:hidden"
            >
                <Button
                    onClick={handleGetStarted}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-semibold"
                    size="lg"
                >
                    Get Started Now - ₹{service.basePrice.toLocaleString()}
                </Button>
            </motion.div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
                defaultTab="signup"
            />
        </div>
    )
}
