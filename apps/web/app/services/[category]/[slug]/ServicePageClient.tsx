'use client'

import { useRouter } from 'next/navigation'
import { ServiceDetail } from '@/types/service-content'
import { HeroSection } from '@/components/services/HeroSection'
import { PackagesSection } from '@/components/services/PackagesSection'
import { ProcessSteps } from '@/components/services/ProcessSteps'
import { DocumentsChecklist } from '@/components/services/DocumentsChecklist'
import { FAQSection } from '@/components/services/FAQSection'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ServicePageClientProps {
    service: ServiceDetail
}

export function ServicePageClient({ service }: ServicePageClientProps) {
    const router = useRouter()

    const handleGetStarted = () => {
        router.push(`/checkout?serviceId=${service.$id}`)
    }

    const handleConsult = () => {
        // TODO: Open chat or schedule consultation
        // For now, you can redirect to a contact page or open a modal
        alert('Opening consultation chat... (To be implemented)')
    }

    const handleSelectPackage = (pkg: any) => {
        router.push(`/checkout?serviceId=${service.$id}&package=${pkg.name}`)
    }

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <HeroSection
                hero={service.hero}
                onGetStarted={handleGetStarted}
                onConsult={handleConsult}
            />

            {/* Packages */}
            {service.contentBlocks.packages && service.contentBlocks.packages.length > 0 && (
                <PackagesSection
                    packages={service.contentBlocks.packages}
                    onSelectPackage={handleSelectPackage}
                />
            )}

            {/* Process */}
            {service.contentBlocks.process && service.contentBlocks.process.length > 0 && (
                <ProcessSteps steps={service.contentBlocks.process} />
            )}

            {/* Documents */}
            {service.contentBlocks.documents && service.contentBlocks.documents.length > 0 && (
                <DocumentsChecklist documents={service.contentBlocks.documents} />
            )}

            {/* FAQs */}
            {service.contentBlocks.faqs && service.contentBlocks.faqs.length > 0 && (
                <FAQSection faqs={service.contentBlocks.faqs} />
            )}

            {/* Sticky CTA - Mobile only */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 md:hidden"
            >
                <Button
                    onClick={handleGetStarted}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
                    size="lg"
                >
                    Get Started Now - ₹{service.price.toLocaleString()}
                </Button>
            </motion.div>
        </div>
    )
}
