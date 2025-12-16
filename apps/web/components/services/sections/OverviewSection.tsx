import { OverviewSection as OverviewType } from '@/data/services'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface OverviewSectionProps {
    data: OverviewType
}

export function OverviewSection({ data }: OverviewSectionProps) {
    return (
        <section id="overview" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">{data.title}</h2>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Content */}
                <div className="lg:col-span-2">
                    {/* Description with markdown-like formatting */}
                    <div
                        className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed"
                        dangerouslySetInnerHTML={{
                            __html: data.description
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n\n/g, '</p><p class="mt-4">')
                                .replace(/^/, '<p>')
                                .replace(/$/, '</p>')
                        }}
                    />

                    {/* Highlights */}
                    {data.highlights && data.highlights.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Key Benefits</h3>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                {data.highlights.map((highlight, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-neutral-700 text-sm">{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Illustration */}
                {data.image && (
                    <div className="hidden lg:flex items-start justify-center">
                        <div className="w-full max-w-[280px] aspect-square bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
                            {/* Placeholder - replace with actual image when available */}
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-neutral-400">Illustration placeholder</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
