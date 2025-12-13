'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star } from 'lucide-react'
import { ServiceHero } from '@/types/service-content'
import { LeadCaptureForm } from '@/components/LeadCaptureForm'

interface HeroSectionProps {
    hero: ServiceHero
    service: string
    category: string
    onGetStarted: () => void
    onConsult: () => void
}

export function HeroSection({ hero, service, category, onGetStarted, onConsult }: HeroSectionProps) {
    return (
        <section className="relative min-h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[size:50px_50px]"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Badge */}
                        {hero.badge && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            >
                                <Badge className="bg-blue-500/20 text-white border-blue-400 mb-6">
                                    {hero.badge}
                                </Badge>
                            </motion.div>
                        )}

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                        >
                            {hero.title}
                        </motion.h1>

                        {/* Highlights */}
                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-3 mb-8"
                        >
                            {hero.highlights.map((highlight, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-lg">{highlight}</span>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Button
                                size="lg"
                                onClick={onGetStarted}
                                className="bg-white text-blue-900 hover:bg-gray-100 font-semibold px-8"
                            >
                                Get Started Now
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={onConsult}
                                className="border-white text-white hover:bg-white/10"
                            >
                                Consult Expert
                            </Button>
                        </motion.div>

                        {/* Trust Signals */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="flex flex-wrap gap-6 mt-8 text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span>{hero.trustSignals.rating}</span>
                            </div>
                            <div className="border-l border-white/30 pl-6">
                                <span className="font-semibold">{hero.trustSignals.served}</span>
                            </div>
                            {hero.trustSignals.certified && (
                                <div className="border-l border-white/30 pl-6">
                                    <span>{hero.trustSignals.certified}</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Right side - Lead Capture Form - Desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="hidden lg:block"
                    >
                        <LeadCaptureForm
                            service={service}
                            category={category}
                        />
                    </motion.div>
                </div>

                {/* Mobile Form - Below Hero Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="lg:hidden mt-8"
                >
                    <LeadCaptureForm
                        service={service}
                        category={category}
                    />
                </motion.div>
            </div>

            {/* Floating trust badge */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
            >
                <p className="text-sm text-white">
                    Trusted by <span className="font-bold">10,000+</span> businesses
                </p>
            </motion.div>
        </section>
    )
}
