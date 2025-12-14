'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkles } from 'lucide-react'
import { ServicePackage } from '@/types/service-content'
import { useState } from 'react'

interface PackagesSectionProps {
    packages: ServicePackage[]
    onSelectPackage: (pkg: ServicePackage) => void
}

export function PackagesSection({ packages, onSelectPackage }: PackagesSectionProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold mb-4">Right Plan for Your Business</h2>
                    <p className="text-gray-600 text-lg">
                        Choose the package that best fits your needs
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={pkg.name}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                        >
                            <Card
                                className={`relative p-8 h-full transition-all duration-300 ${pkg.popular
                                        ? 'ring-2 ring-blue-500 shadow-2xl'
                                        : 'hover:shadow-xl'
                                    } ${hoveredIndex === index ? 'scale-105' : ''
                                    }`}
                            >
                                {/* Popular badge */}
                                {pkg.popular && (
                                    <motion.div
                                        animate={{ rotate: [0, 5, 0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-4 -right-4"
                                    >
                                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 shadow-lg">
                                            <Sparkles className="w-4 h-4 inline mr-1" />
                                            Most Popular
                                        </Badge>
                                    </motion.div>
                                )}

                                {/* Package name */}
                                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                                <p className="text-gray-600 text-sm mb-6">{pkg.timeline}</p>

                                {/* Pricing */}
                                <div className="mb-6">
                                    {pkg.discount && (
                                        <Badge variant="secondary" className="mb-2">
                                            {pkg.discount}
                                        </Badge>
                                    )}

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-blue-600">
                                            ₹{pkg.price.toLocaleString()}
                                        </span>
                                        {pkg.originalPrice && (
                                            <span className="text-xl text-gray-400 line-through">
                                                ₹{pkg.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 mt-1">+ Govt. Fee</p>

                                    {pkg.emiAvailable && (
                                        <Badge variant="outline" className="mt-2">
                                            EMI Available
                                        </Badge>
                                    )}
                                </div>

                                {/* Inclusions */}
                                <ul className="space-y-3 mb-8">
                                    {pkg.inclusions.map((item, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-start gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    onClick={() => onSelectPackage(pkg)}
                                    className={`w-full ${pkg.popular
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-900 hover:bg-gray-800'
                                        }`}
                                    size="lg"
                                >
                                    {pkg.cta}
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Guarantee note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-8 text-sm text-gray-600"
                >
                    <p>💯 100% Money Back Guarantee if not satisfied</p>
                </motion.div>
            </div>
        </section>
    )
}
