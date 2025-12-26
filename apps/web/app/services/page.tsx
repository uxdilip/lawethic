import Link from 'next/link'
import { Metadata } from 'next'
import { getAllServices, getServicesByCategory, Service } from '@/data/services'
import { ArrowRight, CheckCircle, Clock, Star, Building2, FileText, Award, BadgeCheck } from 'lucide-react'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: 'All Services | LawEthic',
    description: 'Browse all business registration, tax compliance, and legal services. Expert assistance with transparent pricing.',
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
    'trademark-registration': <Award className="h-5 w-5" />,
    'licenses-registrations': <BadgeCheck className="h-5 w-5" />,
}

export default function ServicesPage() {
    const allServices = getAllServices()

    // Group by category
    const servicesByCategory = allServices.reduce((acc, service) => {
        if (!acc[service.category]) {
            acc[service.category] = []
        }
        acc[service.category].push(service)
        return acc
    }, {} as Record<string, Service[]>)

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white py-16 px-4">
                <div className="container mx-auto text-center max-w-3xl">
                    <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                    <p className="text-xl text-brand-100">
                        Professional compliance services handled by experienced CA/CS professionals
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-sm text-brand-100">
                        <span className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            4.5/5 Rating
                        </span>
                        <span className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4" />
                            50,000+ Customers
                        </span>
                    </div>
                </div>
            </section>

            {/* Services by Category */}
            <section className="container mx-auto px-4 py-12">
                {Object.entries(servicesByCategory).map(([category, services]) => (
                    <div key={category} className="mb-12">
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                                {categoryIcons[services[0]?.categorySlug] || <Building2 className="h-5 w-5" />}
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900">{category}</h2>
                        </div>

                        {/* Services Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <Link
                                    key={service.slug}
                                    href={`/services/${service.slug}`}
                                    className="group bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:border-brand-200 transition-all"
                                >
                                    {/* Badge */}
                                    {service.badge && (
                                        <span className="inline-block px-2.5 py-1 bg-brand-50 text-brand-600 text-xs font-medium rounded-full mb-3">
                                            {service.badge}
                                        </span>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-brand-600 transition-colors">
                                        {service.shortTitle || service.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                                        {service.hero.description}
                                    </p>

                                    {/* Price & Timeline */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-2xl font-bold text-brand-600">₹{service.basePrice.toLocaleString()}</span>
                                            <span className="text-neutral-500 text-sm ml-1">onwards</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-neutral-500 text-sm">
                                            <Clock className="h-4 w-4" />
                                            {service.timeline}
                                        </div>
                                    </div>

                                    {/* Features Preview */}
                                    <ul className="space-y-1.5 mb-4">
                                        {service.hero.highlights.slice(0, 3).map((highlight, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-1">{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="flex items-center text-brand-600 text-sm font-medium group-hover:gap-2 transition-all">
                                        <span>Learn More</span>
                                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}
