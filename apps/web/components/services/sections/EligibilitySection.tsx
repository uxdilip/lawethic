import { EligibilitySection as EligibilityType } from '@/data/services'
import {
    User, Users, Store, Building, Building2,
    Landmark, Globe, Heart, Briefcase
} from 'lucide-react'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    User,
    Users,
    Store,
    Handshake: Briefcase, // Handshake not available in lucide, use Briefcase
    Building,
    Building2,
    Landmark,
    Globe,
    Heart,
    Briefcase
}

interface EligibilitySectionProps {
    data: EligibilityType
}

export function EligibilitySection({ data }: EligibilitySectionProps) {
    return (
        <section id="eligibility" className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">{data.title}</h2>

            {data.description && (
                <p className="text-neutral-600 mb-6">{data.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4">
                {data.entities.map((entity, i) => {
                    const IconComponent = entity.icon ? iconMap[entity.icon] : User

                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-neutral-200 flex-shrink-0">
                                {IconComponent && <IconComponent className="h-5 w-5 text-brand-600" />}
                            </div>
                            <span className="text-sm font-medium text-neutral-700">{entity.name}</span>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
