'use client'

import { Service } from '@/data/services'
import { Shield, Clock, Users, Star, ChevronRight } from 'lucide-react'
import { LeadCaptureForm } from './LeadCaptureForm'

interface HeroSectionNewProps {
    service: Service
}

export function HeroSectionNew({ service }: HeroSectionNewProps) {
    const startsAt = service.packages?.[0]?.price

    return (
        <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-50/30 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-50">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100 rounded-full filter blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-50 rounded-full filter blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left Content */}
                    <div className="space-y-6">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm">
                            <a href="/" className="text-neutral-500 hover:text-brand-600 transition-colors">Home</a>
                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                            <a href="/services" className="text-neutral-500 hover:text-brand-600 transition-colors">Services</a>
                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                            <span className="text-brand-600 font-medium">{service.title}</span>
                        </nav>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                                {service.title}
                            </h1>
                            <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
                                {service.hero.description}
                            </p>
                        </div>

                        {/* Price Indicator */}
                        {startsAt && (
                            <div className="inline-flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-sm border border-neutral-200">
                                <div>
                                    <p className="text-sm text-neutral-500">Starts at</p>
                                    <p className="text-2xl font-bold text-brand-600">
                                        ₹{startsAt.toLocaleString('en-IN')}
                                        <span className="text-sm font-normal text-neutral-500"> + taxes</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Trust Signals */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <span>100% Secure</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <span>Quick Processing</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-4 w-4 text-purple-600" />
                                </div>
                                <span>Expert Support</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-4 border-t border-neutral-200">
                            <div className="flex flex-wrap gap-8">
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900">10,000+</p>
                                    <p className="text-sm text-neutral-500">Registrations Done</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900">4.8/5</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        <span className="text-sm text-neutral-500">Rating</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900">7-10</p>
                                    <p className="text-sm text-neutral-500">Working Days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Lead Form */}
                    <div className="lg:pl-8">
                        <LeadCaptureForm
                            serviceSlug={service.slug}
                            serviceName={service.title}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
