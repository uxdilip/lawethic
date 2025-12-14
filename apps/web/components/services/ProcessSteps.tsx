'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ProcessStep } from '@/types/service-content'
import { useRef } from 'react'

interface ProcessStepsProps {
    steps: ProcessStep[]
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    })

    const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

    return (
        <section ref={containerRef} className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-gray-600 text-lg">
                        Simple, transparent process from start to finish
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Progress line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2">
                        <motion.div
                            style={{ height: lineHeight }}
                            className="w-full bg-blue-600"
                        />
                    </div>

                    {/* Steps */}
                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`flex gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}
                            >
                                {/* Content */}
                                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 ml-16 md:ml-0">
                                    <div className="flex items-start gap-4">
                                        {/* Step number - visible on mobile */}
                                        <div className="md:hidden">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                whileInView={{ scale: 1 }}
                                                viewport={{ once: true }}
                                                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
                                            >
                                                {step.step}
                                            </motion.div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                            <p className="text-gray-600 mb-3">{step.description}</p>
                                            <Badge variant="secondary">⏱️ {step.duration}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Step number - desktop */}
                                <div className="hidden md:flex items-center justify-center w-16">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg relative z-10"
                                    >
                                        {step.step}
                                    </motion.div>
                                </div>

                                {/* Spacer for alternating layout */}
                                <div className="hidden md:block flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
