import { ProcessStep } from '@/data/services'
import {
    FileText, Search, Edit, Send, CheckCircle, Bell, Award,
    ClipboardCheck, Upload, CreditCard, Clock, ArrowRight
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FileText,
    Search,
    Edit,
    Send,
    CheckCircle,
    Bell,
    Award,
    ClipboardCheck,
    Upload,
    CreditCard,
    Clock,
    ArrowRight
}

interface ProcessSectionNewProps {
    title?: string
    description?: string
    steps: ProcessStep[]
}

export function ProcessSectionNew({ title = "Registration Process", description, steps }: ProcessSectionNewProps) {
    return (
        <section id="process" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{title}</h2>

            {description && (
                <p className="text-neutral-600 mb-6">{description}</p>
            )}

            <div className="relative">
                {/* Desktop Timeline */}
                <div className="hidden md:block">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-500 to-brand-200" />

                    <div className="space-y-0">
                        {steps.map((step, i) => {
                            const IconComponent = step.icon ? iconMap[step.icon] : CheckCircle

                            return (
                                <div key={i} className="relative flex gap-6 pb-8 last:pb-0">
                                    {/* Step number circle */}
                                    <div className="relative z-10 w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-600/20">
                                        <span className="text-white font-bold">{step.step}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-5 hover:border-brand-200 hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-4">
                                            {IconComponent && (
                                                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <IconComponent className="h-5 w-5 text-brand-600" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-neutral-900 mb-1">{step.title}</h3>
                                                <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
                                                {step.duration && (
                                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded text-xs text-neutral-500">
                                                        <Clock className="h-3 w-3" />
                                                        {step.duration}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden space-y-4">
                    {steps.map((step, i) => {
                        const IconComponent = step.icon ? iconMap[step.icon] : CheckCircle

                        return (
                            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">{step.step}</span>
                                    </div>
                                    <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed pl-11">{step.description}</p>
                                {step.duration && (
                                    <div className="mt-2 ml-11 inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded text-xs text-neutral-500">
                                        <Clock className="h-3 w-3" />
                                        {step.duration}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
