import { BenefitsSection as BenefitsType } from '@/data/services'
import {
    Shield, Clock, Users, Award, HeadphonesIcon, FileCheck,
    Zap, CheckCircle, Star, TrendingUp, Lock, Sparkles
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Shield,
    Clock,
    Users,
    Award,
    HeadphonesIcon,
    FileCheck,
    Zap,
    CheckCircle,
    Star,
    TrendingUp,
    Lock,
    Sparkles
}

interface BenefitsSectionProps {
    data: BenefitsType
}

export function BenefitsSection({ data }: BenefitsSectionProps) {
    return (
        <section id="why-us" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{data.title}</h2>

            {data.description && (
                <p className="text-neutral-600 mb-6">{data.description}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
                {data.items.map((item, i) => {
                    const IconComponent = item.icon ? iconMap[item.icon] : CheckCircle

                    return (
                        <div
                            key={i}
                            className="p-5 bg-gradient-to-br from-brand-50/50 to-white rounded-xl border border-brand-100/50"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {IconComponent && <IconComponent className="h-5 w-5 text-brand-600" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 py-6 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span>Expert Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Clock className="h-5 w-5 text-brand-600" />
                    <span>Quick Processing</span>
                </div>
            </div>
        </section>
    )
}
